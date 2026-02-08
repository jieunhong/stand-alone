import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { getLocalISODate } from '../lib/date';
import { AppIcon } from './AppIcon';

interface OnboardingProps {
  onSubmit: (goal: { text: string; duration: number; startDate: string }) => void;
}

export function Onboarding({ onSubmit }: OnboardingProps) {
  const [goalText, setGoalText] = useState('');
  const [duration, setDuration] = useState<number | null>(null);

  const handleSubmit = () => {
    if (goalText.trim() && duration) {
      onSubmit({
        text: goalText.trim(),
        duration,
        startDate: getLocalISODate(),
      });
    }
  };

  const durationOptions = [
    { value: 10, label: '10일' },
    { value: 30, label: '30일' },
    { value: 100, label: '100일' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] flex items-center justify-center px-5 max-w-md mx-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Dotted pattern background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #A8E6A3 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative bg-white/80 backdrop-blur-sm rounded-[32px] shadow-2xl p-8 border-2 border-white/50 w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="transform hover:scale-110 transition-transform">
            <AppIcon size={80} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          자립 여정을 시작하세요
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed">
          나만의 자립 목표를 설정하고<br />체계적으로 성장을 관리해보세요
        </p>

        <div className="space-y-6">
          {/* Goal Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ✨ 자립 목표
            </label>
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="예: 혼자서도 건강한 삶을 영위하기"
              className="w-full px-4 py-3.5 bg-white/90 border-2 border-gray-100 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent resize-none text-sm shadow-sm placeholder:text-gray-400"
              rows={2}
            />
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ⏰ 목표 기간
            </label>
            <div className="grid grid-cols-3 gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`py-4 px-3 rounded-[20px] transition-all duration-200 font-semibold text-sm shadow-md ${duration === option.value
                    ? 'bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] text-white shadow-lg scale-110 border-2 border-white'
                    : 'bg-white/90 text-gray-600 border-2 border-gray-100 hover:border-[#A8E6A3] hover:scale-105'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!goalText.trim() || !duration}
            className={`w-full py-4 rounded-[24px] font-bold transition-all duration-300 text-sm shadow-xl ${goalText.trim() && duration
              ? 'bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] text-white hover:shadow-2xl hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            🌱 시작하기
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6 leading-relaxed">
          매일의 작은 실천이<br />큰 변화를 만듭니다 💚
        </p>
      </div>
    </div>
  );
}