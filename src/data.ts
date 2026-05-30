/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DayProgress, GoalNode, RoutineItem, WillpowerRule } from './types';

// Helps in formatting dates starting from Day 1: May 26, 2026
export const getDayDateString = (dayNumber: number, customStartDate?: Date | string): string => {
  const startDate = customStartDate 
    ? (customStartDate instanceof Date ? new Date(customStartDate.getTime()) : new Date(customStartDate))
    : new Date(2026, 4, 26); // May 26, 2026
  startDate.setDate(startDate.getDate() + (dayNumber - 1));
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = daysOfWeek[startDate.getDay()];
  const dateNum = startDate.getDate();
  const monthName = months[startDate.getMonth()];
  const year = startDate.getFullYear();
  
  return `${dayName}, ${monthName} ${dateNum}, ${year}`;
};

export const INITIAL_WILLPOWER_RULES: WillpowerRule[] = [
  {
    id: 1,
    title: "Silent Dining",
    condition: "Meal time",
    intervention: "Eat food at the dining table in TOTAL SILENCE",
    details: "No screens, no books, no conversation, no headphones. Treat eating as active mindfulness. Chewing food slowly helps lower immediate cortisol and build cognitive discipline."
  },
  {
    id: 2,
    title: "The Cryo Trigger",
    condition: "Taking a shower",
    intervention: "Shower cold for the final 60 seconds",
    details: "Instantly floods the system with noradrenaline, resets cognitive fatigue, and trains your brain to remain calm in situations of high physiological distress."
  },
  {
    id: 3,
    title: "Emergency Drop Option",
    condition: "When a toxic urge or severe craving hits",
    intervention: "DROP AND DO 10 PUSHUPS immediately",
    details: "Forces a somatic break on automatic behavioral pathways. The physical stimulus diverts blood and electrical firing away from executive-hijacking craving centers."
  },
  {
    id: 4,
    title: "Focus Tunnel Reset",
    condition: "At the start of any Study Block / Focus Session",
    intervention: "Stare at a single spot on the wall for exactly 2 minutes",
    details: "Calibrates visual attention span and restricts peripheral field of view, triggering neurobiological pathways associated with deep executive focus."
  },
  {
    id: 5,
    title: "Mental Fortitude Overrides",
    condition: "When you want to quit Studying or working mid-session",
    intervention: "Force yourself to study for exactly 10 more minutes",
    details: "Breaks the automatic habit loop of escaping stress. Rewires dopamine response by showing the brain that completing the hard action is survivable and rewarding."
  },
  {
    id: 6,
    title: "Emotional Solvent Reset",
    condition: "Sunday evenings",
    intervention: "Spend 2 hours in complete solitude (Device-Free)",
    details: "Allows the brain and nervous system to process stored academic inputs and emotional stress, resetting emotional baseline for Monday morning."
  }
];

export const INITIAL_DEFAULT_ROUTINE: RoutineItem[] = [
  {
    time: "06:00 AM",
    activity: "Wake Up & Hydrate",
    details: "Drink 2 glasses of pure water. No devices, no screens, no notifications.",
    zone: "reset"
  },
  {
    time: "06:15 AM",
    activity: "Morning Sunlight & Prep",
    details: "Stand on the balcony, view daylight for 5-10 mins. Drink tea, prepares circadian cycle.",
    zone: "reset"
  },
  {
    time: "06:30 AM",
    activity: "Study Block 1 (3.5 hrs)",
    details: "Pre-game: Stare at space on the wall for 2 mins. Study in total silence.",
    zone: "deep-work"
  },
  {
    time: "10:00 AM",
    activity: "Breakfast & Rest",
    details: "Eat at the dining table in total silence. No screens allowed.",
    zone: "reset"
  },
  {
    time: "11:00 AM",
    activity: "Study Block 2 (2.5 hrs)",
    details: "Pre-game: Stare at space on the wall for 1-2 mins.",
    zone: "deep-work"
  },
  {
    time: "01:30 PM",
    activity: "Hygiene & Lunch",
    details: "60-Second Cold Shower finish. Lunch in total silence. Break/Walk outside.",
    zone: "reset"
  },
  {
    time: "02:30 PM",
    activity: "Study Block 3 (2.5 hrs)",
    details: "Final study block of the day. Consolidate tough topics.",
    zone: "deep-work"
  },
  {
    time: "05:00 PM",
    activity: "Yoga Nidra / Deep Rest",
    details: "Lying down, listening to deep relaxation. Deep nervous system reset.",
    zone: "reset"
  },
  {
    time: "05:30 PM",
    activity: "Admin Window",
    details: "Address outstanding tasks, review schedules, check applications.",
    zone: "transition"
  },
  {
    time: "06:30 PM",
    activity: "Physical Training",
    details: "High intensity workout, cardio or muscle training. Active sweat block.",
    zone: "transition"
  },
  {
    time: "08:00 PM",
    activity: "Radical Solitude (2 hrs)",
    details: "Complete solitude. No screens, no books, no music. Process your mental landscape.",
    zone: "reset"
  },
  {
    time: "10:00 PM",
    activity: "SCREEN OFF & Warm Down",
    details: "No digital device contact. Read paper books, write or review notes.",
    zone: "sleep"
  },
  {
    time: "10:30 PM",
    activity: "Nightly Journaling",
    details: "Review current goals, log 3 wins, prepare schedules for next day.",
    zone: "sleep"
  },
  {
    time: "11:00 PM",
    activity: "Lights Out Sleep",
    details: "Deep, pure sleep. Recharging cognitive batteries.",
    zone: "sleep"
  }
];

