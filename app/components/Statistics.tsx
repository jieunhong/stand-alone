import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

interface StatisticsProps {
  dailyChecks: Array<{
    date: string;
    sleep: number;
    nutrition: number;
    distress: number;
    impulse: number;
    exercise: number;
    score: number;
    diary?: string;
    tomorrowResolve?: string;
  }>;
  goal: {
    text: string;
    duration: number;
    startDate: string;
  };
}

export function Statistics({ dailyChecks, goal }: StatisticsProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);


  const getWeeklyData = () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(weekAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const check = dailyChecks.find(c => c.date === dateStr);

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: dateStr,
        score: check?.score || 0,
      });
    }
    return data;
  };

  const getMonthlyData = () => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 29);

    const weeklyAverages = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(monthAgo);
      weekStart.setDate(monthAgo.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekChecks = dailyChecks.filter(check => {
        const checkDate = new Date(check.date);
        return checkDate >= weekStart && checkDate <= weekEnd;
      });

      const avgScore = weekChecks.length > 0
        ? Math.round(weekChecks.reduce((sum, c) => sum + c.score, 0) / weekChecks.length)
        : 0;

      weeklyAverages.push({
        date: `${week + 1}주`,
        fullDate: weekStart.toISOString().split('T')[0],
        score: avgScore,
        count: weekChecks.length,
      });
    }
    return weeklyAverages;
  };

  const data = viewMode === 'week' ? getWeeklyData() : getMonthlyData();

  const calculateCategoryAverages = () => {
    if (dailyChecks.length === 0) return null;

    const totals = dailyChecks.reduce(
      (acc, check) => ({
        sleep: acc.sleep + check.sleep,
        nutrition: acc.nutrition + check.nutrition,
        distress: acc.distress + (6 - check.distress),
        impulse: acc.impulse + (6 - check.impulse),
        exercise: acc.exercise + check.exercise,
      }),
      { sleep: 0, nutrition: 0, distress: 0, impulse: 0, exercise: 0 }
    );

    const count = dailyChecks.length;
    return {
      sleep: (totals.sleep / count).toFixed(1),
      nutrition: (totals.nutrition / count).toFixed(1),
      distress: (totals.distress / count).toFixed(1),
      impulse: (totals.impulse / count).toFixed(1),
      exercise: (totals.exercise / count).toFixed(1),
    };
  };

  const categoryAverages = React.useMemo(() => calculateCategoryAverages(), [dailyChecks]);

  // Fix totalDays calculation and completion rate
  const getGoalDays = () => {
    const start = new Date(goal.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const totalDays = React.useMemo(() => getGoalDays(), [goal]);
  const completionRate = React.useMemo(() =>
    dailyChecks.length > 0 ? Math.round((dailyChecks.length / totalDays) * 100) : 0,
    [dailyChecks.length, totalDays]
  );
  const averageScore = React.useMemo(() =>
    dailyChecks.length > 0
      ? Math.round(dailyChecks.reduce((sum, check) => sum + check.score, 0) / dailyChecks.length)
      : 0,
    [dailyChecks]
  );

  const calculateStreak = () => {
    if (dailyChecks.length === 0) return 0;

    // Sort dates in descending order (most recent first)
    const sortedDates = dailyChecks
      .map(c => c.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestDate = new Date(sortedDates[0]);
    latestDate.setHours(0, 0, 0, 0);

    // Streak is active if the latest record is today or yesterday
    const diffToToday = (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffToToday > 1) return 0;

    streak = 1;
    let currentDate = latestDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);

      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else if (dayDiff > 1) {
        break;
      }
      // If dayDiff is 0 (multiple entries in one day, though schema prevents it), just continue
    }
    return streak;
  };

  const streak = React.useMemo(() => calculateStreak(), [dailyChecks]);

  const categoryLabels = {
    sleep: '😴 수면',
    nutrition: '🍽️ 식사',
    distress: '😰 정신건강',
    impulse: '🛍️ 충동조절',
    exercise: '🚶 운동',
  };

  const dataKey = React.useMemo(() => JSON.stringify({
    checksLen: dailyChecks.length,
    lastCheck: dailyChecks[dailyChecks.length - 1]?.date,
    goal: goal.text
  }), [dailyChecks, goal]);

  useEffect(() => {
    if (dailyChecks.length > 0) {
      const abortController = new AbortController();
      let isFirstChunk = true;

      const getAiFeedback = async () => {
        // 1. 캐시 확인 (429 에러 방지 및 사용자 경험 개선)
        const cachedFeedback = sessionStorage.getItem(`ai_feedback_${dataKey}`);
        if (cachedFeedback) {
          setAiFeedback(cachedFeedback);
          setIsLoadingAi(false);
          return;
        }

        setIsLoadingAi(true);
        setAiFeedback('');
        let accumulatedFeedback = '';

        try {
          const response = await fetch('/api/ai/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dailyChecks,
              goal,
              averages: categoryAverages,
              streak,
              completionRate
            }),
            signal: abortController.signal
          });

          if (!response.body) throw new Error('No response body');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            if (value) {
              const chunkValue = decoder.decode(value, { stream: true });
              accumulatedFeedback += chunkValue;
              if (isFirstChunk) {
                setIsLoadingAi(false);
                isFirstChunk = false;
              }
              setAiFeedback(prev => (prev || '') + chunkValue);
            }
          }

          if (accumulatedFeedback) {
            sessionStorage.setItem(`ai_feedback_${dataKey}`, accumulatedFeedback);
          }
        } catch (error: any) {
          if (error.name === 'AbortError') return;
          console.error('AI 피드백 생성 실패:', error);
          if (!accumulatedFeedback) {
            setAiFeedback('분석 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
          }
        } finally {
          setIsLoadingAi(false);
        }
      };

      getAiFeedback();

      return () => {
        abortController.abort();
      };
    }
  }, [dataKey]);


  return (
    <div className="p-5 space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-white/50">
          <div className="flex items-center gap-1 mb-2">
            <Target className="w-3.5 h-3.5 text-[#7DD87D]" />
            <span className="text-xs text-gray-500 font-medium">기록률</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] bg-clip-text text-transparent">
            {completionRate}%
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-white/50">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#7DD87D]" />
            <span className="text-xs text-gray-500 font-medium">평균</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] bg-clip-text text-transparent">
            {averageScore}점
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-white/50">
          <div className="flex items-center gap-1 mb-2">
            <Award className="w-3.5 h-3.5 text-[#7DD87D]" />
            <span className="text-xs text-gray-500 font-medium">연속</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] bg-clip-text text-transparent">
            {streak}일
          </div>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">📈 점수 추이</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all duration-200 font-semibold shadow-sm ${viewMode === 'week'
                ? 'bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              주간
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all duration-200 font-semibold shadow-sm ${viewMode === 'month'
                ? 'bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              월간
            </button>
          </div>
        </div>

        <div className="h-48 bg-white/50 rounded-2xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#666', fontSize: 10 }}
                stroke="#E0E0E0"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#666', fontSize: 10 }}
                stroke="#E0E0E0"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #A8E6A3',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7DD87D"
                strokeWidth={3}
                dot={{ fill: '#7DD87D', r: 4, strokeWidth: 2, stroke: 'white' }}
                name="점수"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryAverages && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
          <h3 className="text-sm font-bold text-gray-800 mb-4">📊 항목별 평균</h3>
          <div className="space-y-3.5">
            {Object.entries(categoryAverages).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-700 font-medium">{categoryLabels[key as keyof typeof categoryLabels]}</span>
                  <span className="text-xs font-bold bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] bg-clip-text text-transparent">
                    {value} / 5.0
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${(parseFloat(value) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-white/50">
        <h3 className="text-sm font-bold text-gray-800 mb-3">💬 인사이트</h3>
        <div className="space-y-3">
          {dailyChecks.length === 0 ? (
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-2xl shadow-sm">
              <span className="text-base text-gray-400">💡</span>
              <p className="leading-relaxed">아직 데이터가 없어요. 자립 여정의 첫 걸음을 기록해보세요!</p>
            </div>
          ) : (isLoadingAi && !aiFeedback) ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7DD87D]"></div>
              <p className="ml-3 text-xs text-gray-500">AI가 당신의 기록을 분석중이에요...</p>
            </div>
          ) : aiFeedback ? (
            <div className="flex items-start gap-2.5 p-4 bg-gradient-to-br from-[#A8E6A3]/10 to-[#7DD87D]/10 rounded-2xl border border-[#A8E6A3]/20 shadow-sm">
              <span className="text-lg">✨</span>
              <div className="flex flex-col gap-1 w-full">
                <p className="leading-relaxed text-gray-700 text-sm whitespace-pre-wrap">{aiFeedback}</p>
                {isLoadingAi && (
                  <div className="flex gap-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-[#7DD87D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#7DD87D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#7DD87D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-1 italic">Powered by Gemini & LangChain</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-xs text-gray-400">
              분석 정보를 불러오는 데 실패했습니다.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}