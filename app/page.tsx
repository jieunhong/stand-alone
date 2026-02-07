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

// Type definitions to match component props
export type Goal = Omit<GoalDoc, 'id'>;
export type DailyCheckData = DailyCheckDoc;

export default function Home() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [dailyChecks, setDailyChecks] = useState<DailyCheckData[]>([]);
  const [currentView, setCurrentView] = useState<'daily' | 'calendar' | 'stats'>('daily');
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

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
                diary: check.diary
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

    return () => {
      if (goalSub) goalSub.unsubscribe();
      if (checkSub) checkSub.unsubscribe();
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

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
          ...checkData,
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

  const getTodayCheck = () => {
    const today = getLocalISODate();
    return dailyChecks.find(c => c.date === today);
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

  if (!isLoaded) {
    // Loading state
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#A8E6A3] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
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

  const remainingDays = getRemainingDays();
  const todayCheck = getTodayCheck();

  return (
    <div className="h-dvh bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E0E0E0]/50 flex-shrink-0 shadow-sm">
        <div className="px-5 py-4">
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
            existingCheck={todayCheck}
          />
        )}
        {currentView === 'calendar' && (
          <ProgressCalendar
            goal={goal}
            dailyChecks={dailyChecks}
          />
        )}
        {currentView === 'stats' && (
          <Statistics
            dailyChecks={dailyChecks}
            goal={goal}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-t border-[#E0E0E0]/50 flex-shrink-0 shadow-lg">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button
            onClick={() => setCurrentView('daily')}
            className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${currentView === 'daily'
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
        </div>
      </nav>
    </div>
  );
}
