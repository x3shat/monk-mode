/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Terminal, Copy, Check, FileCode, CheckCircle, ArrowDown, ArrowUp, RefreshCw, Layers } from 'lucide-react';
import { AppState } from '../types';

interface CloudSyncBlueprintProps {
  appState: AppState;
  onImportState: (imported: AppState) => void;
}

export default function CloudSyncBlueprint({ appState, onImportState }: CloudSyncBlueprintProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
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
      downloadAnchor.setAttribute("download", `100_days_monk_mode_backup_${new Date().toISOString().split('T')[0]}.json`);
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
        if (parsed && Array.isArray(parsed.days) && typeof parsed.momentum === 'number') {
          onImportState(parsed);
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 4000);
        } else {
          setImportError("Invalid file schema. Backup JSON must contain 'days' matrix and 'momentum'.");
        }
      } catch (err) {
        setImportError("Failed to parse file. Ensure it is a valid JSON configuration.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="offline-system-architecture-card" className="bg-[#0a0a0f] rounded-2xl border border-white/[0.04] p-6 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.2)]" />
            Tauri Architecture & Cloud Sync Dashboard
          </h2>
          <p className="text-[10px] text-cyan-400 font-mono mt-1 font-bold tracking-wider uppercase">
            COGNITIVE BLUEPRINT FOR DESKTOP COMPILATION & BACKUPS
          </p>
        </div>
      </div>

      {/* Backup and restore interactive playground */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050508] p-5 rounded-2xl border border-white/[0.04] shadow-inner">
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            INTERACTIVE BACKUP REPLICATOR (PREVENTS DATA LOSS)
          </span>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Since this is built live on the browser, you can make a robust backup file right now. You can download the JSON backup payload and restore your 100 days state anytime, guarding against server refreshes.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="export-config-json-btn"
              onClick={handleExportData}
              className="h-10 px-4 py-2 bg-cyan-400 text-black hover:bg-cyan-300 text-xs font-bold font-mono rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)]"
            >
              <ArrowDown size={14} />
              Export Local Backup.json
            </button>

            <button
              id="import-config-json-btn"
              onClick={handleImportClick}
              className="h-10 px-4 py-2 bg-[#0a0a0f] hover:bg-[#0e0e14] text-slate-305 text-xs font-bold font-mono rounded-xl flex items-center gap-2 cursor-pointer border border-white/[0.04] hover:border-white/[0.08] transition-all"
            >
              <ArrowUp size={14} />
              Import & Restore .json File
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
            <div className="pt-2 text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle size={12} />
              Backup state synchronized successfully into active memory!
            </div>
          )}

          {importError && (
            <div className="pt-2 text-xs font-mono font-bold text-red-400 animate-fade-in">
              ⚠ Error sync: {importError}
            </div>
          )}
        </div>

        {/* Directory structure outline box */}
        <div className="space-y-1 bg-[#08080c] p-4 border border-white/[0.04] rounded-xl shadow-inner">
          <span className="text-[9px] font-mono uppercase bg-[#050508] px-2.5 py-1 rounded-lg border border-cyan-400/20 text-cyan-400 inline-block font-bold">
            RECOMMENDED TAURI + REACT EXTENDED FOLDER STRUCTURE
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
      </div>

      {/* Code Snippets and Commands */}
      <div className="space-y-4">
        {snippets.map((snippet, sIdx) => {
          const isCopied = copiedIndex === sIdx;
          return (
            <div key={sIdx} className="bg-[#050508] border border-white/[0.04] rounded-2xl overflow-hidden shadow-md">
              <div className="bg-[#0a0a0f]/80 px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-cyan-400 font-mono font-bold flex items-center gap-2">
                  <Terminal size={14} className="text-cyan-400 animate-pulse" />
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
                <pre className="text-xs text-slate-300 font-mono leading-relaxed leading-[1.65]">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
