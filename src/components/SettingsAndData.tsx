/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Copy, 
  Check 
} from 'lucide-react';
import { AppState } from '../types';

interface SettingsAndDataProps {
  appState: AppState;
  onImportState: (imported: AppState) => void;
  onResetJourney: () => void;
}

export default function SettingsAndData({ 
  appState, 
  onImportState, 
  onResetJourney 
}: SettingsAndDataProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDevModeOpen, setIsDevModeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const snippets = [
    {
      title: "Initialize Tauri App with React & TS",
      language: "bash",
      code: `# 1. Create a Tauri workspace natively on your Windows computer
npm create tauri-app@latest -- --appName "monk_mode" --template react-ts-vite

# 2. Add local SQLite plugin inside Tauri project setup
cd monk_mode
npm i @tauri-apps/plugin-sql

# 3. Add necessary icon libraries for modern visual layout
npm i lucide-react motion`
    },
    {
      title: "Backend Core (src-tauri/src/main.rs)",
      language: "rust",
      code: `// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn main() {
    // Basic migration definitions for Offline SQLite DB initialization
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_monk_tables",
            sql: "CREATE TABLE IF NOT EXISTS days (
                day_number INTEGER PRIMARY KEY,
                status TEXT,
                date TEXT,
                study_hours REAL,
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT
            );",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:monk_mode.db", migrations).build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`
    },
    {
      title: "Pathway: Automated Google Drive Cloud Sync Script",
      language: "typescript",
      code: `/**
 * Architecture Proposal: Google Drive OAuth2 & Sync Process
 * To achieve true deviceless backup synchronization:
 */
import { Client } from '@tauri-apps/api/http';

interface CloudBackupManager {
  accessToken: string;
  folderId?: string;
}

export class GoogleDriveSyncService {
  private baseUri = "https://www.googleapis.com/drive/v3";

  // 1. Authenticate with Google OAuth2 utilizing secure browser redirection
  async OAuthAuthenticate(): Promise<string> {
    // Direct Tauri client to trigger system default browser to initiate OAuth login flow
    // Callback goes to local listening server (e.g. http://localhost:1420/oauth-callback)
    return "ACCESS_TOKEN_JWT_HERE";
  }

  // 2. Upload SQLite Monk database safely to Google Drive
  async syncDatabaseToCloud(accessToken: string, fileBlob: Blob): Promise<boolean> {
    const response = await fetch(\`\${this.baseUri}/files?uploadType=media\`, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "Content-Type": "application/octet-stream"
      },
      body: fileBlob
    });
    return response.ok;
  }
}`
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `monk_mode_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.days)) {
          onImportState(parsed);
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 4000);
        } else {
          setImportError("Invalid backup file format. Select a valid Monk Mode backup.");
        }
      } catch (err) {
        setImportError("Failed to parse file. Ensure it is a valid backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    const confirm1 = window.confirm(
      "⚠️ WARNING: FACTORY RESET REQUESTED ⚠️\n\n" +
      "You are about to perform a Hard Reset. This will permanently wipe all your progress logs, study hours, custom tasks, milestones, and start date.\n\n" +
      "This action is irreversible. Are you sure you want to proceed?"
    );
    if (confirm1) {
      const confirm2 = window.confirm(
        "🛑 FINAL WARNING: IRREVERSIBLE OPERATION 🛑\n\n" +
        "Are you absolutely certain you want to start over from scratch? All data will be permanently deleted. Click OK to execute factory reset."
      );
      if (confirm2) {
        onResetJourney();
      }
    }
  };

  return (
    <div id="settings-data-card" className="bg-[#0a0a0f] rounded-2xl border border-white/[0.04] p-6 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Settings size={16} className="text-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.2)]" />
            Settings & Data Management
          </h2>
          <p className="text-[10px] text-cyan-400 font-mono mt-1 font-bold tracking-wider uppercase">
            Manage your challenge backups, progress status, and developer settings
          </p>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="space-y-6">
        
        {/* Backup and Restore Section */}
        <div className="bg-[#050508] p-5 rounded-2xl border border-white/[0.04] shadow-inner space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider text-cyan-400">
              Backup & Restore Progress
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Download a backup of your logs to save your progress locally, or upload a previous backup file to restore your 100-day session data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              id="export-config-json-btn"
              onClick={handleExportData}
              className="h-10 px-4 py-2 bg-green-500 text-black hover:bg-green-400 text-xs font-bold font-mono rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(74,222,128,0.15)] border border-green-400/20"
            >
              <ArrowDown size={14} />
              Save Progress (Download Backup)
            </button>

            <button
              id="import-config-json-btn"
              onClick={handleImportClick}
              className="h-10 px-4 py-2 bg-[#0a0a0f] hover:bg-[#0e0e14] text-slate-300 text-xs font-bold font-mono rounded-xl flex items-center gap-2 cursor-pointer border border-white/[0.04] hover:border-white/[0.08] transition-all"
            >
              <ArrowUp size={14} />
              Load Progress (Restore)
            </button>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {importSuccess && (
            <div className="text-xs font-mono font-bold text-green-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle size={12} />
              Progress restored successfully!
            </div>
          )}

          {importError && (
            <div className="text-xs font-mono font-bold text-red-400 animate-fade-in">
              ⚠️ Error: {importError}
            </div>
          )}
        </div>

        {/* Danger Zone / Factory Reset */}
        <div className="bg-[#0a0505]/40 border border-red-900/20 p-5 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Restart your entire Monk Mode journey. This will clear your custom start date and wipe all check-ins, logged study statistics, and history.
            </p>
          </div>

          <button
            onClick={handleFactoryReset}
            className="h-10 px-4 py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 text-xs font-bold font-mono rounded-xl flex items-center gap-2 cursor-pointer border border-red-900/40 hover:border-red-500/50 transition-all shadow-[0_0_12px_rgba(239,68,68,0.05)]"
          >
            Restart Journey (Factory Reset)
          </button>
        </div>

        {/* Collapsible Advanced Developer Mode Accordion */}
        <div className="border border-white/[0.04] rounded-2xl overflow-hidden bg-[#050508]/40">
          <button
            onClick={() => setIsDevModeOpen(!isDevModeOpen)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-350 font-mono uppercase tracking-wider">
                Developer / Advanced Mode
              </span>
            </div>
            {isDevModeOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </button>

          {isDevModeOpen && (
            <div className="px-5 pb-5 pt-1 space-y-6 animate-in slide-in-from-top duration-200">
              
              {/* Directory outline */}
              <div className="space-y-1 bg-[#08080c] p-4 border border-white/[0.04] rounded-xl shadow-inner">
                <span className="text-[9px] font-mono uppercase bg-[#050508] px-2.5 py-1 rounded-lg border border-cyan-400/20 text-cyan-400 inline-block font-bold">
                  Recommended Tauri Desktop App Structure
                </span>
                <pre className="text-[10px] text-slate-500 font-mono leading-relaxed mt-2.5 overflow-x-auto">
{`monk_mode/
├── src-tauri/               # Native Rust Tauri compilation backend
│   ├── src/
│   │   └── main.rs          # Initialises SQLite migrations & local applets
│   └── Cargo.toml           # Rust dependency compiler
├── src/                     # React Frontend components
│   ├── components/          # Reusable focused custom layout blocks
│   │   ├── BiologicalTimeline.tsx
│   │   ├── GoalMap.tsx
│   │   └── FocusZone.tsx
│   ├── types.ts             # Strict type structures
│   ├── data.ts              # Timeline, schedules & preset parameters
│   └── main.tsx             # Canvas mounting entry point
└── package.json             # NPM dependencies & scripts`}
                </pre>
              </div>

              {/* Code Snippets */}
              <div className="space-y-4">
                {snippets.map((snippet, sIdx) => {
                  const isCopied = copiedIndex === sIdx;
                  return (
                    <div key={sIdx} className="bg-[#050508] border border-white/[0.04] rounded-2xl overflow-hidden shadow-md">
                      <div className="bg-[#0a0a0f]/80 px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                        <span className="text-[11px] text-cyan-400 font-mono font-bold flex items-center gap-2">
                          <Terminal size={14} className="text-cyan-400" />
                          {snippet.title}
                        </span>

                        <button
                          onClick={() => handleCopy(snippet.code, sIdx)}
                          className="p-1 px-2.5 rounded-lg bg-[#050508] border border-white/[0.04] hover:border-white/[0.08] hover:text-white text-slate-450 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {isCopied ? (
                            <>
                              <Check size={10} className="text-cyan-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 overflow-x-auto bg-[#030306]">
                        <pre className="text-xs text-slate-350 font-mono leading-relaxed">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
