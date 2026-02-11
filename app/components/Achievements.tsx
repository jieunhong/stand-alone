import React, { useEffect } from 'react';
import { Award, Flame, Star, Trophy, Sparkles } from 'lucide-react';
import { DailyCheckData, Goal } from '../page';
import {
    getIconComponent,
    getConsecutiveDays,
    getAverageScore,
    getAchievements,
    Achievement
} from '../lib/achievements';

interface AchievementsProps {
    dailyChecks: DailyCheckData[];
    goal: Goal;
}

export function Achievements({
    dailyChecks,
    goal,
}: AchievementsProps) {
    const consecutiveDays = getConsecutiveDays(dailyChecks);
    const averageScore = getAverageScore(dailyChecks);
    const totalChecks = dailyChecks.length;
    const achievements = getAchievements(dailyChecks, goal);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="p-5 pb-6">
            {/* Header */}
            <div className="mb-6">
                <div className="bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-white">나의 성취</h2>
                        <Award className="w-8 h-8 text-white/90" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{unlockedCount}</span>
                        <span className="text-lg text-white/80">/ {achievements.length} 배지</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-[#E0E0E0]/50">
                    <Flame className="w-5 h-5 text-[#7DD87D] mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{consecutiveDays}</div>
                    <div className="text-xs text-gray-500 mt-1">연속 일수</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-[#E0E0E0]/50">
                    <Star className="w-5 h-5 text-[#7DD87D] mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{averageScore.toFixed(0)}</div>
                    <div className="text-xs text-gray-500 mt-1">평균 점수</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-[#E0E0E0]/50">
                    <Trophy className="w-5 h-5 text-[#7DD87D] mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{totalChecks}</div>
                    <div className="text-xs text-gray-500 mt-1">총 기록</div>
                </div>
            </div>

            {/* Achievement Grid */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 px-1 mb-3">배지 목록</h3>
                {achievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                        <div
                            key={achievement.id}
                            className={`rounded-2xl p-4 border transition-all ${achievement.unlocked
                                ? 'bg-gradient-to-br from-white to-[#F0FFF0] border-[#7DD87D]/30 shadow-md'
                                : 'bg-white/50 backdrop-blur-sm border-[#E0E0E0]/30'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`rounded-2xl p-3 flex-shrink-0 ${achievement.unlocked
                                        ? 'bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] shadow-lg'
                                        : 'bg-gray-200'
                                        }`}
                                >
                                    <IconComponent
                                        className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'
                                            }`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4
                                        className={`font-semibold mb-0.5 ${achievement.unlocked ? 'text-gray-800' : 'text-gray-400'
                                            }`}
                                    >
                                        {achievement.title}
                                    </h4>
                                    <p
                                        className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                                            }`}
                                    >
                                        {achievement.description}
                                    </p>
                                </div>
                                {achievement.unlocked && (
                                    <div className="flex-shrink-0">
                                        <div className="bg-[#7DD87D] rounded-full p-1">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Encouragement Message */}
            {consecutiveDays > 0 && (
                <div className="mt-6 bg-gradient-to-r from-[#F0FFF0] to-[#E8F5E9] rounded-2xl p-5 border border-[#7DD87D]/20">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {consecutiveDays >= 30 && "🎉 한 달 동안 꾸준히 기록하셨네요! 정말 대단해요!"}
                        {consecutiveDays >= 14 && consecutiveDays < 30 && "💪 2주 연속! 이제 습관이 되어가고 있어요!"}
                        {consecutiveDays >= 7 && consecutiveDays < 14 && "⭐ 일주일 연속 체크인! 멋진 시작이에요!"}
                        {consecutiveDays >= 3 && consecutiveDays < 7 && "🌱 3일 연속! 작은 성취가 모여 큰 변화가 돼요!"}
                        {consecutiveDays < 3 && "✨ 오늘도 기록하셨네요! 하루하루가 소중한 발걸음이에요!"}
                    </p>
                </div>
            )}
        </div>
    );
}
