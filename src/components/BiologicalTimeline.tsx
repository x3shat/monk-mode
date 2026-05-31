/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Moon, Sun, ChevronRight, Calendar } from 'lucide-react';

interface BiologicalTimelineProps {
  wakeTime: string; // HH:MM
  sleepTime: string; // HH:MM
  onWakeTimeChange: (time: string) => void;
  onSleepTimeChange: (time: string) => void;
}

interface RoutineBlock {
  startTime: string; 
  endTime: string; 
  activity: string;
  details: string;
  zone: 'deep-work' | 'reset' | 'transition' | 'sleep';
  startMin: number; // minutes from midnight (at 08:00 AM baseline)
  endMin: number; // minutes from midnight (at 08:00 AM baseline)
}

const WEEKDAY_ROUTINE: RoutineBlock[] = [
  { startTime: "08:00 AM", endTime: "08:15 AM", activity: "Wake Up & Hydrate", details: "Drink 2 glasses of water.", zone: "reset", startMin: 480, endMin: 495 },
  { startTime: "08:15 AM", endTime: "09:00 AM", activity: "Morning Sunlight & Peace", details: "Stand on the balcony, drink tea, Hare Krishna chant.", zone: "reset", startMin: 495, endMin: 540 },
  { startTime: "09:00 AM", endTime: "10:30 AM", activity: "Study Block 1 (1.5 hrs)", details: "Pre-game: Stare at wall for 2 mins. Rule: Active recall only.", zone: "deep-work", startMin: 540, endMin: 630 },
  { startTime: "10:30 AM", endTime: "11:00 AM", activity: "Breakfast", details: "Rule: Eat at the dining table in total silence.", zone: "reset", startMin: 630, endMin: 660 },
  { startTime: "11:00 AM", endTime: "01:30 PM", activity: "Study Block 2 (2.5 hrs)", details: "Pre-game: Stare at wall for 2 mins. Push through friction.", zone: "deep-work", startMin: 660, endMin: 810 },
  { startTime: "01:30 PM", endTime: "02:00 PM", activity: "Hygiene & Lunch", details: "60-Second Cold Shower. Eat lunch in silence.", zone: "reset", startMin: 810, endMin: 840 },
  { startTime: "02:00 PM", endTime: "02:30 PM", activity: "Mental Break", details: "Brush teeth. Play with ball / walk inside room (No screens).", zone: "reset", startMin: 840, endMin: 870 },
  { startTime: "02:30 PM", endTime: "04:00 PM", activity: "Study Block 3 (1.5 hrs)", details: "Pre-game: Stare at wall for 2 mins.", zone: "deep-work", startMin: 870, endMin: 960 },
  { startTime: "04:00 PM", endTime: "04:30 PM", activity: "Brain Reset", details: "Yoga Nidra (NSDR). Lie down and reset the nervous system.", zone: "reset", startMin: 960, endMin: 990 },
  { startTime: "04:30 PM", endTime: "06:00 PM", activity: "Study Block 4 (1.5 hrs)", details: "Pre-game: Stare at wall for 2 mins.", zone: "deep-work", startMin: 990, endMin: 1080 },
  { startTime: "06:00 PM", endTime: "06:30 PM", activity: "Family & Fuel", details: "Have snacks with family. Disconnect from work.", zone: "reset", startMin: 1080, endMin: 1110 },
  { startTime: "06:30 PM", endTime: "07:30 PM", activity: "Physical Training", details: "1 hr walk (speed walking) OR Cardio OR 30 Pushups/Squats/Pullups. Eat a banana post-workout.", zone: "transition", startMin: 1110, endMin: 1170 },
  { startTime: "07:30 PM", endTime: "09:00 PM", activity: "Study Block 5 (1.5 hrs)", details: "Pre-game: Stare at wall for 2 mins. Rule: +10 minute push at the end.", zone: "deep-work", startMin: 1170, endMin: 1260 },
  { startTime: "09:00 PM", endTime: "09:15 PM", activity: "SCREENS OFF", details: "Hard stop. No digital devices from this point forward.", zone: "transition", startMin: 1260, endMin: 1275 },
  { startTime: "09:15 PM", endTime: "11:30 PM", activity: "Analog Wind-down", details: "Draw, play guitar, juggle, read books, clean room.", zone: "transition", startMin: 1275, endMin: 1410 },
  { startTime: "11:30 PM", endTime: "12:00 AM", activity: "Nightly Journaling", details: "Write in diary. Log your wins. Prepare for tomorrow.", zone: "transition", startMin: 1410, endMin: 1440 },
  { startTime: "12:00 AM", endTime: "08:00 AM", activity: "Sleep", details: "Lights out.", zone: "sleep", startMin: 0, endMin: 480 }
];

