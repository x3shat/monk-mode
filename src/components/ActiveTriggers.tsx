/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  BookOpen, 
  Clock, 
  Play, 
  RotateCcw, 
  AlertOctagon, 
  HeartHandshake, 
  Eye, 
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import { WillpowerRule } from '../types';

interface ActiveTriggersProps {
  rules: WillpowerRule[];
  onAddRule: (rule: Omit<WillpowerRule, 'id'>) => void;
  onUpdateRule: (rule: WillpowerRule) => void;
  onDeleteRule: (id: number) => void;
}

export default function ActiveTriggers({ 
  rules, 
  onAddRule, 
  onUpdateRule, 
  onDeleteRule 
}: ActiveTriggersProps) {
  const [activeIntervention, setActiveIntervention] = useState<'none' | 'pushups' | 'override' | 'flatline'>('none');
  
  // Modal & Form state for Willpower Rule CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WillpowerRule | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formIntervention, setFormIntervention] = useState('');
  const [formDetails, setFormDetails] = useState('');

  // 10-Min Override state
  const [overrideSecs, setOverrideSecs] = useState(600); // 10 minutes
  const [isOverrideRunning, setIsOverrideRunning] = useState(false);

  // Pushup counters
  const [completedRepCount, setCompletedRepCount] = useState(0);

  const getRuleBorderClass = (rule: WillpowerRule) => {
    const text = `${rule.title} ${rule.condition} ${rule.intervention} ${rule.details}`.toLowerCase();
    
    // SOS/craving rules - faint red border
    if (
      text.includes('craving') || 
      text.includes('urge') || 
      text.includes('quit') || 
      text.includes('drop') || 
      text.includes('emergency') || 
      text.includes('somatic') ||
      rule.id === 3 || 
      rule.id === 5
    ) {
      return 'border-red-500/20 hover:border-red-500/40 shadow-[0_2px_20px_rgba(239,68,68,0.02)]';
    }
    
    // Mental reset / mindfulness rules - faint blue border
    if (
      text.includes('reset') || 
      text.includes('solitude') || 
      text.includes('dining') || 
      text.includes('silent') || 
      text.includes('shower') || 
      text.includes('cryo') || 
      text.includes('stare') || 
      text.includes('wall') ||
      rule.id === 1 || 
      rule.id === 2 || 
      rule.id === 4 || 
      rule.id === 6
    ) {
      return 'border-blue-500/20 hover:border-blue-500/40 shadow-[0_2px_20px_rgba(59,130,246,0.02)]';
    }
    
    // Default green stabilizer rules - faint emerald border
    return 'border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_2px_20px_rgba(16,185,129,0.02)]';
  };

  useEffect(() => {
    let interval: any = null;
    if (isOverrideRunning && overrideSecs > 0) {
      interval = setInterval(() => {
        setOverrideSecs((s) => s - 1);
      }, 1000);
    } else if (overrideSecs === 0) {
      setIsOverrideRunning(false);
      try {
        const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.setValueAtTime(580, audio.currentTime);
        gain.gain.setValueAtTime(0.3, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 1.2);
        osc.start();
        osc.stop(audio.currentTime + 1.2);
      } catch (e) {
        console.warn(e);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOverrideRunning, overrideSecs]);

  const handleStartOverride = () => {
    setIsOverrideRunning(true);
  };

  const handlePauseOverride = () => {
    setIsOverrideRunning(false);
  };

  const handleResetOverride = () => {
    setIsOverrideRunning(false);
    setOverrideSecs(600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCondition.trim() || !formIntervention.trim() || !formDetails.trim()) return;

    if (editingRule) {
      onUpdateRule({
        id: editingRule.id,
        title: formTitle.trim(),
        condition: formCondition.trim(),
        intervention: formIntervention.trim(),
        details: formDetails.trim()
      });
    } else {
      onAddRule({
        title: formTitle.trim(),
        condition: formCondition.trim(),
        intervention: formIntervention.trim(),
        details: formDetails.trim()
      });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div id="active-willpower-triggers-card" className="bg-[#0a0a0f] rounded-2xl border border-white/[0.04] p-6 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Dynamic Navigation Tabs inside triggers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            <ShieldAlert size={16} className="text-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
            Active Willpower Operating Rules
          </h2>
          <p className="text-[10px] text-cyan-400/90 font-mono mt-1 uppercase font-bold tracking-wider">
            Interactive interventions when cognitive failure points occur
          </p>
        </div>

        <button
          id="add-willpower-rule-btn"
          onClick={() => {
            setEditingRule(null);
            setFormTitle('');
            setFormCondition('');
            setFormIntervention('');
            setFormDetails('');
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all border border-cyan-400/30"
        >
          <Plus size={13} />
          Add Willpower Rule
        </button>
      </div>

      {/* SOS Prompt Buttons */}
      <div className="flex flex-wrap items-center gap-2">
          <button
            id="sos-trigger-urge-btn"
            onClick={() => {
              setActiveIntervention('pushups');
              setCompletedRepCount(0);
            }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 hover:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.08)] transition-all cursor-pointer"
          >
            ⚠️ SOS: CRAVING OR URGE HITTING
          </button>
          
          <button
            id="sos-trigger-struggle-btn"
            onClick={() => {
              setActiveIntervention('override');
              setIsOverrideRunning(false);
              setOverrideSecs(600);
            }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-amber-950/20 hover:bg-amber-950/40 text-amber-500 border border-amber-900/40 hover:border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.08)] transition-all cursor-pointer"
          >
            🔥 STRUGGLING WITH SESSION
          </button>

          <button
            id="sos-trigger-flatline-btn"
            onClick={() => {
              setActiveIntervention('flatline');
            }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.08)] transition-all cursor-pointer"
          >
            ⚖️ DISCUSS FLATLINE PHASE
          </button>
        </div>

      {/* Active Interventions Workspace (Displayed on Trigger) */}
      {activeIntervention !== 'none' && (
        <div className="bg-[#050508] border border-white/[0.04] p-5 rounded-2xl shadow-inner relative overflow-hidden">
          
          {/* Subtle teal background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl pointer-events-none rounded-full"></div>

          <button 
            id="close-intervention-workspace"
            onClick={() => setActiveIntervention('none')}
            className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            ✕ Dismiss SOS
          </button>

          {/* SOS 1: PUSHUP GAUNTLET */}
          {activeIntervention === 'pushups' && (
            <div className="space-y-4 max-w-xl relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1 font-bold">
                <AlertOctagon size={12} className="text-cyan-400" />
                EMERGENCY SOMATIC DISRUPTION (RULE #3)
              </span>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Craving Emergency Protocol In Action
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your prefrontal cortex is being hijacked by historical dopamine tracks. We must force a biological override. Stop looking at your laptop screens or devices, drop, and complete 10 pushups right now!
              </p>

              {/* Rep counter game */}
              <div className="flex items-center gap-4 py-2">
                <div className="text-center bg-[#0a0a0f] px-5 py-3 rounded-xl border border-white/[0.04] shadow-md">
                  <span className="text-3xl font-mono font-data font-bold text-white tracking-widest">
                    {completedRepCount}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block mt-1 tracking-wider uppercase font-bold">REPS LOGGED</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    id="add-pushup-rep-btn"
                    onClick={() => setCompletedRepCount((r) => Math.min(10, r + 1))}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                  >
                    + Log 1 Pushup Rep
                  </button>
                  <button 
                    onClick={() => setCompletedRepCount(0)}
                    className="text-[10px] text-slate-500 hover:text-slate-400 font-mono font-bold transition-colors"
                  >
                    Reset Count
                  </button>
                </div>
              </div>

              {completedRepCount >= 10 ? (
                <div className="bg-cyan-950/20 border border-cyan-400/20 p-3 rounded-lg text-xs text-cyan-400 font-mono animate-fade-in flex items-center gap-2">
                  <Flame size={14} className="text-cyan-400 animate-pulse" />
                  GAUNTLET CLEARED: Craving pattern disrupted. Sit back at your desk, drink water, and commence studying!
                </div>
              ) : (
                <p className="text-[10px] text-cyan-400/80 font-mono font-semibold">
                  ⚠ Goal: Complete 10 reps to break the automatic impulse loop.
                </p>
              )}
            </div>
          )}

          {/* SOS 2: 10-MINUTE FOCUS GAUNTLET */}
          {activeIntervention === 'override' && (
            <div className="space-y-4 max-w-xl relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1 font-bold">
                <Flame size={12} className="text-cyan-400" />
                MENTAL FORTITUDE OVERRIDE PROTOCOL (RULE #5)
              </span>
              <h3 className="text-base font-bold text-slate-100">
                10-Minute Refocus Lock-In
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your brain is trying to trade immediate discomfort for distracting dopamine. Force yourself to focus for exactly 10 more minutes. Once this timer ends, if you still want to quit, you are allowed to walk away. 95% of the time, the stress clears within 5 minutes.
              </p>

              {/* Timer UI */}
              <div className="flex items-center gap-6 py-2">
                <span className="text-4xl font-mono font-data text-white font-bold tracking-tight bg-[#0a0a0f] px-5 py-3 rounded-xl border border-white/[0.04] shadow-md">
                  {Math.floor(overrideSecs / 60)}:{(overrideSecs % 60).toString().padStart(2, '0')}
                </span>

                <div className="flex items-center gap-2">
                  {isOverrideRunning ? (
                    <button 
                      onClick={handlePauseOverride}
                      className="px-4 py-2 bg-[#0a0a0f] hover:bg-white/[0.04] text-slate-350 border border-white/[0.08] rounded-lg text-xs font-mono font-bold cursor-pointer"
                    >
                      Pause Focus
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartOverride}
                      className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg text-xs font-mono font-bold cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                    >
                      Start Focus
                    </button>
                  )}
                  <button 
                    onClick={handleResetOverride}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {overrideSecs === 0 && (
                <div className="bg-cyan-950/20 border border-cyan-400/20 text-cyan-400 p-3 rounded-md text-xs font-mono font-bold">
                  🪖 Hard override completed! Willpower strengthened. You survived the micro-quit request.
                </div>
              )}
            </div>
          )}

          {/* SOS 3: DISCUSS THE FLATLINE CLINICAL GUIDE */}
          {activeIntervention === 'flatline' && (
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1 font-bold">
                <HeartHandshake size={12} className="text-cyan-400" />
                COGNITIVE MAP: THE FLATLINE ZONE
              </span>
              <h3 className="text-base font-bold text-slate-100">
                Brain Healing Guidance: Days 15–45
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-3">
                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-white/[0.04] space-y-1.5 shadow-md hover:border-white/[0.08] transition-colors">
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-wide">1st THE PHENOMENON</span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Lethargy, total lack of motivation, and mild loneliness. This is absolutely NOT depression or actual loss of talent. Keep studying anyway.
                  </p>
                </div>

                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-white/[0.04] space-y-1.5 shadow-md hover:border-white/[0.08] transition-colors">
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-wide">2nd THE BIOLOGICAL CAUSE</span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Your dopamine receptors are physically down-regulated from historical over-stimulation. They are healing and resizing to enjoy simple activities like math or database design.
                  </p>
                </div>

                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-white/[0.04] space-y-1.5 shadow-md hover:border-white/[0.08] transition-colors">
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-wide">3rd THE SOLUTION</span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Radical acceptance. Do not seek alternate stimulations. Lean heavily on your daily 10-minute focus routines and cold showers. Elite mental space waiting at Day 45!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Grid of the willpower operating rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rules.map((rule) => (
          <div 
            key={rule.id}
            className={`p-5 bg-[#050508]/50 border rounded-xl space-y-3 flex flex-col justify-between hover:bg-[#08080c]/80 transition-all duration-300 group willpower-rule-card ${getRuleBorderClass(rule)}`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/20 border border-cyan-400/20 rounded px-2 py-0.5 group-hover:bg-cyan-900/20 transition-all">
                    RULE {rule.id}
                  </span>
                  
                  {/* Edit/Delete CRUD action icons */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setFormTitle(rule.title);
                        setFormCondition(rule.condition);
                        setFormIntervention(rule.intervention);
                        setFormDetails(rule.details);
                        setIsModalOpen(true);
                      }}
                      className="p-0.5 text-slate-505 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the rule: "${rule.title}"?`)) {
                          onDeleteRule(rule.id);
                        }
                      }}
                      className="p-0.5 text-slate-505 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-550 select-none">
                  {rule.condition}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                {rule.title}
              </h4>
              <p className={`text-xs font-bold font-mono ${rule.id === 3 ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-cyan-400/90'}`}>
                ↳ {rule.intervention}
              </p>
              <p className="text-[11px] text-slate-450 leading-relaxed font-sans mt-1">
                {rule.details}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ADD/EDIT WILLPOWER RULE MODAL OVERLAY ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/[0.08] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 flex items-center gap-1.5 animate-pulse">
                <ShieldAlert size={13} />
                {editingRule ? 'EDIT WILLPOWER RULE' : 'ADD WILLPOWER RULE'}
              </span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Rule Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Silent Dining"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-5 py-3.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Condition *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Meal time"
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-5 py-3.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Intervention *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Eat food in total silence"
                  value={formIntervention}
                  onChange={(e) => setFormIntervention(e.target.value)}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-5 py-3.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">Biological/Reasoning Details *</label>
                <textarea 
                  required
                  placeholder="Explain the neurobiological purpose or habit loop hack..."
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  rows={3}
                  className="bg-[#08080c] border border-white/[0.04] text-xs px-5 py-3.5 rounded-xl text-slate-200 outline-none focus:border-cyan-400/50 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-[#08080c] hover:bg-white/5 border border-white/[0.04] text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Commit Rule
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
