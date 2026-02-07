import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { getLocalISODate } from '../lib/date';

interface DailyCheckProps {
  onSubmit: (data: {
    date: string;
    sleep: number;
    nutrition: number;
    distress: number;
    impulse: number;
    exercise: number;
    score: number;
    diary?: string;
  }) => void;
  existingCheck?: {
    date: string;
    sleep: number;
    nutrition: number;
    distress: number;
    impulse: number;
    exercise: number;
    score: number;
    diary?: string;
  };
}

interface CheckItem {
  id: string;
  label: string;
  emoji: string;
  reverse?: boolean;
}

export function DailyCheck({ onSubmit, existingCheck }: DailyCheckProps) {
  const [sleep, setSleep] = useState(0);
  const [nutrition, setNutrition] = useState(0);
  const [distress, setDistress] = useState(0);
  const [impulse, setImpulse] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [diary, setDiary] = useState('');

  // Use existingCheck.date or fallback to today
  const targetDate = existingCheck?.date || getLocalISODate();

  useEffect(() => {
    if (existingCheck && 'sleep' in existingCheck) {
      setSleep(existingCheck.sleep);
      setNutrition(existingCheck.nutrition);
      setDistress(existingCheck.distress);
      setImpulse(existingCheck.impulse);
      setExercise(existingCheck.exercise);
      setDiary(existingCheck.diary || '');
    } else {
      // Reset if no existing check or just a date placeholder
      setSleep(0);
      setNutrition(0);
      setDistress(0);
      setImpulse(0);
      setExercise(0);
      setDiary('');
    }
  }, [existingCheck, targetDate]);

  const checkItems: CheckItem[] = [
    { id: 'sleep', label: '수면', emoji: '😴' },
    { id: 'nutrition', label: '식사', emoji: '🍽️' },
    { id: 'distress', label: '괴로움', emoji: '😰', reverse: true },
    { id: 'impulse', label: '충동', emoji: '🛍️', reverse: true },
    { id: 'exercise', label: '운동', emoji: '🚶' },
  ];

  const values = { sleep, nutrition, distress, impulse, exercise };
  const setters = { sleep: setSleep, nutrition: setNutrition, distress: setDistress, impulse: setImpulse, exercise: setExercise };

  const calculateScore = () => {
    let total = sleep + nutrition + exercise;
    total += (6 - distress);
    total += (6 - impulse);
    return Math.round((total / 25) * 100);
  };

  const handleSubmit = () => {
    const allFilled = Object.values(values).every(v => v > 0);
    if (!allFilled) return;

    onSubmit({
      date: targetDate,
      sleep,
      nutrition,
      distress,
      impulse,
      exercise,
      score: calculateScore(),
      diary: diary.trim() || undefined,
    });
  };

  const allFilled = Object.values(values).every(v => v > 0);

  const displayDate = new Date(targetDate);

  return (
    <div className="flex flex-col p-5 gap-4">
      {/* Date with soft background */}
      <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl py-3 px-4 shadow-sm">
        <p className="text-sm text-gray-600 font-medium">
          {displayDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      </div>

      {/* Check Items - Soft Cards */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
        <div className="space-y-5">
          {checkItems.map((item) => {
            const value = values[item.id as keyof typeof values];
            const setter = setters[item.id as keyof typeof setters];

            return (
              <div key={item.id} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E9] flex items-center justify-center shadow-sm">
                      <span className="text-xl">{item.emoji}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  {item.reverse && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">낮을수록↓</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setter(level)}
                      className={`flex-1 h-12 rounded-2xl transition-all duration-200 text-sm font-semibold ${value === level
                        ? 'bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] text-white shadow-lg scale-110 border-2 border-white'
                        : 'bg-white/80 text-gray-400 border-2 border-gray-100 hover:border-[#A8E6A3] hover:scale-105'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Display - Glowing Card */}
      {allFilled && (
        <div className="bg-gradient-to-br from-[#A8E6A3] via-[#7DD87D] to-[#6BC76B] rounded-3xl p-5 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">오늘의 점수</span>
            </div>
            <span className="text-4xl font-bold drop-shadow-lg">{calculateScore()}</span>
          </div>
        </div>
      )}

      {/* Diary Input - Soft Textarea */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50 flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          ✨ 오늘의 한 줄
        </label>
        <textarea
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          placeholder="오늘 하루를 짧게 기록해보세요..."
          className="w-full h-32 px-4 py-3 bg-white/80 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent resize-none text-sm placeholder:text-gray-400"
          maxLength={100}
        />
        <div className="text-xs text-gray-400 mt-2 text-right bg-gray-50 rounded-full px-3 py-1 inline-block ml-auto">
          {diary.length}/100
        </div>
      </div>

      {/* Submit Button - Floating Feel */}
      <button
        onClick={handleSubmit}
        disabled={!allFilled}
        className={`w-full py-4 rounded-3xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${allFilled
          ? 'bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] text-white hover:shadow-2xl hover:scale-105 active:scale-95'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        <Check className="w-5 h-5" />
        {existingCheck ? '✨ 수정 완료' : '✨ 체크 완료'}
      </button>
    </div>
  );
}
