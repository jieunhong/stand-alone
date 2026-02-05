"use client";

import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { DailyCheck } from './components/DailyCheck';
import { ProgressCalendar } from './components/ProgressCalendar';
import { Statistics } from './components/Statistics';
import { Menu, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { getDatabase, type DailyCheckDoc, type GoalDoc } from './lib/db';
import { Subscription } from 'rxjs';

// Type definitions to match component props
export type Goal = Omit<GoalDoc, 'id'>;
export type DailyCheckData = DailyCheckDoc;

export default function Home() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [dailyChecks, setDailyChecks] = useState<DailyCheckData[]>([]);
  const [currentView, setCurrentView] = useState<'daily' | 'calendar' | 'stats'>('daily');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let goalSub: Subscription;
    let checkSub: Subscription;

    const initDB = async () => {
      try {
        const db = await getDatabase();

        // Subscribe to goal changes
        // We assume there is only one "current" goal for now
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
        // Fallback or error handling could be added here
        setIsLoaded(true);
      }
    };

    initDB();

    return () => {
      if (goalSub) goalSub.unsubscribe();
      if (checkSub) checkSub.unsubscribe();
    };
  }, []);

  const handleGoalSubmit = async (goalData: Goal) => {
    try {
      const db = await getDatabase();
      await db.goals.upsert({
        id: 'current',
        ...goalData
      });
    } catch (error) {
      console.error("Failed to save goal:", error);
    }
  };

  const handleDailyCheckSubmit = async (checkData: DailyCheckData) => {
    try {
      const db = await getDatabase();
      await db.daily_checks.upsert(checkData);
    } catch (error) {
      console.error("Failed to save daily check:", error);
    }
  };

  const getTodayCheck = () => {
    const today = new Date().toISOString().split('T')[0];
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

  if (!goal) {
    return <Onboarding onSubmit={handleGoalSubmit} />;
  }

  const remainingDays = getRemainingDays();
  const todayCheck = getTodayCheck();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E0E0E0]/50 flex-shrink-0 shadow-sm">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h1 className="font-semibold text-gray-800 truncate">자립 여정</h1>
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
