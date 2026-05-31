/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Flame, Compass, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusZoneProps {
  selectedDayNumber: number;
  onLogHours: (dayNum: number, additionalHours: number) => void;
  onClose: () => void;
}



export default function FocusZone({ selectedDayNumber, onLogHours, onClose }: FocusZoneProps) {
  // Pomodoro timer state
  const [selectedDuration, setSelectedDuration] = useState<number>(90);
  const [timerMinutes, setTimerMinutes] = useState(90);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) {
      setTimerMinutes(selectedDuration);
      setTimerSeconds(0);
    }
  }, [selectedDuration, isTimerRunning]);
  const [focusTask, setFocusTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Logging hours state
  const [showLogButton, setShowLogButton] = useState(false);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [isLogged, setIsLogged] = useState(false);

  // --- BULLETPROOF BREATHING ENGINE ---
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingMode, setBreathingMode] = useState<'box' | '478'>('478');
  const [breathTick, setBreathTick] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTick((prev) => prev + 1);
      }, 1000);
    } else {
      setBreathTick(0);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Derived Math Engine (Impossible to desync)
  let currentPhaseText = "";
  let breathSecsRemaining = 0;
  let phaseScale = 1;
  let phaseOpacity = 0.1;

  if (breathingMode === 'box') {
    const cycleTick = breathTick % 16;
    if (cycleTick < 4) {
      currentPhaseText = "INHALE"; breathSecsRemaining = 4 - cycleTick; phaseScale = 1.2; phaseOpacity = 0.2;
    } else if (cycleTick < 8) {
      currentPhaseText = "HOLD (FULL)"; breathSecsRemaining = 4 - (cycleTick - 4); phaseScale = 1.3; phaseOpacity = 0.3;
    } else if (cycleTick < 12) {
      currentPhaseText = "EXHALE"; breathSecsRemaining = 4 - (cycleTick - 8); phaseScale = 0.8; phaseOpacity = 0.1;
    } else {
      currentPhaseText = "HOLD (EMPTY)"; breathSecsRemaining = 4 - (cycleTick - 12); phaseScale = 0.8; phaseOpacity = 0.05;
    }
  } else {
    const cycleTick = breathTick % 19;
    if (cycleTick < 4) {
      currentPhaseText = "INHALE"; breathSecsRemaining = 4 - cycleTick; phaseScale = 1.2; phaseOpacity = 0.2;
    } else if (cycleTick < 11) {
      currentPhaseText = "HOLD (FULL)"; breathSecsRemaining = 7 - (cycleTick - 4); phaseScale = 1.4; phaseOpacity = 0.3;
    } else {
      currentPhaseText = "EXHALE"; breathSecsRemaining = 8 - (cycleTick - 11); phaseScale = 0.8; phaseOpacity = 0.1;
    }
  }

  // 2-Minute Wall Stare state (Rule #4 Focus Trigger)
  const [stareActive, setStareActive] = useState(false);
  const [stareSecs, setStareSecs] = useState(120);

  // Audio Synthesizer State
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [synthVolume, setSynthVolume] = useState(0.4);
  const [synthType, setSynthType] = useState<'theta' | 'brown' | 'space'>('theta');

  // Refs for audio context and timer synchronization (prevents drift)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);
  const activeNodesRef = useRef<AudioNode[]>([]);


  const pomodoroStartRef = useRef<number | null>(null);
  const pomodoroInitialRemainingRef = useRef<number>(90 * 60);

  const stareStartRef = useRef<number | null>(null);
  const stareInitialRemainingRef = useRef<number>(120);

  // Pomodoro clock timer logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      pomodoroStartRef.current = Date.now();
      const initialSecs = timerMinutes * 60 + timerSeconds;
      pomodoroInitialRemainingRef.current = initialSecs;
      setSessionDurationSeconds(initialSecs);
      setIsLogged(false);
      setShowLogButton(false);

      interval = setInterval(() => {
        if (pomodoroStartRef.current === null) return;
        
        const elapsed = Math.floor((Date.now() - pomodoroStartRef.current) / 1000);
        const remaining = Math.max(0, pomodoroInitialRemainingRef.current - elapsed);
        
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        
        setTimerMinutes(mins);
        setTimerSeconds(secs);
        
        if (remaining <= 0) {
          setIsTimerRunning(false);
          setCompletedPomodoros((prev) => prev + 1);
          setTimerMinutes(selectedDuration);
          setTimerSeconds(0);
          pomodoroStartRef.current = null;
          setShowLogButton(true);
          clearInterval(interval);
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
            
            // Close AudioContext when oscillator finishes to prevent memory leak
            osc.onended = () => {
              try {
                beepCtx.close();
              } catch (err) {}
            };
            
            osc.start();
            osc.stop(beepCtx.currentTime + 1);
          } catch (e) {
            console.warn(e);
          }
        }
      }, 200);
    } else {
      pomodoroStartRef.current = null;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleLogHours = () => {
    if (isLogged || sessionDurationSeconds <= 0) return;
    const hours = sessionDurationSeconds / 3600;
    onLogHours(selectedDayNumber, hours);
    setIsLogged(true);
  };

  // Wall stare timer logic
  useEffect(() => {
    let interval: any = null;
    if (stareActive) {
      stareStartRef.current = Date.now();
      stareInitialRemainingRef.current = stareSecs;

      interval = setInterval(() => {
        if (stareStartRef.current === null) return;

        const elapsed = Math.floor((Date.now() - stareStartRef.current) / 1000);
        const remaining = Math.max(0, stareInitialRemainingRef.current - elapsed);

        setStareSecs(remaining);

        if (remaining <= 0) {
          setStareActive(false);
          setStareSecs(120);
          stareStartRef.current = null;
          clearInterval(interval);
          try {
            const beepCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = beepCtx.createOscillator();
            const gain = beepCtx.createGain();
            osc.connect(gain);
            gain.connect(beepCtx.destination);
            osc.frequency.setValueAtTime(440, beepCtx.currentTime);
            gain.gain.setValueAtTime(0.2, beepCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, beepCtx.currentTime + 0.8);
            
            // Close AudioContext when oscillator finishes to prevent memory leak
            osc.onended = () => {
              try {
                beepCtx.close();
              } catch (err) {}
            };

            osc.start();
            osc.stop(beepCtx.currentTime + 0.8);
          } catch (e) {
            console.warn(e);
          }
        }
      }, 200);
    } else {
      stareStartRef.current = null;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stareActive]);



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
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-8 items-center">
        
        {/* Left Side: Pomodoro / Focused Task Workspace */}
        <div className="lg:col-span-1 flex flex-col justify-center gap-6 p-6 md:p-8 bg-[#0a0a0f] border border-white/[0.04] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
            <div className="text-[10px] font-mono text-slate-505 uppercase tracking-wider mb-2 select-none font-bold">
              Working on Day {selectedDayNumber}
            </div>
            <span className="text-5xl md:text-6xl font-light font-mono text-white tracking-tight hover:text-cyan-400 transition-colors font-data">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </span>
            
            {/* Quick Timer adjustments */}
            {!isTimerRunning && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button 
                  onClick={() => changeTimerDuration(25)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border transition-all cursor-pointer ${
                    selectedDuration === 25 
                      ? 'text-cyan-400 border-cyan-400/35 bg-[#0a0a0f]' 
                      : 'border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5'
                  }`}
                >
                  25m
                </button>
                <button 
                  onClick={() => changeTimerDuration(50)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border transition-all cursor-pointer ${
                    selectedDuration === 50 
                      ? 'text-cyan-400 border-cyan-400/35 bg-[#0a0a0f]' 
                      : 'border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5'
                  }`}
                >
                  50m
                </button>
                <button 
                  onClick={() => changeTimerDuration(90)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border transition-all cursor-pointer font-bold ${
                    selectedDuration === 90 
                      ? 'text-cyan-400 border-cyan-400/35 bg-[#0a0a0f]' 
                      : 'border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5'
                  }`}
                >
                  90m
                </button>
                <button 
                  onClick={() => changeTimerDuration(120)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg bg-[#08080c] border transition-all cursor-pointer ${
                    selectedDuration === 120 
                      ? 'text-cyan-400 border-cyan-400/35 bg-[#0a0a0f]' 
                      : 'border-white/[0.04] text-slate-450 hover:text-white hover:bg-white/5'
                  }`}
                >
                  120m
                </button>
              </div>
            )}
          </div>

          {showLogButton && (
            <button
              id="log-session-hours-btn"
              onClick={handleLogHours}
              className={`w-full py-3.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
                isLogged
                  ? 'bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-green-400'
                  : 'bg-[#08080c] hover:bg-white/5 text-cyan-400 hover:text-cyan-300 border-cyan-400/40 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.1)]'
              }`}
            >
              {isLogged 
                ? `Logged to Day ${selectedDayNumber} (+${(sessionDurationSeconds / 3600).toFixed(2)}h)` 
                : `Log Session to Day ${selectedDayNumber} (+${(sessionDurationSeconds / 3600).toFixed(2)}h)`
              }
            </button>
          )}

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
                setTimerMinutes(selectedDuration);
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
        <div className="lg:col-span-1 flex flex-col gap-6">
          
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

          {/* Tactical Breathing Protocol Widget */}
          <div className="p-5 bg-white dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/[0.04] rounded-2xl flex flex-col gap-4 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-green-700 dark:text-green-400 font-bold flex items-center gap-1.5 uppercase">
                <span className={`w-2 h-2 rounded-full ${isBreathingActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                NEURAL RESET PROTOCOL
              </span>
              
              {!isBreathingActive && (
                <div className="flex bg-slate-100 dark:bg-[#08080c] border border-slate-200 dark:border-white/[0.04] rounded-lg p-0.5">
                  <button
                    onClick={() => setBreathingMode('box')}
                    className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${breathingMode === 'box' ? 'bg-white dark:bg-[#0a0a0f] text-green-700 dark:text-green-400 font-bold shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    BOX
                  </button>
                  <button
                    onClick={() => setBreathingMode('478')}
                    className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${breathingMode === '478' ? 'bg-white dark:bg-[#0a0a0f] text-green-700 dark:text-green-400 font-bold shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    4-7-8
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-[#050508] rounded-xl border border-slate-200 dark:border-white/[0.04] relative overflow-hidden min-h-[140px]">
              {isBreathingActive ? (
                <>
                  {/* Animated Visualizer Circle */}
                  <div 
                    className="absolute inset-0 bg-green-400/20 dark:bg-green-400/10 rounded-full blur-2xl transition-all duration-1000 ease-in-out"
                    style={{
                      transform: `scale(${phaseScale})`,
                      opacity: phaseOpacity
                    }}
                  ></div>
                  
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-mono font-bold tracking-widest uppercase z-10">
                    {currentPhaseText}
                  </span>
                  <span className="text-5xl font-mono text-slate-800 dark:text-white font-light mt-1 z-10 font-data">
                    {breathSecsRemaining}s
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center px-4">
                  {breathingMode === '478' ? "4-7-8: Inhale 4s, Hold 7s, Exhale 8s." : "BOX: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s."} <br/> Ready to engage.
                </span>
              )}
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isBreathingActive 
                ? 'bg-slate-200 dark:bg-[#08080c] border-slate-300 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/5' 
                : 'bg-[#15803d] text-white hover:bg-[#166534] border-[#15803d] shadow-md dark:bg-green-600 dark:hover:bg-green-500'
              }`}
            >
              {isBreathingActive ? 'Stop Protocol' : 'Initiate Neural Reset'}
            </button>
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