const SUNDAY_ROUTINE: RoutineBlock[] = [
  { startTime: "08:00 AM", endTime: "09:00 AM", activity: "Wake Up & Hydrate", details: "Water, Balcony, Tea, Hare Krishna chant.", zone: "reset", startMin: 480, endMin: 540 },
  { startTime: "09:00 AM", endTime: "10:00 AM", activity: "Breakfast", details: "Eat in silence.", zone: "reset", startMin: 540, endMin: 600 },
  { startTime: "10:00 AM", endTime: "12:00 PM", activity: "Study Block 1 (1.5 hrs)", details: "Pre-game wall stare.", zone: "deep-work", startMin: 600, endMin: 720 },
  { startTime: "12:00 PM", endTime: "01:30 PM", activity: "Study Block 2 (1.5 hrs)", details: "Pre-game wall stare.", zone: "deep-work", startMin: 720, endMin: 810 },
  { startTime: "01:30 PM", endTime: "02:30 PM", activity: "Hygiene & Lunch", details: "60-Second Cold Shower. Lunch in silence. Break/Walk.", zone: "reset", startMin: 810, endMin: 870 },
  { startTime: "02:30 PM", endTime: "04:00 PM", activity: "Study Block 3 (1.5 hrs)", details: "Final study block of the week.", zone: "deep-work", startMin: 870, endMin: 960 },
  { startTime: "04:00 PM", endTime: "04:30 PM", activity: "Yoga Nidra", details: "Deep nervous system reset.", zone: "reset", startMin: 960, endMin: 990 },
  { startTime: "04:30 PM", endTime: "06:00 PM", activity: "Admin Window", details: "(Screens Allowed): Get updates, check news, apply for jobs/opportunities.", zone: "transition", startMin: 990, endMin: 1080 },
  { startTime: "06:00 PM", endTime: "08:00 PM", activity: "Radical Solitude", details: "2 Hours: Sit entirely alone. No screens, no books, no music. Process your thoughts.", zone: "reset", startMin: 1080, endMin: 1200 },
  { startTime: "08:00 PM", endTime: "09:00 PM", activity: "Dinner & Relax", details: "Dinner with family.", zone: "transition", startMin: 1200, endMin: 1260 },
  { startTime: "09:00 PM", endTime: "12:00 AM", activity: "SCREENS OFF", details: "Analog activities, Nightly Journaling.", zone: "transition", startMin: 1260, endMin: 1440 },
  { startTime: "12:00 AM", endTime: "08:00 AM", activity: "Sleep", details: "Lights out.", zone: "sleep", startMin: 0, endMin: 480 }
];

