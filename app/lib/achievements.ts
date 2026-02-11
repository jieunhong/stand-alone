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

import { AchievementDefinitionDoc } from './db';

export const getAchievements = (
    dailyChecks: DailyCheckData[],
    goal: Goal | null,
    definitions: AchievementDefinitionDoc[]
): Achievement[] => {
    const consecutiveDays = getConsecutiveDays(dailyChecks);
    const averageScore = getAverageScore(dailyChecks);
    const recentAverage = getRecentAverageScore(dailyChecks);
    const totalChecks = dailyChecks.length;

    return definitions.map(def => {
        let unlocked = false;

        // Logical check based on formula in ID or static type
        const typePrefix = def.id.split('_')[0];

        switch (typePrefix) {
            case 'streak':
                unlocked = consecutiveDays >= def.targetValue;
                break;
            case 'score':
                unlocked = averageScore >= def.targetValue;
                break;
            case 'recent':
                unlocked = recentAverage >= def.targetValue;
                break;
            case 'milestone':
                unlocked = totalChecks >= def.targetValue;
                break;
        }

        return {
            id: def.id,
            title: def.title,
            description: def.description,
            icon: def.icon,
            type: def.type,
            unlocked
        };
    });
};
