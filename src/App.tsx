/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  getDayDateString,
  MONK_MODE_START_DATE
} from './data';
import { motion, AnimatePresence } from 'motion/react';

import FocusZone from './components/FocusZone';
import Grid100Days from './components/Grid100Days';
import BiologicalTimeline from './components/BiologicalTimeline';
import ActiveTriggers from './components/ActiveTriggers';
import GoalMap from './components/GoalMap';
import SettingsAndData from './components/SettingsAndData';
import AnalyticsPanel from './components/AnalyticsPanel';
import DailyNotes from './components/DailyNotes';
import { fetchWillpowerRules, addWillpowerRule, updateWillpowerRule, deleteWillpowerRule } from './tauriService';

const navItems = [
  { id: 'grid', label: '10x10 Strategic Grid', icon: <Calendar size={13} /> },
  { id: 'biological', label: 'Routine Timelines', icon: <Clock size={13} /> },
  { id: 'willpower', label: 'Active Willpower Rules', icon: <ShieldAlert size={13} /> },
  { id: 'goals', label: 'Objective Tree Map', icon: <Target size={13} /> },
  { id: 'analytics', label: 'Analytics & Trends', icon: <TrendingUp size={13} /> },
  { id: 'notes', label: 'Notes & Journal', icon: <FileText size={13} /> },
  { id: 'settings', label: 'Settings & Data', icon: <Settings size={13} /> }
] as const;

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
    return generateInitialDays(savedDate || MONK_MODE_START_DATE);
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

  // Get initial start date helper to calculate start date and selected day number
  const getInitialStartDate = (): string | null => {
    try {
      const savedDate = localStorage.getItem('monk_mode_start_date');
      if (savedDate) return savedDate;
      const savedDays = localStorage.getItem('monk_mode_days');
      if (savedDays) return MONK_MODE_START_DATE;
    } catch (e) {}
    return null;
  };

  const [startDate, setStartDate] = useState<string | null>(getInitialStartDate);

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    const today = new Date();
    const startStr = getInitialStartDate() || MONK_MODE_START_DATE;
    const start = new Date(startStr);
    const diffTime = today.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.max(1, diffDays));
  });
  const [rules, setRules] = useState<WillpowerRule[]>([]);

  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setShowSavedIndicator(true);
    const timer = setTimeout(() => {
      setShowSavedIndicator(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [days, goals, wakeTime, sleepTime]);

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

  const handleAddStudyHours = (dayNum: number, additionalHours: number) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.dayNumber === dayNum
          ? { ...day, studyHours: Number((day.studyHours + additionalHours).toFixed(2)) }
          : day
      )
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
    setDays(generateInitialDays(startDate || MONK_MODE_START_DATE));
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
    setDays(generateInitialDays(MONK_MODE_START_DATE));
    setGoals(INITIAL_GOAL_MAP);
    setWakeTime('06:00');
    setSleepTime('23:00');
  };

  // Overhaul clinical Streak calculation
  const calculateCurrentStreak = (): number => {
    let maxLoggedDay = 0;
    days.forEach((d) => {
      if (d.status === 'completed' || d.status === 'partial' || d.status === 'missed') {
        if (d.dayNumber > maxLoggedDay) maxLoggedDay = d.dayNumber;
      }
    });

    let streak = 0;
    if (maxLoggedDay > 0) {
      for (let i = maxLoggedDay; i >= 1; i--) {
        const day = days.find((d) => d.dayNumber === i);
        if (day && (day.status === 'completed' || day.status === 'partial')) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const currentStreak = calculateCurrentStreak();

  // Overhaul clinical Momentum score: base 0, +5% completed, +2% partial, -3% missed, plus consecutive active streak bonus (+1% each)
  const calculateMomentumValue = (): number => {
    let completedCount = 0;
    let partialCount = 0;
    let missedCount = 0;

    days.forEach((d) => {
      if (d.status === 'completed') completedCount++;
      else if (d.status === 'partial') partialCount++;
      else if (d.status === 'missed') missedCount++;
    });

    const baseMomentum = (completedCount * 5) + (partialCount * 2) - (missedCount * 3);
    const streakBonus = currentStreak * 1;
    const rawVal = baseMomentum + streakBonus;

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
  const activeStudyDays = days.filter(d => d.studyHours && d.studyHours > 0).length || 1;

  // Biological Timeline status overview
  const daysInSurge = completedCount <= 14;
  const daysInFlatline = completedCount > 14 && completedCount <= 45;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f5f5f7] text-[#1c1c1e]' : 'bg-[#000000] text-zinc-100'} font-sans transition-colors duration-200 selection:bg-cyan-950/30 selection:text-cyan-50 flex flex-col md:flex-row`}>
      
      {/* Immersive Full Screen Focus Overlay (Calm Mode) */}
      <AnimatePresence>
        {isCalmModeActive && (
          <FocusZone 
            selectedDayNumber={selectedDayNumber}
            onLogHours={handleAddStudyHours}
            onClose={() => setIsCalmModeActive(false)} 
          />
        )}
      </AnimatePresence>

      {/* FIXED SIDEBAR NAV (COCKPIT LAYOUT) */}
      <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen z-20 transition-colors duration-200 ${
        theme === 'light' 
          ? 'bg-slate-50 border-slate-200 text-[#1c1c1e]' 
          : 'bg-[#0a0a0f] border-white/[0.04] text-zinc-100'
      }`}>
        <div className="space-y-6">
          <div className={`space-y-1 pb-4 border-b ${theme === 'light' ? 'border-slate-200' : 'border-white/[0.04]'}`}>
            <h1 className={`text-lg font-bold font-sans tracking-tight flex items-center gap-2 select-none ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <Zap size={20} className="text-cyan-400 animate-accent-pulse" />
              100 DAYS MONK
            </h1>
            <p className={`text-[10px] font-mono tracking-wider uppercase leading-relaxed select-none ${
              theme === 'light' ? 'text-slate-550' : 'text-zinc-500'
            }`}>
              Habit Deck & Flight Controller
            </p>
          </div>
          
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 text-left text-xs font-mono font-bold ${
                  activeTab === item.id
                    ? (theme === 'light'
                        ? 'bg-green-105 text-green-800 border border-green-200 shadow-sm'
                        : 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.05)]')
                    : (theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'
                        : 'text-zinc-550 hover:text-zinc-350 border border-transparent')
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={`pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/[0.04]'} flex flex-col gap-2.5`}>
          <button
            id="activate-calm-zone-btn"
            onClick={() => setIsCalmModeActive(true)}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all border border-cyan-400/30"
          >
            <EyeOff size={13} />
            CALM FOCUS ZONE
          </button>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-full py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-mono font-bold border ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                : 'bg-[#08080c] hover:bg-white/[0.02] text-slate-405 hover:text-white border-white/[0.04]'
            }`}
            title={theme === 'dark' ? 'Activate Premium Light Mode' : 'Activate Obsidian Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} className="text-amber-400 animate-spin-slow" />
                LIGHT DECK
              </>
            ) : (
              <>
                <Moon size={13} className="text-indigo-400" />
                OBSIDIAN DECK
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
        
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

          {/* 2nd Meter: Current Streak */}
          <div className="bg-[#0c0c0f]/60 border border-[#111118] p-4 rounded-xl flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col justify-between h-full col-span-1">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">CURRENT STREAK</span>
              <div className="pt-2.5">
                <span id="streak-badge-count" className="text-3xl font-data font-bold text-white tracking-tight">
                  {currentStreak} <span className="text-xs font-mono font-normal text-zinc-500">Days</span>
                </span>
                <p className="text-[9px] font-mono text-amber-500 leading-normal mt-1.5 uppercase">
                  Active non-missed run
                </p>
              </div>
            </div>
            
            {/* Circular progress SVG */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-[#050508]"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-cyan-400 transition-all duration-500"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 - (Math.min(100, currentStreak) / 100) * (2 * Math.PI * 22)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-cyan-400">{currentStreak}d</span>
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
              Average: {(totalStudyHrs / activeStudyDays).toFixed(1)} hours of deep work per study day.
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
            <DailyNotes 
              selectedDayNumber={selectedDayNumber}
              days={days}
              onUpdateDayNotes={handleUpdateDayNotes}
              theme={theme} 
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAndData
              appState={{ days, momentum, wakeTime, sleepTime, goals }}
              onImportState={handleImportState}
              onResetJourney={handleResetJourney}
            />
          )}
        </div>

      </main>

      {/* Sleek, Tactical Fixed HUD Notification Pill */}
      <AnimatePresence>
        {showSavedIndicator && (
          <motion.div
            id="hud-saved-indicator"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 bg-[#0a0a0f]/90 text-cyan-400 border border-cyan-500/30 px-4 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.15)] font-mono text-[11px] font-bold tracking-wider select-none uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>💾 System State Preserved</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
