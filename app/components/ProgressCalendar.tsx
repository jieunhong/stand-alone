import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalISODate } from '../lib/date';

interface ProgressCalendarProps {
  goal: {
    text: string;
    duration: number;
    startDate: string;
  };
  dailyChecks: Array<{
    date: string;
    score: number;
  }>;
}

export function ProgressCalendar({ goal, dailyChecks }: ProgressCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getEndDateStr = () => {
    const start = new Date(goal.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + goal.duration - 1); // duration includes start date
    return end.toISOString().split('T')[0];
  };
  const endDateStr = getEndDateStr();

  const getScoreForDate = (date: Date) => {
    const dateStr = getLocalISODate(date);
    const check = dailyChecks.find(c => c.date === dateStr);
    return check?.score || 0;
  };

  const getColorIntensity = (score: number) => {
    if (score === 0) return 'bg-[#F5F5F5]';
    if (score < 40) return 'bg-[#A8E6A3] bg-opacity-30';
    if (score < 60) return 'bg-[#A8E6A3] bg-opacity-50';
    if (score < 80) return 'bg-[#7DD87D] bg-opacity-70';
    return 'bg-[#7DD87D]';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isWithinGoalPeriod = (date: Date) => {
    const dateStr = getLocalISODate(date);
    return dateStr >= goal.startDate && dateStr <= endDateStr;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const totalChecks = dailyChecks.length;
  const averageScore = totalChecks > 0
    ? Math.round(dailyChecks.reduce((sum, check) => sum + check.score, 0) / totalChecks)
    : 0;

  return (
    <div className="p-5 space-y-4">
      {/* Summary Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-4 bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E9] rounded-2xl shadow-sm">
            <div className="text-3xl font-bold text-[#7DD87D] mb-1">{totalChecks}</div>
            <div className="text-xs text-gray-500">체크한 날</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E9] rounded-2xl shadow-sm">
            <div className="text-3xl font-bold text-[#7DD87D] mb-1">{averageScore}</div>
            <div className="text-xs text-gray-500">평균 점수</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={goToPreviousMonth}
            className="p-2.5 bg-white rounded-2xl hover:bg-gradient-to-br hover:from-[#A8E6A3] hover:to-[#7DD87D] hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800 text-sm">
            {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2.5 bg-white rounded-2xl hover:bg-gradient-to-br hover:from-[#A8E6A3] hover:to-[#7DD87D] hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-bold py-2 rounded-xl ${index === 0 ? 'text-red-400 bg-red-50' : index === 6 ? 'text-blue-400 bg-blue-50' : 'text-gray-500 bg-gray-50'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const score = getScoreForDate(day);
            const withinPeriod = isWithinGoalPeriod(day);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 shadow-sm ${withinPeriod ? getColorIntensity(score) : 'bg-gray-50'
                  } ${today ? 'ring-4 ring-[#7DD87D] ring-offset-2 scale-110' : 'hover:scale-105'}`}
              >
                <span className={`text-sm font-semibold ${score > 60 ? 'text-white' : 'text-gray-700'}`}>
                  {day.getDate()}
                </span>
                {score > 0 && (
                  <span className={`text-[10px] font-bold ${score > 60 ? 'text-white/90' : 'text-gray-600'}`}>
                    {score}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t-2 border-gray-100">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-lg bg-gray-50 border-2 border-gray-200 shadow-sm" />
              <span className="text-[10px] font-medium">미체크</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-lg bg-[#A8E6A3] bg-opacity-30 shadow-sm" />
              <span className="text-[10px] font-medium">낮음</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-lg bg-[#7DD87D] shadow-sm" />
              <span className="text-[10px] font-medium">높음</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}