import React from 'react';
import { GraduationCap, Plus, FileCode2, Activity } from 'lucide-react';

interface HeaderProps {
  onAddNew: () => void;
  onOpenDocs: () => void;
  serverOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAddNew, onOpenDocs, serverOnline }) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Student Management System
              </h1>
              <span
                id="server-status-pill"
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  serverOnline
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                }`}
                title={serverOnline ? 'Cloud Functions REST API is operational' : 'Connecting to API...'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                <span>{serverOnline ? 'API Connected' : 'Connecting'}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              React Frontend &bull; Firebase Cloud Functions REST API &bull; Firestore Database
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="open-api-docs-modal-btn"
            type="button"
            onClick={onOpenDocs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-indigo-500" />
            <span>API Docs &amp; Postman</span>
          </button>

          <button
            id="open-add-student-modal-btn"
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>
    </header>
  );
};
