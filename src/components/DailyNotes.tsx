/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface DailyNotesProps {
  theme?: 'dark' | 'light';
}

export default function DailyNotes({ theme = 'dark' }: DailyNotesProps) {
  const [notes, setNotes] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('monk_mode_global_notes');
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load notes from localStorage:', e);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('monk_mode_global_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save notes to localStorage:', e);
    }
  }, [notes]);

  const handleAddNote = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      setNotes([...notes, trimmedInput]);
      setInputValue('');
    }
  };

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-[#f5f5f7]' : 'bg-[#0c0c0f]';
  const borderColor = isLight ? 'border-[#e0e0e0]' : 'border-[#111118]';
  const textColor = isLight ? 'text-[#1c1c1e]' : 'text-white';
  const secondaryText = isLight ? 'text-[#666668]' : 'text-zinc-500';
  const inputBgColor = isLight ? 'bg-white' : 'bg-[#050508]';
  const inputBorderColor = isLight ? 'border-[#e0e0e0]' : 'border-[#222227]';
  const hoverBgColor = isLight ? 'hover:bg-[#f0f0f2]' : 'hover:bg-[#111118]';

  return (
    <div className={`space-y-6 py-6`}>
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className={`text-lg font-bold ${textColor}`}>Notes & Journal</h2>
        <p className={`text-xs font-mono ${secondaryText}`}>
          Add daily reflections, thoughts, and progress notes. All notes are saved automatically to your device.
        </p>
      </div>

      {/* Input Section */}
      <div className={`${bgColor} border ${borderColor} p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]`}>
        <label className={`block text-xs font-mono font-semibold uppercase tracking-wide ${secondaryText} mb-3`}>
          Add a New Note
        </label>
        <div className="flex flex-col gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your note here... (Press Enter to add, Shift+Enter for new line)"
            className={`w-full px-4 py-3 ${inputBgColor} border ${inputBorderColor} rounded-lg ${textColor} placeholder-zinc-600 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all`}
            rows={3}
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-400/40"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes Display Section */}
      <div className={`${bgColor} border ${borderColor} p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]`}>
        <label className={`block text-xs font-mono font-semibold uppercase tracking-wide ${secondaryText} mb-4`}>
          Saved Notes ({notes.length})
        </label>

        {notes.length === 0 ? (
          <div className={`text-center py-8 ${secondaryText}`}>
            <p className="text-sm font-mono">No notes yet. Start by adding your first note above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notes.map((note, index) => (
              <li
                key={index}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${borderColor} ${hoverBgColor} transition-colors group`}
              >
                <div className="flex-1 flex items-start gap-3 min-w-0">
                  <span className={`text-xs font-bold ${secondaryText} mt-0.5 flex-shrink-0`}>
                    {index + 1}.
                  </span>
                  <span className={`text-sm font-sans leading-relaxed break-words ${textColor} flex-1`}>
                    {note}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className={`flex-shrink-0 p-2 rounded-lg ${hoverBgColor} transition-all text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity`}
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
