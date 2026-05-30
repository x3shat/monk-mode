/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Flame, Compass, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusZoneProps {
  onClose: () => void;
}

export default function FocusZone({ onClose }: FocusZoneProps) {
  // Pomodoro timer state
  const [timerMinutes, setTimerMinutes] = useState(90);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Box Breathing cycle: 'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out'
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out'>('Inhale');
  const [breathingSecs, setBreathingSecs] = useState(4);

  // 2-Minute Wall Stare state (Rule #4 Focus Trigger)
  const [stareActive, setStareActive] = useState(false);
  const [stareSecs, setStareSecs] = useState(120);

  // Audio Synthesizer State
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [synthVolume, setSynthVolume] = useState(0.4);
  const [synthType, setSynthType] = useState<'theta' | 'brown' | 'space'>('theta');

  // Refs for audio context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);
  const activeNodesRef = useRef<AudioNode[]>([]);

  // Pomodoro clock timer logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setIsTimerRunning(false);
          setCompletedPomodoros((prev) => prev + 1);
          setTimerMinutes(90);
          setTimerSeconds(0);
          try {
            // Gentle high-pitch beep
            const beepCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = beepCtx.createOscillator();
            const gain = beepCtx.createGain();
            osc.connect(gain);
            gain.connect(beepCtx.destination);
            osc.frequency.setValueAtTime(600, beepCtx.currentTime);
            gain.gain.setValueAtTime(0.3, beepCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, beepCtx.currentTime + 1);
            osc.start();
            osc.stop(beepCtx.currentTime + 1);
          } catch (e) {
            console.warn(e);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  // Wall stare timer logic
  useEffect(() => {
    let interval: any = null;
    if (stareActive) {
      interval = setInterval(() => {
        if (stareSecs > 0) {
          setStareSecs((s) => s - 1);
        } else {
          setStareActive(false);
          setStareSecs(120);
          try {
            const beepCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = beepCtx.createOscillator();
            const gain = beepCtx.createGain();
            osc.connect(gain);
            gain.connect(beepCtx.destination);
            osc.frequency.setValueAtTime(440, beepCtx.currentTime);
            gain.gain.setValueAtTime(0.2, beepCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, beepCtx.currentTime + 0.8);
            osc.start();
            osc.stop(beepCtx.currentTime + 0.8);
          } catch (e) {
            console.warn(e);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stareActive, stareSecs]);

  // Box Breathing cycle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setBreathingSecs((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathingPhase((currentPhase) => {
            switch (currentPhase) {
              case 'Inhale': return 'Hold In';
              case 'Hold In': return 'Exhale';
              case 'Exhale': return 'Hold Out';
              case 'Hold Out': return 'Inhale';
            }
          });
          return 4; // 4 second box
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Synth management for ambient noise
  const startSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Gain Node
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.setValueAtTime(synthVolume * 0.15, ctx.currentTime);
      gainNodeRef.current.connect(ctx.destination);
      activeNodesRef.current.push(gainNodeRef.current);

      if (synthType === 'theta') {
        // Binaural Beats (Theta Waves): Left at 100 Hz, Right at 106 Hz
        const oscL = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(100, ctx.currentTime);
        
        const oscR = ctx.createOscillator();
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(106, ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          oscL.connect(pannerL).connect(gainNodeRef.current);
          oscR.connect(pannerR).connect(gainNodeRef.current);
          
          activeNodesRef.current.push(pannerL);
          activeNodesRef.current.push(pannerR);
        } else {
          oscL.connect(gainNodeRef.current);
          oscR.connect(gainNodeRef.current);
        }

        oscL.start();
        oscR.start();

        activeOscillatorsRef.current.push(oscL, oscR);
        activeNodesRef.current.push(oscL, oscR);
      } else if (synthType === 'brown') {
        // Deep Brown Noise: Brownian noise with deep lowpass filter (150 Hz)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }

        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, ctx.currentTime); // Deep rumble
        filter.Q.setValueAtTime(1, ctx.currentTime);

        brownSource.connect(filter);
        filter.connect(gainNodeRef.current);

        brownSource.start();

        activeOscillatorsRef.current.push(brownSource);
        activeNodesRef.current.push(brownSource, filter);
      } else if (synthType === 'space') {
        // Space Ambient: deep multi-oscillator drone with slow LFO modulation
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110.00, ctx.currentTime); // A2
        
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(146.83, ctx.currentTime); // D3

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.05, ctx.currentTime); // 20s sweep

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(70, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        lfo.connect(lfoGain).connect(filter.frequency);

        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panner3 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        if (panner1 && panner3) {
          panner1.pan.setValueAtTime(-0.5, ctx.currentTime);
          panner3.pan.setValueAtTime(0.5, ctx.currentTime);
          
          osc1.connect(panner1).connect(filter);
          osc3.connect(panner3).connect(filter);
          osc2.connect(filter);
          
          activeNodesRef.current.push(panner1, panner3);
        } else {
          osc1.connect(filter);
          osc2.connect(filter);
          osc3.connect(filter);
        }

        filter.connect(gainNodeRef.current);

        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();

        activeOscillatorsRef.current.push(osc1, osc2, osc3, lfo);
        activeNodesRef.current.push(osc1, osc2, osc3, lfo, lfoGain, filter);
      }

      setIsSynthPlaying(true);
    } catch (e) {
      console.warn("Failed to generate real-time ambient noise: ", e);
    }
  };

  const stopSynth = () => {
    try {
      activeOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      activeOscillatorsRef.current = [];

      activeNodesRef.current.forEach((node) => {
        try {
          node.disconnect();
        } catch (e) {}
      });
      activeNodesRef.current = [];
      gainNodeRef.current = null;
      setIsSynthPlaying(false);
    } catch (e) {
      console.warn(e);
    }
  };

  // Keep volume responsive to edits
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(synthVolume * 0.15, audioCtxRef.current.currentTime);
    }
  }, [synthVolume]);

  // Adjust synthesis when type changes
  useEffect(() => {
    if (isSynthPlaying) {
      stopSynth();
      setTimeout(() => startSynth(), 50);
    }
  }, [synthType]);

  // Disconnect Audio context on unmount
  useEffect(() => {
    return () => {
      try {
        stopSynth();
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
      } catch (e) {
        // safe ignore
      }
    };
  }, []);

  const changeTimerDuration = (mins: number) => {
    setIsTimerRunning(false);
    setTimerMinutes(mins);
    setTimerSeconds(0);
  };

  return (
    <div id="calm-focus-zone-overlay" className="fixed inset-0 bg-[#050508] text-slate-200 z-50 overflow-y-auto flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#0a0a0f] selection:text-white">
      
      {/* Top Navbar */}
      <div className="flex items-center justify-between w-full border-b border-white/[0.04] pb-5 max-w-7xl mx-auto">
        <button 
          id="exit-focus-zone-btn"
          onClick={() => {
            stopSynth();
            onClose();
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#08080c] hover:bg-[#0a0a0f] rounded-lg border border-white/[0.04] transition-all cursor-pointer shadow-lg"
        >
          <ChevronLeft size={14} />
          Exit Focus Zone
        </button>
        <span className="text-xs font-mono tracking-widest text-cyan-400 flex items-center gap-2 font-bold select-none text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
          ACTIVE COGNITIVE ISOLATION
        </span>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-[#08080c] px-3 py-1.5 rounded-full border border-white/[0.04] text-xs font-mono font-semibold">
            <Flame size={12} className="text-amber-500 animate-pulse" />
            <span className="text-slate-300">COMPLETED BLOCKS: {completedPomodoros}</span>
          </div>
        </div>
      </div>

      {/* Main Centered Focus Workspace Wrapper */}
      <div className="flex-1 w-full flex items-center justify-center min-h-[calc(100vh-160px)]">
        {/* Main Container Grid */}
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-8 items-center">
        
        {/* Left Side: Breathing Guidance */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0f]/60 border border-white/[0.04] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-6 font-semibold">
            Chronos Box Breathing Engine
          </span>
          
          {/* Animated Glowing Breathing Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing Backlit rings with cyan glow */}
            <motion.div 
              animate={{ 
                scale: 
                  breathingPhase === 'Inhale' ? 1.4 :
                  breathingPhase === 'Hold In' ? 1.4 :
                  breathingPhase === 'Exhale' ? 0.9 : 0.9,
                opacity: breathingPhase === 'Inhale' || breathingPhase === 'Hold In' ? 0.25 : 0.1
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute -inset-4 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" 
            />

            <motion.div 
              animate={{ 
                scale: 
                  breathingPhase === 'Inhale' ? [0.95, 1.35] :
                  breathingPhase === 'Hold In' ? 1.35 :
                  breathingPhase === 'Exhale' ? [1.35, 0.95] : 0.95,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-48 h-48 rounded-full border-2 border-white/[0.04] flex flex-col items-center justify-center bg-[#08080c] relative z-10 shadow-inner"
            >
              <span className="text-cyan-400 text-[10px] font-mono tracking-widest uppercase font-bold">
                {breathingPhase}
              </span>
              <span className="text-3xl font-light font-sans text-slate-150 mt-2 font-data">
                {breathingSecs}s
              </span>
            </motion.div>
          </div>

          <div className="mt-8 max-w-xs z-10">
            <h4 id="breathing-guide-phase-label" className="text-sm font-semibold text-slate-300">
              {breathingPhase === 'Inhale' && "Expand lung capacity smoothly"}
              {breathingPhase === 'Hold In' && "Let blood oxygen levels stabilize"}
              {breathingPhase === 'Exhale' && "Release mental fatigue slowly"}
              {breathingPhase === 'Hold Out' && "Enjoy absolute silence of vacancy"}
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Box Breathing is utilized by Navy SEALs to instantly suppress physical anxiety and restore cognitive sanity.
            </p>
          </div>
        </div>

        {/* Center Side: Pomodoro / Focused Task Workspace */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-6 p-6 md:p-8 bg-[#0a0a0f] border border-white/[0.04] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Active Focus Target
            </label>
            <input 
              id="focus-target-input"
              type="text"
              placeholder="What are you studying right now?"
              value={focusTask}
              onChange={(e) => setFocusTask(e.target.value)}
              className="w-full bg-[#08080c] border border-white/[0.04] hover:border-white/[0.08] focus:border-cyan-400/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-650 outline-none transition-all"
            />
          </div>

          <div className="text-center py-6">
            <span className="text-5xl md:text-6xl font-light font-mono text-white tracking-tight hover:text-cyan-400 transition-colors font-data">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </span>
            
            {/* Quick Timer adjustments */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button 
                onClick={() => changeTimerDuration(25)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5 transition-all"
              >
                25m
              </button>
              <button 
                onClick={() => changeTimerDuration(45)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5 transition-all"
              >
                45m
              </button>
              <button 
                onClick={() => changeTimerDuration(90)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-cyan-400 hover:text-white hover:bg-white/5 transition-all font-bold"
              >
                90m (Default)
              </button>
              <button 
                onClick={() => changeTimerDuration(120)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5 transition-all"
              >
                2h
              </button>
              <button 
                onClick={() => changeTimerDuration(180)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5 transition-all"
              >
                3h
              </button>
              <div className="flex items-center gap-1 bg-[#08080c] border border-white/[0.04] rounded-lg px-2 py-0.5">
                <input 
                  type="number"
                  min="1"
                  max="720"
                  placeholder="Custom Min"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0) changeTimerDuration(val);
                  }}
                  className="w-14 bg-transparent text-[10px] text-slate-200 placeholder:text-slate-650 outline-none"
                />
                <span className="text-[8px] font-mono text-slate-500 uppercase">Min</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              id="focus-timer-toggle-btn"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                isTimerRunning 
                ? 'bg-slate-200 hover:bg-white text-black shadow-xl shadow-white/5' 
                : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              }`}
            >
              {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              {isTimerRunning ? 'Pause Engine' : 'Ignite Focus'}
            </button>

            <button 
              id="focus-timer-reset-btn"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerMinutes(90);
                setTimerSeconds(0);
              }}
              className="p-3 bg-[#08080c] hover:bg-white/5 text-slate-400 hover:text-white border border-white/[0.04] rounded-xl transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Soundboard Synth & Rule 4 Mini-Stare Game */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Audio Synthesizer Controls */}
          <div className="p-5 bg-[#0a0a0f] border border-white/[0.04] rounded-2xl flex flex-col gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold">AMBIENT SYNTHESIZER</span>
              <button
                id="toggle-ambient-synth-btn"
                onClick={() => {
                  if (isSynthPlaying) {
                    stopSynth();
                  } else {
                    startSynth();
                  }
                }}
                className={`p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  isSynthPlaying 
                  ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-800/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                  : 'bg-[#08080c] hover:bg-white/5 text-slate-450 border border-white/[0.04]'
                }`}
              >
                {isSynthPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span className="text-[10px] font-bold">{isSynthPlaying ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex gap-1 bg-[#08080c] p-1 rounded-lg border border-white/[0.04]">
              <button
                onClick={() => setSynthType('theta')}
                className={`flex-1 text-[9px] font-mono py-1 rounded transition-all truncate ${synthType === 'theta' ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04] shadow-inner' : 'text-slate-500 hover:text-cyan-400'}`}
                title="Binaural Beats (Theta Waves)"
              >
                THETA BEATS
              </button>
              <button
                onClick={() => setSynthType('brown')}
                className={`flex-1 text-[9px] font-mono py-1 rounded transition-all truncate ${synthType === 'brown' ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04] shadow-inner' : 'text-slate-500 hover:text-cyan-400'}`}
                title="Deep Brown Noise"
              >
                BROWN NOISE
              </button>
              <button
                onClick={() => setSynthType('space')}
                className={`flex-1 text-[9px] font-mono py-1 rounded transition-all truncate ${synthType === 'space' ? 'bg-[#0a0a0f] text-cyan-400 font-bold border border-white/[0.04] shadow-inner' : 'text-slate-500 hover:text-cyan-400'}`}
                title="Space Ambient"
              >
                SPACE AMBIENT
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#08080c]/40 p-2.5 rounded-lg border border-white/[0.04]">
              <span className="text-[10px] font-mono text-slate-500">VOLUME</span>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={synthVolume}
                onChange={(e) => setSynthVolume(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400 bg-[#08080c] rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Stare at a Single Spot Tool (Rule #4 Trigger) */}
          <div className="p-5 bg-[#0a0a0f] border border-white/[0.04] rounded-2xl flex flex-col gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] font-mono tracking-wider text-cyan-400 flex items-center gap-1 font-bold">
              <Eye size={12} className="text-cyan-400" />
              RULE #4 FOCUS GAUNTLET
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Ready to study? Start by staring at the spot below for exactly 2 minutes without shifting eyes.
            </p>

            <div className="flex flex-col items-center gap-3 my-1">
              <div className="w-12 h-12 rounded-full bg-[#050508]/30 border border-white/[0.04] flex items-center justify-center relative shadow-inner">
                {stareActive ? (
                  <>
                    <span className="absolute animate-ping w-4 h-4 bg-cyan-400/15 rounded-full"></span>
                    <span className="w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
                  </>
                ) : (
                  <span className="w-2 h-2 bg-slate-700 rounded-full"></span>
                )}
              </div>
              <span className="text-xl font-mono text-slate-300 font-data">
                {Math.floor(stareSecs / 60)}:{(stareSecs % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={() => {
                if (stareActive) {
                  setStareActive(false);
                  setStareSecs(120);
                } else {
                  setStareActive(true);
                }
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                stareActive 
                ? 'bg-[#08080c] border-white/[0.08] text-slate-300 hover:bg-white/5' 
                : 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              }`}
            >
              {stareActive ? 'Abort Stare' : 'Start Focus Reset'}
            </button>
          </div>

        </div>

      </div>
      </div>

      {/* Footer Quote */}
      <div className="w-full text-center border-t border-white/[0.04] pt-5 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          "THE PAIN OF DISCIPLINE IS NOTHING COMPARED TO THE PAIN OF REGRET."
        </p>
        <span className="text-[10px] text-slate-500 font-mono">
          Press 'ESC' or click button to quit
        </span>
      </div>

    </div>
  );
}
