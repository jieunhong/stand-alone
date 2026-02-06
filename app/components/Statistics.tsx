import React, { useState } from 'react';
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
  }>;
  goal: {
    text: string;
    duration: number;
    startDate: string;
  };
}

export function Statistics({ dailyChecks, goal }: StatisticsProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

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

  const categoryAverages = calculateCategoryAverages();

  const totalDays = Math.ceil((new Date().getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const completionRate = dailyChecks.length > 0 ? Math.round((dailyChecks.length / totalDays) * 100) : 0;
  const averageScore = dailyChecks.length > 0
    ? Math.round(dailyChecks.reduce((sum, check) => sum + check.score, 0) / dailyChecks.length)
    : 0;

  const categoryLabels = {
    sleep: '😴 수면',
    nutrition: '🍽️ 식사',
    distress: '😰 정신건강',
    impulse: '🛍️ 충동조절',
    exercise: '🚶 운동',
  };

  return (
    <div className="p-5 space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-white/50">
          <div className="flex items-center gap-1 mb-2">
            <Target className="w-3.5 h-3.5 text-[#7DD87D]" />
            <span className="text-xs text-gray-500 font-medium">실천율</span>
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
            {dailyChecks.length}일
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
        <div className="space-y-2.5 text-xs text-gray-600">
          {completionRate >= 80 && (
            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD87D]/20 rounded-2xl border border-[#A8E6A3]/30 shadow-sm">
              <span className="text-[#7DD87D] text-base">✓</span>
              <p className="leading-relaxed">훌륭해요! {completionRate}%의 높은 실천율을 유지하고 있어요.</p>
            </div>
          )}
          {averageScore >= 70 && (
            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD87D]/20 rounded-2xl border border-[#A8E6A3]/30 shadow-sm">
              <span className="text-[#7DD87D] text-base">✓</span>
              <p className="leading-relaxed">평균 {averageScore}점으로 안정적인 생활을 이어가고 있어요.</p>
            </div>
          )}
          {dailyChecks.length >= 7 && (
            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-br from-[#A8E6A3]/20 to-[#7DD87D]/20 rounded-2xl border border-[#A8E6A3]/30 shadow-sm">
              <span className="text-[#7DD87D] text-base">✓</span>
              <p className="leading-relaxed">일주일 이상 꾸준히 기록 중이에요. 계속 힘내세요!</p>
            </div>
          )}
          {dailyChecks.length === 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-2xl shadow-sm">
              <span className="text-base">💡</span>
              <p className="leading-relaxed">아직 데이터가 없어요. 일일 체크를 시작해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}