export const INITIAL_GOAL_MAP: GoalNode[] = [
  {
    id: "cat-2026",
    title: "CAT Exam",
    subtitle: "November 29, 2026 (Sunday)",
    description: "Primary Target IIM A. Competitive exam assessing quantitative capability, verbal proficiency, and logical reasoning.",
    targets: ["99% in CAT"],
    bullets: ["IIM ABC Portfolio", "Primary Target IIM A", "Requires absolute daily verbal & logic reps"],
    status: "active",
    category: "primary"
  },
  {
    id: "data-eng",
    title: "DATA ENGINEERING",
    subtitle: "Keep applying after completion",
    description: "Build robust foundations in python, relational databases, modeling, and distributed engines.",
    targets: ["Completed SQL theory", "Need to practice in stratascratch", "Build PySpark Databricks portfolios"],
    bullets: ["Python MOOCs in Progress", "Practice on stratascratch every week", "Data modeling > pyspark > databricks > projects"],
    status: "active",
    category: "data-engineering"
  },
  {
    id: "pgdba-2027",
    title: "PGDBA Exam",
    subtitle: "March 2027",
    description: "Highly sought after business analytics joint program of ISI, IIT Kharagpur and IIM Calcutta.",
    targets: ["110+ Score in PGDBA"],
    bullets: ["DILR and VARC = DONE in CAT Prep", "JEE LEVEL MATHS Practice Required", "Interview syllabus: Probability, Statistics and Linear Algebra"],
    status: "secondary",
    category: "secondary-option"
  },
  {
    id: "iisc-iit-gate",
    title: "IISc / IIT MTECH CS",
    subtitle: "Exam in FEB 2027",
    description: "Graduate Aptitude Test in Engineering for pure Computer Science/Information Technology.",
    targets: ["700+ Score in GATE CSE"],
    bullets: ["Aptitude: 15 Marks (already done in CAT preparations)", "Practice other technical subjects systematically"],
    status: "secondary",
    category: "secondary-option"
  },
  {
    id: "iisc-mgmt",
    title: "IISc MGMT ML/Quants",
    subtitle: "CAT / GATE Route",
    description: "Masters of Management centering ML/AI and high-end Quantitative Finance analysis.",
    targets: ["Quants / ML Roles at IISc"],
    bullets: ["Requires high GATE or CAT score", "Requires high-proficiency Python, Probability, Statistics & Linear Algebra"],
    status: "secondary",
    category: "secondary-option"
  },
  {
    id: "isi-mtech",
    title: "ISI MTECH CS/QROR",
    subtitle: "GATE Channel / ISI Test",
    description: "Indian Statistical Institute graduate analytics programs with exceptional rigor.",
    targets: ["ISI Admission"],
    bullets: ["GATE CSE Channel or standalone ISI test", "Extremely math heavy, focusing on discrete structures and analysis"],
    status: "secondary",
    category: "secondary-option"
  }
];

// Generate standard initial 100 days
export const generateInitialDays = (customStartDate?: Date | string): DayProgress[] => {
  const days: DayProgress[] = [];
  
  // Custom baseline notes for past days to make the interface feel lived-in
  // The current date is May 30, which stands as Day 5 if Day 1 is May 26.
  const presetNotes: Record<number, { notes: string[], status: 'completed' | 'missed', hrs: number }> = {
    1: { 
      status: 'completed', 
      notes: [
        'Woke up early at 6 AM. Did 2 min wall stare focus training.', 
        'Studied QA & Number systems in Study Block 1 (3.5 hours).', 
        'Silent dining felt quiet but built high mindfulness.',
        'Completed cold shower and was super alert during Study Block 2!'
      ], 
      hrs: 8.5 
    },
    2: { 
      status: 'completed', 
      notes: [
        'Felt massive cravings in morning but did 10 rapid pushups.', 
        'Study block 2 math sets felt challenging. Pushed through using 10 min trigger rule.', 
        'Read physical book prior to sleep. Zero screens after 10 PM.'
      ], 
      hrs: 9.0 
    },
    3: { 
      status: 'completed', 
      notes: [
        'DILR sets solved: finished 4 tricky logical pathing problems.', 
        'Yoga Nidra at 5 PM gave an incredible refreshing feeling after Study Block 3.'
      ], 
      hrs: 8.0 
    },
    4: { 
      status: 'completed', 
      notes: [
        'Solid physical routine. Completed high intensity push workout in the evening.', 
        'Did stratascratch data engineering problems: SQL aggregations got cleared up.'
      ], 
      hrs: 8.5 
    },
    5: { 
      status: 'completed', // Today: May 30
      notes: [
        'Initiated 100 Days Monk Mode console dashboard!', 
        'Currently active in Study Block 2.'
      ], 
      hrs: 4.5 
    }
  };

  for (let i = 1; i <= 100; i++) {
    const dateStr = getDayDateString(i, customStartDate);
    const preset = presetNotes[i];
    
    if (preset) {
      days.push({
        dayNumber: i,
        status: preset.status,
        date: dateStr,
        notes: preset.notes,
        willpowerViolations: [],
        studyHours: preset.hrs
      });
    } else {
      days.push({
        dayNumber: i,
        status: i === 6 ? 'unlocked' : 'locked', // The day after current completed days is unlocked
        date: dateStr,
        notes: [],
        willpowerViolations: [],
        studyHours: 0
      });
    }
  }
  
  return days;
};
