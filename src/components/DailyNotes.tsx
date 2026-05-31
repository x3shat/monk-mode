/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { DayProgress } from '../types';

interface DailyNotesProps {
  selectedDayNumber: number;
  days: DayProgress[];
  onUpdateDayNotes: (dayNum: number, newNotesArray: string[]) => void;
  theme?: 'dark' | 'light';
}

export default function DailyNotes({ 
  selectedDayNumber, 
  days, 
  onUpdateDayNotes, 
  theme = 'dark' 
}: DailyNotesProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentDay = days.find(d => d.dayNumber === selectedDayNumber);
  const notes = currentDay?.notes || [];

  const handleAddNote = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timestamp = `[${hours}:${minutes}]`;
      const timestampedNote = `${timestamp} ${trimmedInput}`;

      onUpdateDayNotes(selectedDayNumber, [...notes, timestampedNote]);
      setInputValue('');
    }
  };

  const handleDeleteNote = (originalIndex: number) => {
    const updatedNotes = notes.filter((_, i) => i !== originalIndex);
    onUpdateDayNotes(selectedDayNumber, updatedNotes);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Derive filtered notes mapping the original index to retain correct deletion mapping
  const notesWithIndex = notes.map((text, index) => ({ text, index }));
  const filteredNotes = notesWithIndex.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-[#f5f5f7]' : 'bg-[#0c0c0f]';
  const borderColor = isLight ? 'border-[#e0e0e0]' : 'border-[#111118]';
  const textColor = isLight ? 'text-[#1c1c1e]' : 'text-white';
  const secondaryText = isLight ? 'text-[#666668]' : 'text-zinc-500';
  const inputBgColor = isLight ? 'bg-white' : 'bg-[#050508]';
  const inputBorderColor = isLight ? 'border-[#e0e0e0]' : 'border-[#222227]';
  const hoverBgColor = isLight ? 'hover:bg-[#f0f0f2]' : 'hover:bg-[#111118]';

  return (
    <div className="space-y-6 py-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className={`text-lg font-bold ${textColor}`}>Notes & Journal (Day {selectedDayNumber})</h2>
        <p className={`text-xs font-mono ${secondaryText}`}>
          Add reflections, thoughts, and progress notes specifically for Day {selectedDayNumber}. All notes are persisted to your local state.
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={16} className={secondaryText} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search notes for Day ${selectedDayNumber}...`}
          className={`w-full pl-10 pr-4 py-2.5 ${inputBgColor} border ${inputBorderColor} rounded-lg ${textColor} placeholder-zinc-600 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all`}
        />
      </div>

      {/* Input Section */}
      <div className={`${bgColor} border ${borderColor} p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]`}>
        <label className={`block text-xs font-mono font-semibold uppercase tracking-wide ${secondaryText} mb-3`}>
          Add a New Note to Day {selectedDayNumber}
        </label>
        <div className="flex flex-col gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your note here... (Press Enter to add, Shift+Enter for new line)"
            className={`w-full px-4 py-3 ${inputBgColor} border ${inputBorderColor} rounded-lg ${textColor} placeholder-zinc-650 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all`}
            rows={3}
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-400/40 align-self-start"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes Display Section */}
      <div className={`${bgColor} border ${borderColor} p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]`}>
        <div className="flex items-center justify-between mb-4">
          <label className={`block text-xs font-mono font-semibold uppercase tracking-wide ${secondaryText}`}>
            Notes logged for Day {selectedDayNumber} ({notes.length})
          </label>
          {searchQuery && (
            <span className="text-[10px] font-mono text-cyan-400">
              Filtered: {filteredNotes.length} matching
            </span>
          )}
        </div>

        {notes.length === 0 ? (
          <div className={`text-center py-8 ${secondaryText}`}>
            <p className="text-sm font-mono text-zinc-550">No notes logged for Day {selectedDayNumber}</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={`text-center py-8 ${secondaryText}`}>
            <p className="text-sm font-mono text-zinc-550">No notes matching your search query.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredNotes.map((item) => (
              <li
                key={item.index}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${borderColor} ${hoverBgColor} transition-colors group`}
              >
                <div className="flex-1 flex items-start gap-3 min-w-0">
                  <span className={`text-xs font-bold ${secondaryText} mt-0.5 flex-shrink-0`}>
                    {item.index + 1}.
                  </span>
                  <span className={`text-sm font-sans leading-relaxed break-words ${textColor} flex-1`}>
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteNote(item.index)}
                  className={`flex-shrink-0 p-2 rounded-lg ${hoverBgColor} transition-all text-zinc-505 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity`}
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
