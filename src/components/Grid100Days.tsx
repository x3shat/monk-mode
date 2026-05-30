/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Award, Sparkles, BookOpen, Clock, RefreshCw, Grid } from 'lucide-react';
import { DayProgress, DayStatus } from '../types';

interface Grid100DaysProps {
  days: DayProgress[];
  selectedDayNumber: number;
  startDate: string | null;
  onSelectDay: (num: number) => void;
  onUpdateDayStatus: (num: number, status: DayStatus) => void;
  onUpdateDayNotes: (num: number, notes: string[]) => void;
  onUpdateDayHours: (num: number, hours: number) => void;
  onResetGrid: () => void;
  onSetStartDate: (date: string) => void;
  onResetJourney: () => void;
}

export default function Grid100Days({
  days,
  selectedDayNumber,
  startDate,
  onSelectDay,
  onUpdateDayStatus,
  onUpdateDayNotes,
  onUpdateDayHours,
  onResetGrid,
  onSetStartDate,
  onResetJourney
}: Grid100DaysProps) {
  const [newNote, setNewNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeMonth, setActiveMonth] = useState<{ month: number, year: number } | null>(null);

  const getTodayDayNumber = (): number | null => {
    if (!startDate) return null;
    const sDate = new Date(startDate);
    const today = new Date();
    const d1 = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const dayNumber = diffDays + 1;
    return (dayNumber >= 1 && dayNumber <= 100) ? dayNumber : null;
  };

  const todayDayNumber = getTodayDayNumber();

  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate);
      setActiveMonth({ month: d.getMonth(), year: d.getFullYear() });
    }
  }, [startDate]);
  
  const selectedDay = days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updatedNotes = [...selectedDay.notes, newNote.trim()];
    onUpdateDayNotes(selectedDay.dayNumber, updatedNotes);
    setNewNote('');
  };

  const handleDeleteNote = (index: number) => {
    const updatedNotes = selectedDay.notes.filter((_, i) => i !== index);
    onUpdateDayNotes(selectedDay.dayNumber, updatedNotes);
  };

  const handleStatusChange = (status: DayStatus) => {
    onUpdateDayStatus(selectedDay.dayNumber, status);
  };

  const handleHoursChange = (val: string) => {
    const hrs = parseFloat(val) || 0;
    onUpdateDayHours(selectedDay.dayNumber, Math.max(0, Math.min(24, hrs)));
  };

  const getSymmetricalColorPattern = (day: DayProgress) => {
    if (day.status === 'completed') {
      // Completed colors based on milestone checkpoints
      if (day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100) {
        return 'bg-amber-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse';
      }
      return 'bg-green-400 hover:bg-green-355 text-black border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.45)]';
    }
    if (day.status === 'missed') {
      return 'bg-red-950/80 text-red-300 border border-red-900/40';
    }
    if (day.status === 'unlocked') {
      return 'bg-[#08080c] text-slate-100 border border-green-500/20 animate-pulse hover:bg-[#0a0a0f]';
    }
    // Standard locked state
    if (day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100) {
      return 'bg-[#050508]/50 text-amber-500/80 border border-amber-950 hover:bg-white/5';
    }
    return 'bg-white/5 text-slate-650 border border-white/[0.04] hover:bg-white/10';
  };

  const totalCompleted = days.filter((d) => d.status === 'completed').length;
  const totalMissed = days.filter((d) => d.status === 'missed').length;

  const getMonthsList = (startDateStr: string | null): { month: number, year: number, name: string }[] => {
    if (!startDateStr) return [];
    const start = new Date(startDateStr);
    const monthsListLocal: { month: number, year: number, name: string }[] = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + 99);
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      monthsListLocal.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        name: `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      });
      current.setMonth(current.getMonth() + 1);
    }
    return monthsListLocal;
  };

  // Helper: map a calendar date to a monk mode day number (1-100)
  const getDayForDate = (year: number, month: number, dateNum: number): DayProgress | undefined => {
    if (!startDate) return undefined;
    const sDate = new Date(startDate);
    const currentDate = new Date(year, month, dateNum);
    
    const d1 = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const d2 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const dayNumber = diffDays + 1;
    
    if (dayNumber >= 1 && dayNumber <= 100) {
      return days.find((d) => d.dayNumber === dayNumber);
    }
    return undefined;
  };

  // Generate calendar grid for a given month in 2026
  const generateMonthGrid = (month: number, year: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
    const totalDays = new Date(year, month + 1, 0).getDate(); // days in this month
    
    const cells: { dateNum: number | null; dayProgress?: DayProgress }[] = [];
    
    // Padding for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateNum: null });
    }
    
    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dayProgress = getDayForDate(year, month, d);
      cells.push({ dateNum: d, dayProgress });
    }
    
    return cells;
  };

  if (!startDate) {
    return (
      <div className="bg-[#0a0a0f] p-8 border border-white/[0.04] rounded-2xl max-w-xl mx-auto text-center space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] my-12">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
            <Calendar size={24} className="animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">Launch Your Monk Mode Journey</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Every elite challenge needs a clear launch coordinate. Select your Start Date below to calibrate the 100-day strategic grid and calendar view.
          </p>
        </div>

        <div className="bg-[#050508] border border-white/[0.04] p-5 rounded-xl space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Select Launch Date</label>
            <input 
              type="date" 
              id="journey-start-date-picker"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="bg-[#08080c] border border-white/[0.06] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-green-500/50 cursor-pointer w-full text-center"
            />
          </div>
          
          <button
            onClick={() => {
              const picker = document.getElementById('journey-start-date-picker') as HTMLInputElement;
              if (picker && picker.value) {
                onSetStartDate(picker.value);
              }
            }}
            className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black text-xs font-mono font-bold rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all cursor-pointer"
          >
            LAUNCH MONK MODE SYSTEM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="monk-grid-root-wrapper" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* 10x10 Central Grid Board or Calendar Board */}
      <div className="xl:col-span-8 bg-[#0a0a0f] p-6 md:p-8 border border-white/[0.04] rounded-2xl flex flex-col gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
              <Calendar size={16} className="text-cyan-400" />
              <span>{viewMode === 'grid' ? 'The 100-Day Strategic Grid' : 'Real-World Calendar View'}</span>
              {startDate && (
                <span className="text-[10px] bg-green-950/20 text-green-400 border border-green-800/30 px-2 py-0.5 rounded font-mono font-semibold ml-2 shadow-[0_0_8px_rgba(74,222,128,0.1)]">
                  Launch Coordinates: {new Date(startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono uppercase">
              {viewMode === 'grid' 
                ? '10x10 matrix highlighting milestone checkpoints' 
                : `Monk journey mapped dynamically starting from ${new Date(startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex bg-[#08080c] border border-white/[0.04] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04]'
                    : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <Grid size={11} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04]'
                    : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <Calendar size={11} />
                Calendar
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-[#08080c] border border-white/[0.04] px-3 py-1.5 rounded-lg">
              <Award size={12} className="text-amber-500" />
              <span>Milestones: D25, D50, D75, D100</span>
            </div>
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to reset your entire Monk Mode journey? This will clear the start date and reset all logged data.")) {
                  onResetJourney();
                }
              }}
              className="px-2 py-1.5 bg-[#08080c] text-slate-400 hover:text-rose-455 text-[10px] font-mono border border-white/[0.04] rounded-lg hover:border-rose-900/40 cursor-pointer flex items-center gap-1 transition-all"
            >
              <RefreshCw size={10} />
              Reset Journey
            </button>
          </div>
        </div>

        {/* ─── RENDER GRID VIEW ─── */}
        {viewMode === 'grid' && (
          <div 
            id="monk-10x10-grid"
            className="grid grid-cols-10 gap-1.5 md:gap-2.5 max-w-2xl mx-auto w-full aspect-square md:aspect-auto select-none"
          >
            {days.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              const isMilestone = day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100;
              return (
                <button
                  key={day.dayNumber}
                  id={`grid-day-cell-${day.dayNumber}`}
                  onClick={() => onSelectDay(day.dayNumber)}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center text-xs font-semibold font-mono relative transition-all duration-150 cursor-pointer ${
                    day.dayNumber === todayDayNumber
                      ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-black animate-pulse z-10'
                      : (isSelected ? 'ring-2 ring-green-400 shadow-[0_0_12px_rgba(74,222,128,0.55)] z-10' : '')
                  } ${isSelected ? 'scale-105' : ''} ${getSymmetricalColorPattern(day)} ${day.status === 'completed' ? 'monk-cell-completed' : day.status === 'missed' ? 'monk-cell-missed' : 'monk-cell-uncompleted'}`}
                >
                  <span>{day.dayNumber}</span>
                  {isMilestone && day.status !== 'completed' && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-amber-400/80 rounded-full"></span>
                  )}
                  {isMilestone && day.status === 'completed' && (
                    <Award size={8} className="absolute bottom-1.5 text-black" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── RENDER CALENDAR VIEW ─── */}
        {viewMode === 'calendar' && (
          <div className="flex flex-col gap-4">
            {/* Month Tabs */}
            <div className="flex flex-wrap gap-1.5 justify-center border-b border-white/[0.04] pb-3">
              {getMonthsList(startDate).map((m) => (
                <button
                  key={`${m.month}-${m.year}`}
                  onClick={() => setActiveMonth({ month: m.month, year: m.year })}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                    activeMonth && activeMonth.month === m.month && activeMonth.year === m.year
                      ? 'bg-green-950/40 text-green-400 font-bold border border-green-800/30'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[10px] font-mono text-slate-500 font-bold uppercase">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days Matrix */}
            <div id="monk-calendar-matrix" className="grid grid-cols-7 gap-1 md:gap-2 select-none">
              {activeMonth && generateMonthGrid(activeMonth.month, activeMonth.year).map((cell, idx) => {
                if (cell.dateNum === null) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-transparent"></div>;
                }

                const day = cell.dayProgress;
                if (!day) {
                  // Non-monk mode date
                  return (
                    <div
                      key={`nonmonk-${idx}`}
                      className="w-full aspect-square rounded-xl flex flex-col justify-between p-1.5 bg-white/[0.01] border border-white/[0.01] text-slate-650 opacity-20 select-none text-[9px] font-mono"
                    >
                      <span className="self-end mr-1">{cell.dateNum}</span>
                    </div>
                  );
                }

                // Monk Mode Date
                const isSelected = day.dayNumber === selectedDayNumber;
                const isMilestone = day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100;
                
                return (
                  <button
                    key={`monkday-${idx}`}
                    onClick={() => onSelectDay(day.dayNumber)}
                    className={`w-full aspect-square rounded-xl p-1.5 flex flex-col justify-between relative transition-all duration-150 cursor-pointer ${
                      day.dayNumber === todayDayNumber
                        ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-black animate-pulse z-10'
                        : (isSelected 
                            ? 'ring-2 ring-green-400 bg-[#0e0e16]/80 border-green-500/30 shadow-[0_0_12px_rgba(74,222,128,0.35)] z-10' 
                            : 'bg-[#050508]/60 border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#08080c]'
                          )
                    } ${isSelected ? 'scale-105' : ''} ${day.status === 'completed' ? 'monk-cell-completed' : day.status === 'missed' ? 'monk-cell-missed' : 'monk-cell-uncompleted'}`}
                  >
                    {/* Top Row: Monk Day Number */}
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[8px] font-bold font-mono text-slate-500">D{day.dayNumber}</span>
                      {isMilestone && (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          day.status === 'completed' ? 'bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.6)]' : 'bg-amber-500/40'
                        }`} title="Milestone Day"></span>
                      )}
                    </div>

                    {/* Centered Circle Date Number */}
                    <div className="flex-1 flex items-center justify-center my-1.5">
                      {day.status === 'completed' ? (
                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all shadow-[0_0_10px_rgba(74,222,128,0.45)] ${
                          day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100
                            ? 'bg-amber-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'
                            : 'bg-green-400 text-black border border-green-300'
                        }`}>
                          {cell.dateNum}
                        </div>
                      ) : day.status === 'missed' ? (
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold bg-red-950/85 text-red-300 border border-red-900/40">
                          {cell.dateNum}
                        </div>
                      ) : day.status === 'unlocked' ? (
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold bg-transparent text-slate-200 border border-green-500/25 border-dashed animate-pulse">
                          {cell.dateNum}
                        </div>
                      ) : (
                        // Locked
                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold text-slate-600 ${
                          day.dayNumber === 25 || day.dayNumber === 50 || day.dayNumber === 75 || day.dayNumber === 100
                            ? 'text-amber-500/60 font-bold'
                            : ''
                        }`}>
                          {cell.dateNum}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Study Hours and Notes Dot */}
                    <div className="flex items-center justify-between w-full text-[8px] font-mono leading-none text-slate-500">
                      <span>{day.studyHours > 0 ? `${day.studyHours}h` : ''}</span>
                      {day.notes.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" title={`${day.notes.length} notes`}></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono text-slate-500 border-t border-white/[0.04] pt-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/[0.04]"></span>
            <span>LOCKED / INACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#08080c] border border-green-500/20 animate-pulse"></span>
            <span>UNLOCKED PREVIEW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.35)]"></span>
            <span>DAY COMPLETED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-950 border border-red-900/40"></span>
            <span>MISSED DAY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300"></span>
            <span>GOLD MILESTONE CELEBRATION</span>
          </div>
        </div>

      </div>

      {/* Selected Day Control Board / Journal Entry */}
      <div 
        id="day-detail-panel-journal"
        className="xl:col-span-4 bg-[#0a0a0f] border border-white/[0.04] rounded-2xl p-5 md:p-6 space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] monk-panel-sage"
      >
        <div className="border-b border-white/[0.04] pb-3.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-green-400 block font-semibold">
            SELECTED LOG PANEL
          </span>
          <h3 id="selected-day-header-label" className="text-base font-bold text-slate-100 mt-1 flex items-center justify-between">
            <span>Day {selectedDay.dayNumber} Overview</span>
            <span className="text-xs text-slate-500 font-mono font-normal">
              Progressive grid cell
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 italic">{selectedDay.date}</p>
        </div>

        {/* Day Actions */}
        <div className="space-y-3.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            MARK PERFORMANCE ZONE
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              id="set-day-completed-btn"
              onClick={() => handleStatusChange('completed')}
              className={`py-2 text-[11px] rounded-xl font-mono transition-all border font-medium cursor-pointer ${
                selectedDay.status === 'completed'
                ? 'bg-green-950/30 border-green-800 text-green-400 font-bold shadow-[0_0_8px_rgba(74,222,128,0.2)]'
                : 'bg-[#08080c] border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Completed
            </button>
            <button 
              id="set-day-missed-btn"
              onClick={() => handleStatusChange('missed')}
              className={`py-2 text-[11px] rounded-xl font-mono transition-all border font-medium cursor-pointer ${
                selectedDay.status === 'missed'
                ? 'bg-red-950/60 border-red-800 text-red-300 font-bold'
                : 'bg-[#08080c] border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Missed
            </button>
            <button 
              id="set-day-unlocked-btn"
              onClick={() => handleStatusChange('unlocked')}
              className={`py-2 text-[11px] rounded-xl font-mono transition-all border font-medium cursor-pointer ${
                selectedDay.status === 'unlocked' || selectedDay.status === 'locked'
                ? 'bg-[#08080c] border-white/[0.08] text-slate-300 font-bold'
                : 'bg-[#08080c] border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Preview/Reset
            </button>
          </div>
        </div>

        {/* Study Hours Logger */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            LOG STUDY DURATION (HOURS)
          </label>
          <div className="flex gap-2">
            <input 
              id="selected-day-hours-input"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="e.g. 8.5"
              value={selectedDay.studyHours || ''}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="flex-1 bg-[#08080c] border border-white/[0.04] text-sm px-5 py-3.5 rounded-xl text-slate-200 outline-none placeholder:text-slate-650 focus:border-green-400/50"
            />
            <span className="bg-[#08080c] flex items-center justify-center text-xs px-4 rounded-xl border border-white/[0.04] text-slate-400">
              Hours Checked
            </span>
          </div>
        </div>

        {/* Milestone Badge Reward banner */}
        {(selectedDay.dayNumber === 25 || selectedDay.dayNumber === 50 || selectedDay.dayNumber === 75 || selectedDay.dayNumber === 100) && (
          <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-900/55 flex items-start gap-3">
            <Award size={18} className="text-amber-400 mt-0.5 animate-bounce" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">MILESTONE CHECKPOINT</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Completing Day {selectedDay.dayNumber} unlocks the exclusive {selectedDay.dayNumber}% psychological milestone reward. Preserve elite momentum!
              </p>
            </div>
          </div>
        )}

        {/* Notes list / Daily Logs */}
        <div className="space-y-3 pt-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            DAILY REFLECTIONS & METRICS ({selectedDay.notes.length})
          </label>
          
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {selectedDay.notes.map((note, index) => (
              <div 
                key={index} 
                className="flex items-start justify-between gap-3 p-3 bg-[#08080c] rounded-xl border border-white/[0.04] hover:border-white/[0.08] text-[11px] leading-relaxed text-slate-300"
              >
                <span>- {note}</span>
                <button 
                  onClick={() => handleDeleteNote(index)}
                  className="text-slate-500 hover:text-red-400 transition-all cursor-pointer mt-0.5"
                  title="Delete Note"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {selectedDay.notes.length === 0 && (
              <p className="text-[10px] text-slate-500 italic block py-3 text-center bg-[#08080c]/40 border border-dashed border-white/[0.04] rounded-lg">
                No active reflections logged for Day {selectedDay.dayNumber}.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              id="selected-day-add-note-input"
              type="text"
              placeholder="Add reflection or complete syllabus logs..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 bg-[#08080c] border border-white/[0.04] text-xs px-5 py-3.5 rounded-xl text-slate-200 outline-none focus:border-green-400/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddNote();
              }}
            />
            <button 
              id="selected-day-add-note-btn"
              onClick={handleAddNote}
              className="bg-green-400 hover:bg-green-300 text-black px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-all shadow-[0_0_10px_rgba(74,222,128,0.2)]"
            >
              Add
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
