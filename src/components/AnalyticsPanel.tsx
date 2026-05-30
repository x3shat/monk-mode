/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Clock, Calendar, Award } from 'lucide-react';
import { DayProgress } from '../types';

interface AnalyticsPanelProps {
  days: DayProgress[];
  theme?: 'dark' | 'light';
}

export default function AnalyticsPanel({ days, theme }: AnalyticsPanelProps) {
  // Calculate sequential metrics up to the highest non-locked day
  let completedCumulative = 0;
  let missedCumulative = 0;

  const chartData = days.map((d) => {
    if (d.status === 'completed') completedCumulative++;
    if (d.status === 'missed') missedCumulative++;
    
    const momentumScore = Math.max(0, Math.min(100, 50 + (completedCumulative * 5) - (missedCumulative * 3)));
    
    return {
      day: `Day ${d.dayNumber}`,
      dayNum: d.dayNumber,
      momentum: d.status === 'locked' ? null : momentumScore,
      studyHours: d.status === 'locked' ? null : (d.studyHours || 0),
      status: d.status
    };
  });

  // Filter to show active days (not locked) + a buffer of 1 day to show next step, or just all non-locked days
  const activeData = chartData.filter(d => d.status !== 'locked');
  
  // If no days are completed/missed yet, show a fallback first day so chart doesn't look empty
  const displayData = activeData.length > 0 ? activeData : [
    { day: 'Day 1', dayNum: 1, momentum: 50, studyHours: 0, status: 'unlocked' }
  ];

  const totalStudyHours = days.reduce((acc, d) => acc + (d.studyHours || 0), 0);
  const totalCompleted = days.filter(d => d.status === 'completed').length;
  const averageHours = totalCompleted ? (totalStudyHours / totalCompleted) : 0;
  const highestStudyDay = days.reduce((max, d) => (d.studyHours > max.studyHours ? d : max), days[0]);

  // Theme-aware styles for charts
  const isLight = theme === 'light';
  const gridStroke = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)';
  const axisStroke = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  const textFill = isLight ? '#444452' : '#64748b';
  const momentumColor = isLight ? '#059669' : '#10b981';
  const refLineStroke = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)';

  const tooltipContentStyle = isLight 
    ? {
        backgroundColor: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        color: '#1c1c1e',
        fontSize: '11px',
        fontFamily: 'monospace',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }
    : {
        backgroundColor: '#08080c',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#e2e8f0',
        fontSize: '11px',
        fontFamily: 'monospace'
      };

  const tooltipLabelStyle = isLight 
    ? { color: '#636366', fontWeight: 'bold' as const } 
    : { color: '#94a3b8', fontWeight: 'bold' as const };

  return (
    <div id="analytics-panel-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Visual Header stats */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0f] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center text-cyan-400">
            <TrendingUp size={20} className="glow-cyan-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Current Momentum</span>
            <span className="text-2xl font-bold font-data text-white block">
              {displayData[displayData.length - 1]?.momentum || 50}%
            </span>
          </div>
        </div>

        <div className="bg-[#0a0a0f] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Work Average</span>
            <span className="text-2xl font-bold font-data text-white block">
              {averageHours.toFixed(1)} <span className="text-xs text-slate-500">Hrs</span>
            </span>
          </div>
        </div>

        <div className="bg-[#0a0a0f] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-center text-purple-400">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Personal Peak Block</span>
            <span className="text-2xl font-bold font-data text-white block">
              {highestStudyDay.studyHours.toFixed(1)} <span className="text-xs text-slate-500">Hrs (Day {highestStudyDay.dayNumber})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Area Chart: Adaptive Momentum */}
      <div className="lg:col-span-6 bg-[#0a0a0f] border border-white/[0.04] p-5 md:p-6 rounded-2xl flex flex-col gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp size={15} className="text-cyan-400" />
            Adaptive Momentum Track
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
            Dopamine regulation curve mapping consistency over days
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={momentumColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={momentumColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fill: textFill, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={{ stroke: axisStroke }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: textFill, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={{ stroke: axisStroke }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={tooltipContentStyle}
                itemStyle={{ color: momentumColor }}
                labelStyle={tooltipLabelStyle}
              />
              <ReferenceLine y={50} stroke={refLineStroke} strokeDasharray="5 5" label={{ value: 'Baseline', fill: textFill, fontSize: 9, position: 'insideBottomRight' }} />
              <Area 
                type="monotone" 
                dataKey="momentum" 
                stroke={momentumColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMomentum)" 
                activeDot={{ r: 5, stroke: isLight ? '#fff' : '#000', strokeWidth: 1, fill: momentumColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Daily Study Hours Logged */}
      <div className="lg:col-span-6 bg-[#0a0a0f] border border-white/[0.04] p-5 md:p-6 rounded-2xl flex flex-col gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            Daily Workload Logged
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
            Deep focus study hours registered across active days
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fill: textFill, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={{ stroke: axisStroke }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 16]} 
                tick={{ fill: textFill, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={{ stroke: axisStroke }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={tooltipContentStyle}
                itemStyle={{ color: '#f59e0b' }}
                labelStyle={tooltipLabelStyle}
              />
              <Bar 
                dataKey="studyHours" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
