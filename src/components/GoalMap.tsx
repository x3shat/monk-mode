/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Database, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  Check, 
  Trash2, 
  X, 
  ChevronRight, 
  Award, 
  GitBranch,
  ChevronDown
} from 'lucide-react';
import { GoalNode } from '../types';

interface GoalMapProps {
  goals: GoalNode[];
  onToggleGoalStatus: (id: string) => void;
  onAddGoal: (goal: GoalNode) => void;
  onDeleteGoal: (id: string) => void;
  theme?: 'dark' | 'light';
}

export default function GoalMap({ 
  goals, 
  onToggleGoalStatus, 
  onAddGoal, 
  onDeleteGoal,
  theme
}: GoalMapProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalNode | null>(null);
  const [customGoalNote, setCustomGoalNote] = useState('');
  
  // Collapsible columns visibility state
  const [isPrimaryExpanded, setIsPrimaryExpanded] = useState(true);
  const [isTechExpanded, setIsTechExpanded] = useState(true);
  const [isSecondaryExpanded, setIsSecondaryExpanded] = useState(true);
  
  // Add Goal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'primary' | 'data-engineering' | 'secondary-option'>('primary');
  const [formTargets, setFormTargets] = useState('');
  const [formBullets, setFormBullets] = useState('');

  // Local helper for goal tracking notes (custom sub-tasks)
  const [goalTracks, setGoalTracks] = useState<Record<string, string[]>>({
    'cat-2026': ['Daily 1 VARC section test', 'Finish average and mixtures quantitative chapters'],
    'data-eng': ['Build custom clickstream ingestion project with PySpark', 'Complete 15 medium SQL problems on Stratascratch'],
  });

  const addGoalTrack = (goalId: string) => {
    if (!customGoalNote.trim()) return;
    setGoalTracks((prev) => ({
      ...prev,
      [goalId]: [...(prev[goalId] || []), customGoalNote.trim()]
    }));
    setCustomGoalNote('');
  };

  const removeGoalTrack = (goalId: string, index: number) => {
    setGoalTracks((prev) => ({
      ...prev,
      [goalId]: (prev[goalId] || []).filter((_, i) => i !== index)
    }));
  };

  // Form submission handler
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newGoal: GoalNode = {
      id: `goal-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || undefined,
      description: formDescription.trim() || undefined,
      targets: formTargets.split(',').map(t => t.trim()).filter(Boolean),
      bullets: formBullets.split('\n').map(b => b.trim()).filter(Boolean),
      status: 'active',
      category: formCategory
    };

    onAddGoal(newGoal);
    
    // Reset form states
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormCategory('primary');
    setFormTargets('');
    setFormBullets('');
    setIsAddModalOpen(false);
  };

  // Delete handler with strong confirmation warning
  const handleDeleteGoalClick = (goal: GoalNode) => {
    const doubleConfirmMessage = `⚠️ WARNING: CRITICAL DELETION REQUEST ⚠️\n\n` + 
      `Are you absolutely sure you want to delete the goal: "${goal.title.toUpperCase()}"?\n\n` +
      `This will permanently erase all associated targets, reps, and logged subtasks.\n` +
      `This action CANNOT BE UNDONE and is highly destructive.\n\n` +
      `Type "OK" to proceed with deletion.`;
      
    if (window.confirm(doubleConfirmMessage)) {
      onDeleteGoal(goal.id);
      setSelectedGoal(null);
    }
  };

  // Separate goals by category
  const primaryGoals = goals.filter(g => g.category === 'primary');
  const techGoals = goals.filter(g => g.category === 'data-engineering');
  const secondaryGoals = goals.filter(g => g.category === 'secondary-option');

  const isLight = theme === 'light';

  return (
    <>
      <div id="goal-mind-map-section" className="bg-[#0a0a0f] rounded-2xl border border-white/[0.04] p-6 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative">
      
      {/* Mindmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Target size={16} className="text-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
            Monk Mode Objective Tree
          </h2>
          <p className="text-[10px] text-cyan-400/90 font-mono mt-1 font-bold tracking-wider uppercase">
            Sleek Node Map detailing Core Goals & Secondary Options
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all border border-cyan-400/30"
          >
            <Plus size={13} />
            Add Strategic Goal
          </button>
        </div>
      </div>

      {/* Interactive Visual Graph & Connected Nodes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: SVG Connected Graph / Columns */}
        <div className="lg:col-span-8 space-y-6 relative">
          
          {/* ROOT NODE: Sleek horizontal header card */}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-2xl px-8 py-3.5 rounded-xl bg-[#08080c] border border-cyan-400/30 text-center shadow-[0_4px_25px_rgba(34,211,238,0.06)] flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
                Monk Mode Integrated Strategy Core
              </span>
            </div>
          </div>
          
          {/* SVG Tree Connector Lines (displays on larger screens) */}
          <div className="hidden lg:block w-full h-12 relative -mt-6 mb-2">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Central vertical split line */}
              <line x1="50%" y1="0" x2="50%" y2="20" stroke={isLight ? "rgba(22, 163, 74, 0.45)" : "rgba(34,211,238,0.35)"} strokeWidth="3.5" />
              {/* Horizontal cross beam */}
              <line x1="16.67%" y1="20" x2="83.33%" y2="20" stroke={isLight ? "rgba(22, 163, 74, 0.45)" : "rgba(34,211,238,0.35)"} strokeWidth="3.5" />
              
              {/* Downward drop lines to columns */}
              <line 
                x1="16.67%" 
                y1="20" 
                x2="16.67%" 
                y2="48" 
                stroke={isPrimaryExpanded ? (isLight ? "rgba(22, 163, 74, 0.45)" : "rgba(34,211,238,0.35)") : (isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255,255,255,0.06)")} 
                strokeWidth="3.5" 
                strokeDasharray={isPrimaryExpanded ? "none" : "3,3"}
                className="transition-all duration-300"
              />
              <line 
                x1="50%" 
                y1="20" 
                x2="50%" 
                y2="48" 
                stroke={isTechExpanded ? (isLight ? "rgba(22, 163, 74, 0.45)" : "rgba(34,211,238,0.35)") : (isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255,255,255,0.06)")} 
                strokeWidth="3.5" 
                strokeDasharray={isTechExpanded ? "none" : "3,3"}
                className="transition-all duration-300"
              />
              <line 
                x1="83.33%" 
                y1="20" 
                x2="83.33%" 
                y2="48" 
                stroke={isSecondaryExpanded ? (isLight ? "rgba(22, 163, 74, 0.45)" : "rgba(34,211,238,0.35)") : (isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255,255,255,0.06)")} 
                strokeWidth="3.5" 
                strokeDasharray={isSecondaryExpanded ? "none" : "3,3"}
                className="transition-all duration-300"
              />
              
              {/* Glowing anchor circles */}
              <circle cx="50%" cy="20" r="4.5" fill={isLight ? "#16a34a" : "#22d3ee"} className="animate-pulse" />
              <circle 
                cx="16.67%" 
                cy="20" 
                r="4.5" 
                fill={isPrimaryExpanded ? (isLight ? "#16a34a" : "#22d3ee") : (isLight ? "#cbd5e1" : "#475569")} 
                className={`transition-all duration-300 ${isPrimaryExpanded ? "animate-pulse" : ""}`} 
              />
              <circle 
                cx="83.33%" 
                cy="20" 
                r="4.5" 
                fill={isSecondaryExpanded ? (isLight ? "#16a34a" : "#22d3ee") : (isLight ? "#cbd5e1" : "#475569")} 
                className={`transition-all duration-300 ${isSecondaryExpanded ? "animate-pulse" : ""}`} 
              />
            </svg>
          </div>

          {/* 3-Column Branch Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Primary Goals */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    Primary Focus
                  </span>
                  <span className="text-[9px] font-mono text-slate-550 block mt-0.5">Academic/Core Benchmarks</span>
                </div>
                <button
                  onClick={() => setIsPrimaryExpanded(!isPrimaryExpanded)}
                  className="p-1 hover:bg-white/[0.04] text-slate-500 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                  title={isPrimaryExpanded ? "Collapse Column" : "Expand Column"}
                >
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform duration-250 ${isPrimaryExpanded ? '' : '-rotate-90'}`}
                  />
                </button>
              </div>

              <div 
                className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 origin-top ${
                  isPrimaryExpanded 
                    ? 'max-h-[1000px] opacity-100 scale-y-100' 
                    : 'max-h-0 opacity-0 scale-y-0 pointer-events-none'
                }`}
              >
                {primaryGoals.map((g) => (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedGoal(g)}
                    className={`p-4 rounded-xl border hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer ${
                      selectedGoal?.id === g.id 
                        ? 'bg-[#0e0e14] border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)] scale-[1.02]' 
                        : 'bg-[#050508]/60 border-white/[0.04] hover:border-white/[0.1] hover:bg-[#08080c]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-cyan-400" />
                        {g.title}
                      </h3>
                      {g.status === 'completed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Completed"></span>
                      )}
                    </div>
                    {g.subtitle && (
                      <p className="text-[10px] font-mono text-slate-500 mt-1 font-semibold truncate">{g.subtitle}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{g.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30">
                        {g.targets[0] || 'Active'}
                      </span>
                      <ChevronRight size={12} className="text-slate-650" />
                    </div>
                  </div>
                ))}

                {primaryGoals.length === 0 && (
                  <span className="text-[10px] text-slate-600 block text-center py-4 bg-white/[0.01] border border-dashed border-white/[0.04] rounded-xl italic">
                    No primary goals
                  </span>
                )}
              </div>
            </div>

            {/* Column 2: Technical/Data Engineering */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    Technical Stack
                  </span>
                  <span className="text-[9px] font-mono text-slate-550 block mt-0.5">Engineering & Modeling</span>
                </div>
                <button
                  onClick={() => setIsTechExpanded(!isTechExpanded)}
                  className="p-1 hover:bg-white/[0.04] text-slate-500 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                  title={isTechExpanded ? "Collapse Column" : "Expand Column"}
                >
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform duration-250 ${isTechExpanded ? '' : '-rotate-90'}`}
                  />
                </button>
              </div>

              <div 
                className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 origin-top ${
                  isTechExpanded 
                    ? 'max-h-[1000px] opacity-100 scale-y-100' 
                    : 'max-h-0 opacity-0 scale-y-0 pointer-events-none'
                }`}
              >
                {techGoals.map((g) => (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedGoal(g)}
                    className={`p-4 rounded-xl border hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer ${
                      selectedGoal?.id === g.id 
                        ? 'bg-[#0e0e14] border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)] scale-[1.02]' 
                        : 'bg-[#050508]/60 border-white/[0.04] hover:border-white/[0.1] hover:bg-[#08080c]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Database size={12} className="text-cyan-400" />
                        {g.title}
                      </h3>
                      {g.status === 'completed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      )}
                    </div>
                    {g.subtitle && (
                      <p className="text-[10px] font-mono text-slate-500 mt-1 font-semibold truncate">{g.subtitle}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{g.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30">
                        {g.targets[0] || 'Active'}
                      </span>
                      <ChevronRight size={12} className="text-slate-650" />
                    </div>
                  </div>
                ))}

                {techGoals.length === 0 && (
                  <span className="text-[10px] text-slate-600 block text-center py-4 bg-white/[0.01] border border-dashed border-white/[0.04] rounded-xl italic">
                    No technical stack goals
                  </span>
                )}
              </div>
            </div>

            {/* Column 3: Secondary Options */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    Secondary Options
                  </span>
                  <span className="text-[9px] font-mono text-slate-550 block mt-0.5">Backup Strategy Paths</span>
                </div>
                <button
                  onClick={() => setIsSecondaryExpanded(!isSecondaryExpanded)}
                  className="p-1 hover:bg-white/[0.04] text-slate-500 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                  title={isSecondaryExpanded ? "Collapse Column" : "Expand Column"}
                >
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform duration-250 ${isSecondaryExpanded ? '' : '-rotate-90'}`}
                  />
                </button>
              </div>

              <div 
                className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 origin-top ${
                  isSecondaryExpanded 
                    ? 'max-h-[1000px] opacity-100 scale-y-100' 
                    : 'max-h-0 opacity-0 scale-y-0 pointer-events-none'
                }`}
              >
                {secondaryGoals.map((g) => (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedGoal(g)}
                    className={`p-4 rounded-xl border hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer ${
                      selectedGoal?.id === g.id 
                        ? 'bg-[#0e0e14] border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)] scale-[1.02]' 
                        : 'bg-[#050508]/60 border-white/[0.04] hover:border-white/[0.1] hover:bg-[#08080c]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <BookOpen size={12} className="text-cyan-455" />
                        {g.title}
                      </h3>
                      {g.status === 'completed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      )}
                    </div>
                    {g.subtitle && (
                      <p className="text-[10px] font-mono text-slate-500 mt-1 font-semibold truncate">{g.subtitle}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{g.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30">
                        {g.targets[0] || 'Secondary'}
                      </span>
                      <ChevronRight size={12} className="text-slate-650" />
                    </div>
                  </div>
                ))}

                {secondaryGoals.length === 0 && (
                  <span className="text-[10px] text-slate-600 block text-center py-4 bg-white/[0.01] border border-dashed border-white/[0.04] rounded-xl italic">
                    No backup alternatives
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Objective Detail Panel & Additional Study Reps Tracker */}
        <div className="lg:col-span-4 bg-[#050508] border border-white/[0.04] p-5 rounded-2xl space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {selectedGoal ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  OBJECTIVE TRACKER
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDeleteGoalClick(selectedGoal)}
                    className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                  <button 
                    onClick={() => setSelectedGoal(null)}
                    className="text-[10px] text-slate-550 hover:text-cyan-450 font-mono font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-105">{selectedGoal.title}</h4>
                {selectedGoal.subtitle && (
                  <p className="text-[11px] text-slate-500 font-mono font-semibold mt-0.5">{selectedGoal.subtitle}</p>
                )}
                <div className="mt-2 text-xs text-slate-400 leading-relaxed bg-[#0a0a0f] p-3 rounded-xl border border-white/[0.04] shadow-md">
                  {selectedGoal.description}
                </div>
              </div>

              {/* Subtask list */}
              {selectedGoal.targets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">
                    CORE TARGETS ({selectedGoal.targets.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGoal.targets.map((t, idx) => (
                      <span key={idx} className="bg-cyan-950/20 text-cyan-300 border border-cyan-900/30 text-[10px] font-mono px-2.5 py-1 rounded-full">
                        🎯 {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGoal.bullets.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-550 block font-bold">
                    CORE TARGET REPS
                  </span>
                  <ul className="text-xs text-slate-350 space-y-2 pl-1">
                    {selectedGoal.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-cyan-400 select-none font-bold mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-white/[0.04] pt-3 flex gap-2">
                <button
                  onClick={() => onToggleGoalStatus(selectedGoal.id)}
                  className={`flex-1 py-2 text-[11px] rounded-xl font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedGoal.status === 'completed'
                      ? 'bg-cyan-950/20 border-cyan-800 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                      : 'bg-[#08080c] border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Check size={12} />
                  {selectedGoal.status === 'completed' ? '✓ COMPLETED' : 'MARK COMPLETED'}
                </button>
              </div>

              {/* Tracker Notes */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">
                  Custom Tasks / TODO Achievements
                </span>
                
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {(goalTracks[selectedGoal.id] || []).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-[#0a0a0f] px-3 py-2.5 rounded-xl border border-white/[0.04] text-[11px] text-slate-350">
                      <span>{t}</span>
                      <button 
                        onClick={() => removeGoalTrack(selectedGoal.id, idx)}
                        className="text-[9px] hover:text-red-400 text-slate-500 font-mono font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(goalTracks[selectedGoal.id] || []).length === 0 && (
                    <span className="text-[10px] text-slate-600 block italic">No dynamic objectives logged.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Log a target task..."
                    value={customGoalNote}
                    onChange={(e) => setCustomGoalNote(e.target.value)}
                    className="flex-1 bg-[#0a0a0f] border border-white/[0.04] text-xs px-3 py-2.5 rounded-xl text-slate-200 placeholder:text-slate-650 outline-none hover:border-white/[0.08] focus:border-cyan-400/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addGoalTrack(selectedGoal.id);
                    }}
                  />
                  <button 
                    onClick={() => addGoalTrack(selectedGoal.id)}
                    className="bg-cyan-400 hover:bg-cyan-300 text-black px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <BookOpen size={20} className="text-slate-650 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold">No Objective Selected</p>
                <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed font-sans">
                  Click on any target, stack node, or secondary alternative branch on the connected tree diagram to track active sub-tasks or manage progress milestones.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ─── ADD STRATEGIC GOAL MODAL OVERLAY ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/[0.08] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Target size={13} />
                ADD NEW STRATEGIC GOAL
              </span>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGoal} className="p-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Goal Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CAT Exam or MTech AI Prep"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Subtitle</label>
                <input 
                  type="text" 
                  placeholder="e.g. November 2026 or Spring Semester"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Category</label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50 cursor-pointer"
                >
                  <option value="primary">Primary Focus</option>
                  <option value="data-engineering">Technical Stack</option>
                  <option value="secondary-option">Secondary Option (Backup)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Description</label>
                <textarea 
                  placeholder="Summarize the core target and purpose of this academic or study routine track..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Targets (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 99% in CAT, Complete SQL theory"
                  value={formTargets}
                  onChange={(e) => setFormTargets(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Reps/Subtasks (one per line)</label>
                <textarea 
                  placeholder="Enter specific checklist items or daily actions required..."
                  value={formBullets}
                  onChange={(e) => setFormBullets(e.target.value)}
                  rows={3}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-3.5 py-2.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-[#08080c] hover:bg-white/5 border border-white/[0.04] text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Commit Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
