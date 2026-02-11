import React, { useEffect } from 'react';
import { Award, Flame, Star, Trophy, TrendingUp, Sparkles, Heart, Zap } from 'lucide-react';
import { DailyCheckData, Goal } from '../App';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedDate?: string;
    type: 'streak' | 'score' | 'milestone';
}

interface AchievementsProps {
    dailyChecks: DailyCheckData[];
    goal: Goal;
    lastCheckedAchievements: string[];
    setLastCheckedAchievements: (achievements: string[]) => void;
    setCelebrationData: (data: {
        show: boolean;
        achievement: { title: string; description: string; icon: string } | null;
    }) => void;
}

export function Achievements({
    dailyChecks,
    goal,
    lastCheckedAchievements,
    setLastCheckedAchievements,
    setCelebrationData
}: AchievementsProps) {
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            flame: Flame,
            star: Star,
            trophy: Trophy,
            award: Award,
            trendingUp: TrendingUp,
            sparkles: Sparkles,
            heart: Heart,
            zap: Zap,
        };
        const IconComponent = icons[iconName] || Award;
        return IconComponent;
    };

    // 연속 체크인 계산
    const getConsecutiveDays = () => {
        if (dailyChecks.length === 0) return 0;

        const sortedChecks = [...dailyChecks].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let consecutive = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedChecks.length; i++) {
            const checkDate = new Date(sortedChecks[i].date);
            checkDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (checkDate.getTime() === expectedDate.getTime()) {
                consecutive++;
            } else {
                break;
            }
        }

        return consecutive;
    };

    // 평균 점수 계산
    const getAverageScore = () => {
        if (dailyChecks.length === 0) return 0;
        const total = dailyChecks.reduce((sum, check) => sum + check.score, 0);
        return total / dailyChecks.length;
    };

    // 최근 7일 평균
    const getRecentAverageScore = () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentChecks = dailyChecks.filter(check =>
            new Date(check.date) >= sevenDaysAgo
        );

        if (recentChecks.length === 0) return 0;
        const total = recentChecks.reduce((sum, check) => sum + check.score, 0);
        return total / recentChecks.length;
    };

    const consecutiveDays = getConsecutiveDays();
    const averageScore = getAverageScore();
    const recentAverage = getRecentAverageScore();
    const totalChecks = dailyChecks.length;

    // 배지 정의
    const achievements: Achievement[] = [
        // 연속 체크인 배지
        {
            id: 'streak_3',
            title: '첫 발걸음',
            description: '3일 연속 체크인',
            icon: 'flame',
            unlocked: consecutiveDays >= 3,
            type: 'streak',
        },
        {
            id: 'streak_7',
            title: '한 주 완주',
            description: '7일 연속 체크인',
            icon: 'star',
            unlocked: consecutiveDays >= 7,
            type: 'streak',
        },
        {
            id: 'streak_14',
            title: '꾸준함의 힘',
            description: '14일 연속 체크인',
            icon: 'trophy',
            unlocked: consecutiveDays >= 14,
            type: 'streak',
        },
        {
            id: 'streak_30',
            title: '한 달의 여정',
            description: '30일 연속 체크인',
            icon: 'award',
            unlocked: consecutiveDays >= 30,
            type: 'streak',
        },
        // 점수 배지
        {
            id: 'score_good',
            title: '긍정적인 변화',
            description: '평균 3.5점 이상 유지',
            icon: 'trendingUp',
            unlocked: averageScore >= 3.5,
            type: 'score',
        },
        {
            id: 'score_great',
            title: '안정적인 일상',
            description: '평균 4점 이상 유지',
            icon: 'sparkles',
            unlocked: averageScore >= 4.0,
            type: 'score',
        },
        {
            id: 'recent_excellent',
            title: '최근 컨디션 최고',
            description: '최근 7일 평균 4점 이상',
            icon: 'zap',
            unlocked: recentAverage >= 4.0,
            type: 'score',
        },
        // 마일스톤 배지
        {
            id: 'milestone_10',
            title: '꾸준한 기록',
            description: '10일 기록 달성',
            icon: 'heart',
            unlocked: totalChecks >= 10,
            type: 'milestone',
        },
        {
            id: 'milestone_30',
            title: '한 달 성장',
            description: '30일 기록 달성',
            icon: 'trophy',
            unlocked: totalChecks >= 30,
            type: 'milestone',
        },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // 새로운 배지 체크
    useEffect(() => {
        const newUnlockedAchievements = achievements.filter(
            a => a.unlocked && !lastCheckedAchievements.includes(a.id)
        );

        if (newUnlockedAchievements.length > 0) {
            // 첫 번째 새 배지만 표시
            const firstNew = newUnlockedAchievements[0];
            setCelebrationData({
                show: true,
                achievement: {
                    title: firstNew.title,
                    description: firstNew.description,
                    icon: firstNew.icon,
                },
            });

            // 모든 새 배지를 체크됨으로 표시
            const updatedChecked = [
                ...lastCheckedAchievements,
                ...newUnlockedAchievements.map(a => a.id),
            ];
            setLastCheckedAchievements(updatedChecked);
            localStorage.setItem('lastCheckedAchievements', JSON.stringify(updatedChecked));
        }
    }, [achievements.length, consecutiveDays, totalChecks, averageScore]);

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
                    <div className="text-2xl font-bold text-gray-800">{averageScore.toFixed(1)}</div>
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