export default function BiologicalTimeline({
  wakeTime,
  sleepTime,
  onWakeTimeChange,
  onSleepTimeChange
}: BiologicalTimelineProps) {
  // Current time state
  const [currentRealTime, setCurrentRealTime] = useState<Date>(new Date());
  
  // Simulated hour state (Warp Simulator)
  const [isWarpMode, setIsWarpMode] = useState(false);
  const [simulatedHour, setSimulatedHour] = useState(12);
  const [simulatedMinute, setSimulatedMinute] = useState(0);

  // Manual Day Mode Override state: 'auto' | 'weekday' | 'sunday'
  const [dayOverride, setDayOverride] = useState<'auto' | 'weekday' | 'sunday'>('auto');

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const getActiveHour = (): number => {
    return isWarpMode ? simulatedHour : currentRealTime.getHours();
  };

  const getActiveMinute = (): number => {
    return isWarpMode ? simulatedMinute : currentRealTime.getMinutes();
  };

  // Determine if active routine should be Sunday or Weekday
  const checkIsSunday = (): boolean => {
    if (dayOverride === 'sunday') return true;
    if (dayOverride === 'weekday') return false;
    // Auto-detect based on local system day (0 is Sunday)
    return currentRealTime.getDay() === 0;
  };

  const isSunday = checkIsSunday();
  const currentRoutine = isSunday ? SUNDAY_ROUTINE : WEEKDAY_ROUTINE;

  // Convert minutes of the day into "HH:MM AM/PM" format
  const formatMinutesToTimeStr = (totalMins: number): string => {
    let hours = Math.floor(totalMins / 60) % 24;
    const minutes = totalMins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  // Shift offset based on wakeTime selector (baseline wake is 08:00 AM = 480 mins)
  const getOffsetMins = (): number => {
    const standardWakeMins = 480; // 08:00 AM baseline to match the new routine arrays
    if (!wakeTime) return 0;
    
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    const customWakeMins = (wakeH * 60) + wakeM;
    return customWakeMins - standardWakeMins;
  };

  // Get shifted routine blocks
  const getShiftedBlocks = () => {
    const offset = getOffsetMins();
    return currentRoutine.map((block) => {
      let start = (block.startMin + offset) % 1440;
      if (start < 0) start += 1440;
      let end = (block.endMin + offset) % 1440;
      if (end < 0) end += 1440;
      
      return {
        ...block,
        startMinShifted: start,
        endMinShifted: end,
        startTimeFormatted: formatMinutesToTimeStr(start),
        endTimeFormatted: formatMinutesToTimeStr(end)
      };
    });
  };

  const shiftedBlocks = getShiftedBlocks();
  const currentMins = (getActiveHour() * 60) + getActiveMinute();

  // Find active block
  const getIsActive = (block: any) => {
    const { startMinShifted: start, endMinShifted: end } = block;
    if (start < end) {
      return currentMins >= start && currentMins < end;
    } else {
      // Midnight wrap-around
      return currentMins >= start || currentMins < end;
    }
  };

  const activeIndex = shiftedBlocks.findIndex(getIsActive);
  const activeBlock = activeIndex !== -1 ? shiftedBlocks[activeIndex] : shiftedBlocks[shiftedBlocks.length - 1];
  const nextBlock = shiftedBlocks[(activeIndex + 1) % shiftedBlocks.length];

  // Calculate elapsed progress percent inside active block
  const calculateElapsedPercent = () => {
    const start = activeBlock.startMinShifted;
    let end = activeBlock.endMinShifted;
    if (end < start) end += 1440;
    
    let current = currentMins;
    if (current < start && activeBlock.startMinShifted > activeBlock.endMinShifted) {
      current += 1440;
    }
    
    let progress = current - start;
    if (progress < 0) progress += 1440;
    
    const totalDuration = end - start;
    return Math.min(100, Math.max(0, Math.round((progress / totalDuration) * 100)));
  };

  const elapsedPercent = calculateElapsedPercent();

  return (
    <div id="biological-clock-card" className="bg-[#0a0a0f] rounded-2xl border border-white/[0.04] p-6 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Header and schedule selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            Biological Chronology Control
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5 uppercase">
            Auto-shifts routine depending on system day to manage cognitive burn
          </p>
        </div>

        {/* Input selectors for wake schedule shifting */}
        <div className="flex flex-wrap items-center gap-3 bg-[#08080c] p-2.5 rounded-xl border border-white/[0.04] text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Sun size={12} className="text-amber-500" />
            <span className="text-[11px] text-slate-500 font-bold uppercase">Wakeup:</span>
            <input 
              id="user-wake-time-selector"
              type="time"
              value={wakeTime}
              onChange={(e) => onWakeTimeChange(e.target.value)}
              className="bg-[#0a0a0f] text-slate-100 px-2 py-1 rounded border border-white/[0.04] outline-none text-[11px] font-mono font-medium focus:border-cyan-400"
            />
          </div>
          <div className="h-4 w-px bg-white/[0.04]"></div>
          <div className="flex items-center gap-1.5">
            <Moon size={12} className="text-indigo-400" />
            <span className="text-[11px] text-slate-500 font-bold uppercase">Sleep:</span>
            <input 
              id="user-sleep-time-selector"
              type="time"
              value={sleepTime}
              onChange={(e) => onSleepTimeChange(e.target.value)}
              className="bg-[#0a0a0f] text-slate-100 px-2 py-1 rounded border border-white/[0.04] outline-none text-[11px] font-mono font-medium focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Vertical Timeline on Left, HUD on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sleek Vertical Timeline Column (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Active Mode Banner Tag */}
          <div className="flex items-center justify-between gap-4 bg-[#08080c]/50 p-3 rounded-xl border border-white/[0.03] mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={14} className={isSunday ? 'text-amber-400' : 'text-cyan-400'} />
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isSunday ? 'text-amber-400' : 'text-cyan-400'}`}>
                {isSunday ? 'Sunday Reset Mode Active' : 'Weekday Routine Active'}
              </span>
            </div>

            {/* Manual Override controls */}
            <div className="flex bg-[#050508] border border-white/[0.04] rounded-lg p-0.5 text-[9px] font-mono">
              <button
                onClick={() => setDayOverride('auto')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${dayOverride === 'auto' ? 'bg-[#0a0a0f] text-white font-bold border border-white/[0.04]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Auto ({currentRealTime.getDay() === 0 ? 'Sun' : 'Wkdy'})
              </button>
              <button
                onClick={() => setDayOverride('weekday')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${dayOverride === 'weekday' ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Weekday Strict
              </button>
              <button
                onClick={() => setDayOverride('sunday')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${dayOverride === 'sunday' ? 'bg-[#0a0a0f] text-amber-500 font-bold border border-white/[0.04]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sunday Reset
              </button>
            </div>
          </div>

          <div className="relative pl-8 pb-2 flex flex-col gap-4 select-none">
            {/* Vertical tracking connector line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/[0.04] light-mode-line pointer-events-none"></div>

            {shiftedBlocks.map((block, idx) => {
              const isActive = idx === activeIndex;
              
              return (
                <div key={idx} className="relative flex flex-col sm:flex-row items-start gap-4">
                  
                  {/* Node Dot Container */}
                  <div className="absolute -left-8 top-1.5 w-8 flex justify-center items-center">
                    {isActive ? (
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute animate-ping w-4.5 h-4.5 rounded-full ${isSunday ? 'bg-amber-400/25' : 'bg-cyan-400/25'}`}></span>
                        <span className={`w-3 h-3 rounded-full border z-10 animate-pulse ${
                          isSunday 
                            ? 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                            : 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                        }`}></span>
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/[0.1] z-10 transition-colors"></div>
                    )}
                  </div>

                  {/* Content Block Card */}
                  <div 
                    className={`flex-1 p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? (isSunday 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.06)] scale-[1.01]'
                            : 'bg-cyan-950/20 border-cyan-400 text-cyan-50 shadow-[0_0_15px_rgba(34,211,238,0.08)] glow-cyan-sm scale-[1.01]') 
                        : 'bg-[#08080c]/30 border-white/[0.03] text-slate-450 hover:border-white/[0.08] hover:bg-[#08080c]/50 routine-block-inactive hover:shadow-md hover:scale-[1.005]'
                    }`}
                  >
                    {isActive && (
                      <div 
                        className={`absolute left-0 right-0 h-[2px] pointer-events-none transition-all duration-300 ${
                          isSunday ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                        }`}
                        style={{ top: `${elapsedPercent}%` }}
                      />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.03] pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold leading-none ${isActive ? (isSunday ? 'text-amber-400' : 'text-cyan-400') : 'text-slate-500'}`}>
                          {block.startTimeFormatted} - {block.endTimeFormatted}
                        </span>
                        <ChevronRight size={11} className="text-slate-650" />
                        <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-slate-350'}`}>
                          {block.activity}
                        </h4>
                      </div>
                      
                      {/* Zone Badge */}
                      <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide font-mono uppercase font-bold self-start sm:self-center ${
                        block.zone === 'deep-work' ? (isSunday ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/30') :
                        block.zone === 'sleep' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' :
                        block.zone === 'reset' ? 'bg-[#08080c] text-slate-400 border border-white/[0.05]' :
                        'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20'
                      }`}>
                        {block.zone === 'deep-work' ? (isSunday ? '💼 Strategy' : '🔥 Focus') :
                         block.zone === 'sleep' ? '💤 Sleep' : 
                         block.zone === 'reset' ? '🛡️ Reset' : '⚡ Transition'}
                      </span>
                    </div>
                    
                    <p className={`text-xs md:text-sm leading-relaxed ${isActive ? (isSunday ? 'text-amber-250' : 'text-cyan-200') : 'text-slate-450'}`}>
                      {block.details}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Chronology Controller HUD Column (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-5 self-stretch justify-between">
          
          {/* BIG DIGITAL CLOCK PANEL */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#08080c] border border-white/[0.04] text-center relative overflow-hidden h-48 shadow-[0_4px_30px_rgba(0,0,0,0.5)] monk-panel-sage">
            <div className="absolute top-3 right-4 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isWarpMode ? 'bg-amber-400 animate-ping' : 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]'}`}></span>
              <span className="text-[9px] font-mono text-slate-555 uppercase font-bold tracking-wider">
                {isWarpMode ? 'Warp Simulator' : 'System Time'}
              </span>
            </div>

            <span className="text-4xl font-mono font-data font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">
              {String(getActiveHour()).padStart(2, '0')}:{String(getActiveMinute()).padStart(2, '0')}
            </span>

            <span className={`text-xs font-mono font-bold mt-4 tracking-wide uppercase px-3 py-1 bg-[#0a0a0f]/80 border rounded-lg shadow-md ${
              isSunday ? 'text-amber-400 border-amber-800/30' : 'text-cyan-400 border-cyan-800/20'
            }`}>
              ACTIVE: {activeBlock.activity}
            </span>
            
            <div className="mt-2.5 text-[9px] font-mono text-slate-550">
              Next: {nextBlock.activity} at {nextBlock.startTimeFormatted}
            </div>
          </div>

          {/* ACTIVE DIRECTIVES DETAILS SUMMARY CARD */}
          <div className="flex-1 flex flex-col justify-between bg-[#08080c]/30 rounded-2xl border border-white/[0.04] p-5 shadow-inner min-h-48 monk-panel-sage">
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold md:flex-wrap lg:flex-nowrap">
                <span className={isSunday ? 'text-amber-400' : 'text-cyan-400'}>Chronobiology Directives</span>
                <span className={`px-2 py-0.5 rounded text-[8px] tracking-normal font-mono uppercase ${
                  activeBlock.zone === 'deep-work' ? (isSunday ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30' : 'bg-cyan-950/30 text-cyan-400 border border-cyan-800/30 shadow-[0_0_8px_rgba(34,211,238,0.15)]') :
                  activeBlock.zone === 'sleep' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' :
                  'bg-[#0a0a0f] text-slate-400 border border-white/[0.04]'
                }`}>
                  {activeBlock.zone === 'deep-work' ? (isSunday ? '💼 Strategy' : '🔥 Focus Block') :
                   activeBlock.zone === 'sleep' ? '💤 Sleep' : '🛡️ Reset'}
                </span>
              </span>

              <h3 id="current-phase-activity-label" className="text-sm font-bold text-slate-100 mt-1">
                {activeBlock.activity}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeBlock.details}
              </p>
            </div>

            {/* Progress bar inside active block */}
            <div className="mt-6 space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold">
                <span>STARTED {activeBlock.startTimeFormatted}</span>
                <span className={isSunday ? 'text-amber-400' : 'text-cyan-400'}>{elapsedPercent}% ELAPSED</span>
                <span>NEXT {nextBlock.startTimeFormatted}</span>
              </div>
              <div className="w-full bg-[#08080c] h-1.5 rounded-full overflow-hidden border border-white/[0.04] p-px">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    activeBlock.zone === 'deep-work' ? (isSunday ? 'bg-amber-500' : 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]') :
                    activeBlock.zone === 'sleep' ? 'bg-indigo-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${elapsedPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hour Warp Simulator checkbox/slider wrapper */}
          <div className="bg-[#08080c] p-4 rounded-xl border border-white/[0.04] flex flex-col items-start gap-3 monk-panel-sage">
            <label className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider">
              <input 
                type="checkbox"
                checked={isWarpMode}
                onChange={(e) => setIsWarpMode(e.target.checked)}
                className="rounded bg-[#0a0a0f] border-white/[0.08] text-cyan-400 checked:bg-cyan-400"
              />
              Chronology Warp Simulator
            </label>

            {isWarpMode && (
              <div className="flex items-center gap-3 w-full justify-between pt-1">
                <span className="text-[9px] font-mono text-slate-550">00:00</span>
                <input 
                  type="range"
                  min="0"
                  max="23"
                  step="1"
                  value={simulatedHour}
                  onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                  className="flex-1 accent-cyan-400 bg-white/[0.04] h-1 rounded appearance-none cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-550">23:00</span>
                <span className="text-xs font-mono font-bold bg-[#0a0a0f] px-2.5 py-1 text-cyan-400 rounded-md border border-white/[0.04] shadow-md">
                  {String(simulatedHour).padStart(2, '0')}:00
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
