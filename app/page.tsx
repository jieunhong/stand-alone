"use client";

import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { DailyCheck } from './components/DailyCheck';
import { ProgressCalendar } from './components/ProgressCalendar';
import { Statistics } from './components/Statistics';
import { Menu, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { getDatabase, clearDatabase, type DailyCheckDoc, type GoalDoc } from './lib/db';
import { Subscription } from 'rxjs';
import { getLocalISODate } from './lib/date';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Session } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Splash } from './components/Splash';
import { OnboardingTour } from './components/OnboardingTour';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Achievements } from './components/Achievements';
import { CelebrationDialog } from './components/CelebrationDialog';
import { Trophy } from 'lucide-react';
import { getAchievements } from './lib/achievements';
import { type AchievementDefinitionDoc } from './lib/db';

// Type definitions to match component props
export type Goal = Omit<GoalDoc, 'id'>;
export type DailyCheckData = DailyCheckDoc;

export default function Home() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [dailyChecks, setDailyChecks] = useState<DailyCheckData[]>([]);
  const [currentView, setCurrentView] = useState<'daily' | 'calendar' | 'stats' | 'achievements'>('daily');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [achievementDefinitions, setAchievementDefinitions] = useState<AchievementDefinitionDoc[]>([]);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);

  // Achievements state
  const [celebrationData, setCelebrationData] = useState<{
    show: boolean;
    achievement: { title: string; description: string; icon: string } | null;
  }>({ show: false, achievement: null });

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return subscription;
    };

    let goalSub: Subscription;
    let checkSub: Subscription;
    let authSubscription: any;
    let defSub: Subscription;

    const initDB = async (currentSession: Session | null) => {
      try {
        const userId = currentSession?.user.id || 'guest';
        const db = await getDatabase(userId);

        if (currentSession) {
          // Fetch existing data from Supabase - Ensure we get EVERYTHING
          const { data: goalData, error: goalError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();

          if (goalData && !goalError) {
            await db.goals.upsert({
              id: 'current',
              text: goalData.text,
              duration: goalData.duration,
              startDate: goalData.start_date
            });
          }

          const { data: checkData, error: checkError } = await supabase
            .from('daily_checks')
            .select('*')
            .eq('user_id', currentSession.user.id);

          if (checkData && !checkError) {
            // Bulk upsert would be better if RXDB supported it easily, 
            // but for now, we iterate to ensure local DB matches remote.
            for (const check of checkData) {
              await db.daily_checks.upsert({
                date: check.date,
                sleep: check.sleep,
                nutrition: check.nutrition,
                distress: check.distress,
                impulse: check.impulse,
                exercise: check.exercise,
                score: check.score,
                diary: check.diary || undefined,
                tomorrowResolve: check.tomorrow_resolve || undefined
              });
            }
          }

          const { data: achievementData, error: achievementError } = await supabase
            .from('unlocked_achievements')
            .select('*')
            .eq('user_id', currentSession.user.id);

          if (achievementData && !achievementError) {
            for (const ach of achievementData) {
              await db.unlocked_achievements.upsert({
                id: ach.achievement_id,
                unlockedAt: ach.unlocked_at
              });
            }
          }

          // Fetch Achievement Definitions
          const { data: defData, error: defError } = await supabase
            .from('achievement_definitions')
            .select('*')
            .order('id', { ascending: false });

          if (defData && !defError) {
            for (const def of defData) {
              await db.achievement_definitions.upsert({
                id: def.id,
                title: def.title,
                description: def.description,
                icon: def.icon,
                type: def.type,
                targetValue: def.target_value,
                displayOrder: def.display_order
              });
            }
          }
        }

        // Subscribe to goal changes
        goalSub = db.goals.findOne('current').$.subscribe(doc => {
          if (doc) {
            setGoal({
              text: doc.text,
              duration: doc.duration,
              startDate: doc.startDate
            });
          } else {
            setGoal(null);
          }
        });

        // Subscribe to daily checks changes
        checkSub = db.daily_checks.find().$.subscribe(docs => {
          const checks = docs.map(doc => doc.toJSON());
          setDailyChecks(checks);
        });

        // Subscribe to Definitions
        defSub = db.achievement_definitions.find({
          sort: [{ displayOrder: 'desc' }]
        }).$.subscribe(docs => {
          setAchievementDefinitions(docs.map(d => d.toJSON()));
        });

        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to initialize DB:", err);
        setIsLoaded(true);
      }
    };

    const runInit = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) initDB(session);
      });
      authSubscription = subscription;

      initDB(initialSession);
    };

    runInit();

    // Show splash for at least 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      if (goalSub) goalSub.unsubscribe();
      if (checkSub) checkSub.unsubscribe();
      if (authSubscription) authSubscription.unsubscribe();
      if (defSub) defSub.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Global achievement monitor
  useEffect(() => {
    if (!isLoaded || !dailyChecks.length || !achievementDefinitions.length) return;

    const runMonitor = async () => {
      const db = await getDatabase(session?.user.id);
      const unlockedDocs = await db.unlocked_achievements.find().exec();
      const unlockedIds = unlockedDocs.map(d => d.id);

      const allAchievements = getAchievements(dailyChecks, goal, achievementDefinitions);
      const newUnlockedAchievements = allAchievements.filter(
        a => a.unlocked && !unlockedIds.includes(a.id)
      );

      if (newUnlockedAchievements.length > 0) {
        const firstNew = newUnlockedAchievements[0];

        // 1. Show celebration
        setCelebrationData({
          show: true,
          achievement: {
            title: firstNew.title,
            description: firstNew.description,
            icon: firstNew.icon,
          },
        });

        // 2. Save to RxDB
        await db.unlocked_achievements.upsert({
          id: firstNew.id,
          unlockedAt: new Date().toISOString()
        });

        // 3. Save to Supabase
        if (session) {
          await supabase.from('unlocked_achievements').upsert({
            user_id: session.user.id,
            achievement_id: firstNew.id,
            unlocked_at: new Date().toISOString()
          }, { onConflict: 'user_id,achievement_id' });
        }
      }
    };

    runMonitor();
  }, [dailyChecks, isLoaded, goal, session, achievementDefinitions]);

  // Check if user has completed onboarding tour
  useEffect(() => {
    if (goal && isLoaded && !showSplash) {
      const tourCompleted = localStorage.getItem('onboarding_tour_completed');
      if (!tourCompleted) {
        // Small delay to let the main UI render first
        setTimeout(() => {
          setShowOnboardingTour(true);
        }, 500);
      }
    }
  }, [goal, isLoaded, showSplash]);

  const handleGoalSubmit = async (goalData: Goal) => {
    try {
      if (session) {
        const { error } = await supabase.from('goals').upsert({
          user_id: session.user.id,
          text: goalData.text,
          duration: goalData.duration,
          start_date: goalData.startDate,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
        if (error) throw error;
      }

      const db = await getDatabase(session?.user.id);
      await db.goals.upsert({
        id: 'current',
        ...goalData
      });
      toast.success('목표가 설정되었습니다!');
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error('목표 저장에 실패했습니다.');
    }
  };

  const handleDailyCheckSubmit = async (checkData: DailyCheckData) => {
    try {
      if (session) {
        const { error } = await supabase.from('daily_checks').upsert({
          user_id: session.user.id,
          date: checkData.date,
          sleep: checkData.sleep,
          nutrition: checkData.nutrition,
          distress: checkData.distress,
          impulse: checkData.impulse,
          exercise: checkData.exercise,
          score: checkData.score,
          diary: checkData.diary,
          tomorrow_resolve: checkData.tomorrowResolve,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date'
        });
        if (error) throw error;
      }

      const db = await getDatabase(session?.user.id);
      await db.daily_checks.upsert(checkData);
      toast.success('오늘의 체크가 저장되었습니다!');
    } catch (error) {
      console.error("Failed to save daily check:", error);
      toast.error('저장에 실패했습니다.');
    }
  };

  const getViewingCheck = () => {
    const date = selectedDate || getLocalISODate();
    return dailyChecks.find(c => c.date === date);
  };

  const getRemainingDays = () => {
    if (!goal) return 0;
    const start = new Date(goal.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + goal.duration);
    const today = new Date();
    const remaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  };

  const getPreviousResolve = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    const prevDateStr = getLocalISODate(date);
    const prevCheck = dailyChecks.find(c => c.date === prevDateStr);
    return prevCheck?.tomorrowResolve;
  };

  if (showSplash || !isLoaded) {
    return <Splash />;
  }

  if (!session) {
    return <Auth />;
  }

  if (!goal) {
    return <Onboarding onSubmit={handleGoalSubmit} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearDatabase();
    setGoal(null);
    setDailyChecks([]);
    toast.success('로그아웃되었습니다.');
  };

  const handleTourComplete = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setShowOnboardingTour(false);
    toast.success('가이드를 완료했습니다! 🎉');
  };

  const handleTourSkip = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setShowOnboardingTour(false);
  };

  const remainingDays = getRemainingDays();
  const viewingCheck = getViewingCheck();

  return (
    <div className="h-dvh bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E0E0E0]/50 flex-shrink-0 shadow-sm safe-top">
        <div className="px-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-gray-800 truncate">자립 여정</h1>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{goal.text}</p>
            </div>
            <div className="text-right flex-shrink-0 bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] rounded-2xl px-4 py-2 shadow-md">
              <div className="text-2xl font-bold text-white">D-{remainingDays}</div>
              <p className="text-xs text-white/80">{goal.duration - remainingDays}/{goal.duration}일</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'daily' && (
          <DailyCheck
            onSubmit={handleDailyCheckSubmit}
            existingCheck={viewingCheck}
            previousResolve={getPreviousResolve(selectedDate || getLocalISODate())}
          />
        )}
        {currentView === 'calendar' && (
          <>
            <ProgressCalendar
              goal={goal}
              dailyChecks={dailyChecks}
              onSelectDate={(date) => {
                setSelectedDate(date);
              }}
            />
            {/* Modal for Past Records */}
            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
              <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-white/50 bg-[#F8F9FA]/95 backdrop-blur-xl shadow-2xl rounded-[40px]">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-xl font-bold text-gray-800 text-center flex flex-col items-center gap-1">
                    <span className="text-[#7DD87D]">자립 기록</span>
                    <span className="text-xs font-medium text-gray-400">내역을 확인하고 수정할 수 있습니다</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[75dvh] overflow-y-auto custom-scrollbar px-2 mb-4">
                  <DailyCheck
                    onSubmit={(data) => {
                      handleDailyCheckSubmit(data);
                      setSelectedDate(null);
                    }}
                    existingCheck={viewingCheck || (selectedDate ? { date: selectedDate } as any : undefined)}
                    previousResolve={getPreviousResolve(selectedDate || getLocalISODate())}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        {currentView === 'stats' && (
          <Statistics
            dailyChecks={dailyChecks}
            goal={goal}
          />
        )}
        {currentView === 'achievements' && (
          <Achievements
            dailyChecks={dailyChecks}
            goal={goal}
            achievementDefinitions={achievementDefinitions}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-t border-[#E0E0E0]/50 flex-shrink-0 shadow-lg safe-bottom">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => {
              setSelectedDate(null);
              setCurrentView('daily');
            }}
            className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${currentView === 'daily' && !selectedDate
              ? 'text-white bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] shadow-lg scale-105'
              : 'text-gray-400 hover:bg-[#F5F5F5]'
              }`}
          >
            <CheckCircle className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">일일 체크</span>
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${currentView === 'calendar'
              ? 'text-white bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] shadow-lg scale-105'
              : 'text-gray-400 hover:bg-[#F5F5F5]'
              }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">캘린더</span>
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${currentView === 'stats'
              ? 'text-white bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] shadow-lg scale-105'
              : 'text-gray-400 hover:bg-[#F5F5F5]'
              }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">통계</span>
          </button>
          <button
            onClick={() => setCurrentView('achievements')}
            className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${currentView === 'achievements'
              ? 'text-white bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] shadow-lg scale-105'
              : 'text-gray-400 hover:bg-[#F5F5F5]'
              }`}
          >
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">업적</span>
          </button>
        </div>
      </nav>

      {/* Celebration Dialog */}
      <CelebrationDialog
        open={celebrationData.show}
        onClose={() => setCelebrationData({ ...celebrationData, show: false })}
        achievement={celebrationData.achievement}
      />

      {/* Onboarding Tour */}
      {showOnboardingTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </div>
  );
}
