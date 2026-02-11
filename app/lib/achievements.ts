import { DailyCheckData, Goal } from '../page';
import { Flame, Star, Trophy, Award, TrendingUp, Sparkles, Heart, Zap } from 'lucide-react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedDate?: string;
    type: 'streak' | 'score' | 'milestone';
}

export const getIconComponent = (iconName: string) => {
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
    return icons[iconName] || Award;
};

export const getConsecutiveDays = (dailyChecks: DailyCheckData[]) => {
    if (dailyChecks.length === 0) return 0;

    const sortedChecks = [...dailyChecks].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let consecutive = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstCheckDate = new Date(sortedChecks[0].date);
    firstCheckDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (firstCheckDate < yesterday) return 0;

    for (let i = 0; i < sortedChecks.length; i++) {
        const checkDate = new Date(sortedChecks[i].date);
        checkDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(firstCheckDate);
        expectedDate.setDate(firstCheckDate.getDate() - i);

        if (checkDate.getTime() === expectedDate.getTime()) {
            consecutive++;
        } else {
            break;
        }
    }

    return consecutive;
};

export const getAverageScore = (dailyChecks: DailyCheckData[]) => {
    if (dailyChecks.length === 0) return 0;
    const total = dailyChecks.reduce((sum, check) => sum + check.score, 0);
    return total / dailyChecks.length;
};

export const getRecentAverageScore = (dailyChecks: DailyCheckData[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentChecks = dailyChecks.filter(check =>
        new Date(check.date) >= sevenDaysAgo
    );

    if (recentChecks.length === 0) return 0;
    const total = recentChecks.reduce((sum, check) => sum + check.score, 0);
    return total / recentChecks.length;
};

export const getAchievements = (dailyChecks: DailyCheckData[], goal: Goal | null): Achievement[] => {
    const consecutiveDays = getConsecutiveDays(dailyChecks);
    const averageScore = getAverageScore(dailyChecks);
    const recentAverage = getRecentAverageScore(dailyChecks);
    const totalChecks = dailyChecks.length;

    return [
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
        {
            id: 'score_good',
            title: '긍정적인 변화',
            description: '평균 70점 이상 유지',
            icon: 'trendingUp',
            unlocked: averageScore >= 70,
            type: 'score',
        },
        {
            id: 'score_great',
            title: '안정적인 일상',
            description: '평균 80점 이상 유지',
            icon: 'sparkles',
            unlocked: averageScore >= 80,
            type: 'score',
        },
        {
            id: 'recent_excellent',
            title: '최근 컨디션 최고',
            description: '최근 7일 평균 80점 이상',
            icon: 'zap',
            unlocked: recentAverage >= 80,
            type: 'score',
        },
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
};
