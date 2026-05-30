/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Target, 
  Layers, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Award, 
  Timer, 
  Coffee, 
  EyeOff, 
  Compass,
  FileDown,
  Sun,
  Moon,
  Settings,
  FileText
} from 'lucide-react';
import { AppState, DayProgress, DayStatus, GoalNode, WillpowerRule } from './types';
import { 
  generateInitialDays, 
  INITIAL_WILLPOWER_RULES, 
  INITIAL_DEFAULT_ROUTINE, 
  INITIAL_GOAL_MAP,
  getDayDateString
} from './data';
import { AnimatePresence } from 'motion/react';

import FocusZone from './components/FocusZone';
import Grid100Days from './components/Grid100Days';
import BiologicalTimeline from './components/BiologicalTimeline';
import ActiveTriggers from './components/ActiveTriggers';
import GoalMap from './components/GoalMap';
import SettingsAndData from './components/SettingsAndData';
import AnalyticsPanel from './components/AnalyticsPanel';
import DailyNotes from './components/DailyNotes';
import { fetchWillpowerRules, addWillpowerRule, updateWillpowerRule, deleteWillpowerRule } from './tauriService';

export default function App() {
  // State initialization with localStorage fallback
  const [days, setDays] = useState<DayProgress[]>(() => {
    try {
      const saved = localStorage.getItem('monk_mode_days');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 100) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Storage access not available in sandbox, falling back directly.");
    }
    const savedDate = typeof window !== 'undefined' ? localStorage.getItem('monk_mode_start_date') : null;
    return generateInitialDays(savedDate || '2026-05-26');
  });

  const [wakeTime, setWakeTime] = useState<string>(() => {
    try {
      return localStorage.getItem('monk_mode_wake_time') || '06:00';
    } catch (e) {
      return '06:00';
    }
  });

  const [sleepTime, setSleepTime] = useState<string>(() => {
    try {
      return localStorage.getItem('monk_mode_sleep_time') || '23:00';
    } catch (e) {
      return '23:00';
    }
  });

  const [goals, setGoals] = useState<GoalNode[]>(() => {
    try {
      const saved = localStorage.getItem('monk_mode_goals');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // safe ignore
    }
    return INITIAL_GOAL_MAP;
  });

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(5); // Default focus on day 5 (preset/interactive day)
  const [startDate, setStartDate] = useState<string | null>(() => {
    try {
      const savedDate = localStorage.getItem('monk_mode_start_date');
      if (savedDate) return savedDate;
      const savedDays = localStorage.getItem('monk_mode_days');
      if (savedDays) return '2026-05-26';
    } catch (e) {}
    return null;
  });
  const [rules, setRules] = useState<WillpowerRule[]>([]);

  // Fetch willpower rules on startup
  useEffect(() => {
    const loadRules = async () => {
      const fetched = await fetchWillpowerRules();
      setRules(fetched);
    };
    loadRules();
  }, []);
  const [activeTab, setActiveTab] = useState<'grid' | 'biological' | 'goals' | 'analytics' | 'notes' | 'settings' | 'willpower'>('grid');
  const [isCalmModeActive, setIsCalmModeActive] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('monk_mode_theme') as 'dark' | 'light') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_theme', theme);
    } catch (e) {}
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  // Persistence side-effects
  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_days', JSON.stringify(days));
    } catch (e) {}
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_wake_time', wakeTime);
    } catch (e) {}
  }, [wakeTime]);

  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_sleep_time', sleepTime);
    } catch (e) {}
  }, [sleepTime]);

  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_goals', JSON.stringify(goals));
    } catch (e) {}
  }, [goals]);

  // Handle escape key to exit calm mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCalmModeActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update State on Import
  const handleImportState = (imported: AppState) => {
    if (imported.days) setDays(imported.days);
    if (imported.wakeTime) setWakeTime(imported.wakeTime);
    if (imported.sleepTime) setSleepTime(imported.sleepTime);
    if (imported.goals) setGoals(imported.goals);
  };

  // Helper function: Update status of a single day
  const handleUpdateDayStatus = (dayNum: number, status: DayStatus) => {
    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.dayNumber === dayNum) {
          // If marked completed, unlock the subsequent day preview
          const updatedDay = { ...day, status };
          return updatedDay;
        }
        
        // Auto unlock the immediate next day if this one is marked complete
        if (day.dayNumber === dayNum + 1 && status === 'completed') {
          if (day.status === 'locked') {
            return { ...day, status: 'unlocked' };
          }
        }
        return day;
      })
    );
  };

  const handleUpdateDayNotes = (dayNum: number, notes: string[]) => {
    setDays((prevDays) =>
      prevDays.map((day) => (day.dayNumber === dayNum ? { ...day, notes } : day))
    );
  };

  const handleUpdateDayHours = (dayNum: number, studyHours: number) => {
    setDays((prevDays) =>
      prevDays.map((day) => (day.dayNumber === dayNum ? { ...day, studyHours } : day))
    );
  };

  const handleToggleGoalStatus = (goalId: string) => {
    setGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goalId 
        ? { ...g, status: g.status === 'completed' ? 'active' : 'completed' } 
        : g
      )
    );
  };

  const handleAddGoal = (newGoal: GoalNode) => {
    setGoals((prevGoals) => [...prevGoals, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
  };

  const handleAddRule = async (newRule: Omit<WillpowerRule, 'id'>) => {
    await addWillpowerRule(newRule);
    const updated = await fetchWillpowerRules();
    setRules(updated);
  };

  const handleUpdateRule = async (updatedRule: WillpowerRule) => {
    await updateWillpowerRule(updatedRule);
    const updated = await fetchWillpowerRules();
    setRules(updated);
  };

  const handleDeleteRule = async (ruleId: number) => {
    await deleteWillpowerRule(ruleId);
    const updated = await fetchWillpowerRules();
    setRules(updated);
  };

  const handleResetGrid = () => {
    setDays(generateInitialDays(startDate || '2026-05-26'));
    setGoals(INITIAL_GOAL_MAP);
    setWakeTime('06:00');
    setSleepTime('23:00');
  };

  const handleSetStartDate = (dateStr: string) => {
    setStartDate(dateStr);
    try {
      localStorage.setItem('monk_mode_start_date', dateStr);
    } catch (e) {}
    const parsed = new Date(dateStr);
    setDays((prevDays) =>
      prevDays.map((d) => ({
        ...d,
        date: getDayDateString(d.dayNumber, parsed),
      }))
    );
  };

  const handleResetJourney = () => {
    setStartDate(null);
    try {
      localStorage.removeItem('monk_mode_start_date');
      localStorage.removeItem('monk_mode_days');
    } catch (e) {}
    setDays(generateInitialDays('2026-05-26'));
    setGoals(INITIAL_GOAL_MAP);
    setWakeTime('06:00');
    setSleepTime('23:00');
  };

  // Dynamically calculate clinical Momentum score (Base 50%)
  // Completed days add +5% each, missed days decay by -3% each. Cap 0 to 100.
  const calculateMomentumValue = (): number => {
    const completedCount = days.filter((d) => d.status === 'completed').length;
    const missedCount = days.filter((d) => d.status === 'missed').length;
    
    // Core adaptive formula
    const rawVal = 50 + (completedCount * 5) - (missedCount * 3);
    return Math.max(0, Math.min(100, rawVal));
  };

  const momentum = calculateMomentumValue();

  // Pick momentum status visual labels based on biological threshold
  const getMomentumStatus = () => {
    if (momentum >= 80) return { title: 'ELITE MOMENTUM UNLOCKED', color: 'text-cyan-400', desc: 'Dopamine receptors fully active. Keep studying!' };
    if (momentum >= 50) return { title: 'STABLE PROGRESS', color: 'text-slate-300', desc: 'Baseline normal. Biological habits formed.' };
    return { title: 'FLATLINE THRESHOLD HEALING', color: 'text-rose-400 font-bold', desc: 'Lack of sleep or missed day. Brain is recovering!' };
  };

  const momentumStatus = getMomentumStatus();

  // Aggregate stats
  const completedCount = days.filter((d) => d.status === 'completed').length;
  const missedCount = days.filter((d) => d.status === 'missed').length;
  const totalStudyHrs = days.reduce((acc, d) => acc + (d.studyHours || 0), 0);

  // Biological Timeline status overview
  const daysInSurge = completedCount <= 14;
  const daysInFlatline = completedCount > 14 && completedCount <= 45;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f5f5f7] text-[#1c1c1e]' : 'bg-[#000000] text-zinc-100'} p-4 md:p-8 font-sans transition-colors duration-200 selection:bg-cyan-950/30 selection:text-cyan-50`}>
      
      {/* Immersive Full Screen Focus Overlay (Calm Mode) */}
      <AnimatePresence>
        {isCalmModeActive && (
          <FocusZone onClose={() => setIsCalmModeActive(false)} />
        )}
      </AnimatePresence>

      {/* Main Container Workspace */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Global Dashboard Navigation Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#111118] pb-5">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Zap size={22} className="text-cyan-400 animate-accent-pulse" />
              100 DAYS MONK MODE
            </h1>
            <p className="text-[11px] md:text-xs text-zinc-500 font-mono tracking-wider uppercase">
              Psychological Habit Control Deck & Cognitive Flight Controller
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-[#0a0a0f] hover:bg-[#0c0c0f] text-slate-400 hover:text-white rounded-xl border border-white/[0.04] cursor-pointer transition-all flex items-center justify-center"
              title={theme === 'dark' ? 'Activate Premium Light Mode' : 'Activate Obsidian Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400 animate-spin-slow" /> : <Moon size={15} className="text-indigo-400" />}
            </button>

            <button
              id="activate-calm-zone-btn"
              onClick={() => setIsCalmModeActive(true)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black hover:text-black text-xs font-mono font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all border border-cyan-400/40"
            >
              <EyeOff size={14} />
              ACTIVATE CALM MODE FOCUS ZONE
            </button>
          </div>
        </div>

        {/* Dynamic Metric HUD Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* 1st Meter: Momentum Meter */}
          <div className="bg-[#0c0c0f]/60 border border-[#111118] p-4 rounded-xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">ADAPTIVE MOMENTUM</span>
              <TrendingUp size={14} className="text-zinc-500" />
            </div>
            <div className="pt-3">
              <span id="momentum-score-meter" className="text-3xl font-data font-bold text-white tracking-tight">
                {momentum}%
              </span>
              <div className="mt-2.5 h-1.5 w-full bg-[#050508] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    momentum >= 80 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' :
                    momentum >= 50 ? 'bg-slate-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${momentum}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 text-[9px] font-mono leading-relaxed mt-1">
              <span className={momentumStatus.color}>{momentumStatus.title}: </span>
              <span className="text-zinc-500">{momentumStatus.desc}</span>
            </div>
          </div>

          {/* 2nd Meter: Task Completed Progress */}
          <div className="bg-[#0c0c0f]/60 border border-[#111118] p-4 rounded-xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">CHRONO PROGRESSION</span>
              <Calendar size={14} className="text-zinc-500" />
            </div>
            <div className="pt-3">
              <span id="completed-days-badge-count" className="text-3xl font-data font-bold text-white tracking-tight">
                {completedCount}/100 <span className="text-xs font-normal text-zinc-500">Days</span>
              </span>
              <div className="mt-2.5 h-1.5 w-full bg-[#050508] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${completedCount}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 text-[9px] font-mono text-zinc-500 leading-normal mt-1">
              {daysInSurge && <span className="text-amber-500">Tier 1: THE SURGE (0-14 Days) Active</span>}
              {daysInFlatline && <span className="text-sky-400">Tier 2: THE FLATLINE (15-45 Days) Active</span>}
              {!daysInSurge && !daysInFlatline && <span className="text-cyan-400">Tier 3: ELITE BASELINE (46-100 Days)</span>}
            </div>
          </div>

          {/* 3rd Meter: Study Hours Accumulated */}
          <div className="bg-[#0c0c0f]/60 border border-[#111118] p-4 rounded-xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">ACADEMIC WORKLOAD LOGGED</span>
              <Clock size={14} className="text-zinc-500" />
            </div>
            <div className="pt-3 pb-1">
              <span id="study-hours-badge-count" className="text-3xl font-data font-bold text-white tracking-tight">
                {totalStudyHrs.toFixed(1)} <span className="text-xs font-normal text-zinc-500">Hours</span>
              </span>
            </div>
            <div className="pt-1 text-[9px] font-mono text-zinc-500 leading-normal">
              Average: {(completedCount ? totalStudyHrs / completedCount : 0).toFixed(1)} hours of deep work per study day.
            </div>
          </div>

          {/* 4th Meter: Active Biological Wave */}
          <div className="bg-[#0c0c0f]/60 border border-[#111118] p-4 rounded-xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">BIOLOGICAL TIMELINE</span>
              <Timer size={14} className="text-zinc-500" />
            </div>
            <div className="pt-3">
              <span className="text-xl font-bold text-zinc-200 block truncate">
                {daysInSurge ? 'THE SURGE (Days 1–14)' :
                 daysInFlatline ? 'THE FLATLINE (Days 15–45)' : 'NEW BASELINE (Days 45–100)'}
              </span>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-1 line-clamp-2">
                {daysInSurge ? 'Aggressive cravings. Rely deeply on blockers and rapid drop pushups.' :
                 daysInFlatline ? 'Loneliness & fatigue. Maintain schedule anyway. Receptors are healing.' : 
                 'Dopamine pathways stabilized. Elite executive momentum unlocked.'}
              </p>
            </div>
          </div>

        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#111118] pb-1 text-sm">
          <button
            id="tab-btn-grid"
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'grid' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <Calendar size={13} />
              10x10 Strategic Grid
            </span>
          </button>

          <button
            id="tab-btn-biological"
            onClick={() => setActiveTab('biological')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'biological' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <Clock size={13} />
              Routine Timelines
            </span>
          </button>

          <button
            id="tab-btn-willpower"
            onClick={() => setActiveTab('willpower')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'willpower' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <ShieldAlert size={13} />
              Active Willpower Rules
            </span>
          </button>

          <button
            id="tab-btn-goals"
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'goals' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <Target size={13} />
              Objective Tree Map
            </span>
          </button>

          <button
            id="tab-btn-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'analytics' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <TrendingUp size={13} />
              Analytics & Trends
            </span>
          </button>

          <button
            id="tab-btn-notes"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'notes' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <FileText size={13} />
              Notes & Journal
            </span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-sans font-medium tracking-wide rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'text-white border-b-2 border-cyan-400 bg-[#0c0c0f]/70 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2 text-xs">
              <Settings size={13} />
              Settings & Data
            </span>
          </button>
        </div>

        {/* Dynamic Display of Tabs */}
        <div>
          {activeTab === 'grid' && (
            <Grid100Days
              days={days}
              selectedDayNumber={selectedDayNumber}
              startDate={startDate}
              onSelectDay={setSelectedDayNumber}
              onUpdateDayStatus={handleUpdateDayStatus}
              onUpdateDayNotes={handleUpdateDayNotes}
              onUpdateDayHours={handleUpdateDayHours}
              onResetGrid={handleResetGrid}
              onSetStartDate={handleSetStartDate}
              onResetJourney={handleResetJourney}
            />
          )}

          {activeTab === 'biological' && (
            <BiologicalTimeline
              wakeTime={wakeTime}
              sleepTime={sleepTime}
              onWakeTimeChange={setWakeTime}
              onSleepTimeChange={setSleepTime}
            />
          )}

          {activeTab === 'willpower' && (
            <ActiveTriggers 
              rules={rules} 
              onAddRule={handleAddRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
            />
          )}

          {activeTab === 'goals' && (
            <GoalMap 
              goals={goals} 
              onToggleGoalStatus={handleToggleGoalStatus} 
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              theme={theme}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel days={days} theme={theme} />
          )}

          {activeTab === 'notes' && (
            <DailyNotes theme={theme} />
          )}

          {activeTab === 'settings' && (
            <SettingsAndData
              appState={{ days, momentum, wakeTime, sleepTime, goals }}
              onImportState={handleImportState}
              onResetJourney={handleResetJourney}
            />
          )}
        </div>

      </div>

    </div>
  );
}
