/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { runSystemTests, TestResult } from '../tests/systemTests.ts';
import { api } from '../lib/api.ts';
import {
  CheckCircle2,
  XCircle,
  Play,
  Database,
  ShieldCheck,
  Server,
  Code2,
  Check,
  Loader2,
  Copy,
  Terminal,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getSystemHealth().then(setHealth).catch(console.error);
  }, []);

  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const results = await runSystemTests();
      setTests(results);
    } finally {
      setRunningTests(false);
    }
  };

  const copyEnvSnippet = () => {
    const text = `# Supabase Configuration\nVITE_SUPABASE_URL="https://your-project.supabase.co"\nVITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\nSUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const allPassed = tests.length > 0 && tests.every((t) => t.passed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">System Diagnostics & Portfolio Verification</h2>
          <p className="text-xs text-slate-500 mt-1">
            Environment status, Supabase PostgreSQL configuration, and automated test suite execution.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={runningTests}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 whitespace-nowrap"
        >
          {runningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>{runningTests ? 'Running System Tests...' : 'Execute Automated Test Suite'}</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Server className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Express Backend</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">Node.js + Express</p>
          <p className="text-xs text-emerald-600 font-mono mt-0.5">Port 3000 Active</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Engine</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">PostgreSQL & In-Memory</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Relational SQL Schemas Ready</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security & RBAC</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">Row Level Security</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Admin · Teacher · Student</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frontend Engine</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">React 19 + Vite 8</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Tailwind CSS + Recharts</p>
        </div>
      </div>

      {/* Automated Tests Runner Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Test Suite (BSc IT Portfolio Verification)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Validates CRUD operations, duplicate roll prevention, RBAC authorization, and attendance integrity.
            </p>
          </div>

          {tests.length > 0 && (
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border ${
                allPassed
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {tests.filter((t) => t.passed).length} / {tests.length} Tests Passed
            </span>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Test suite not executed yet.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Execute Automated Test Suite&quot; above to run real assertions against the backend API and database.
            </p>
            <button
              onClick={handleRunTests}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Automated Tests Now</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tests.map((test) => (
              <div key={test.id} className="p-4 hover:bg-slate-50/50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{test.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({test.durationMs}ms)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{test.description}</p>
                    {test.message && (
                      <p
                        className={`text-[11px] font-mono mt-1 ${
                          test.passed ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {test.message}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                    test.passed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supabase Connection Setup Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Supabase PostgreSQL Database Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SQL migrations and Row Level Security policies located in <code className="font-mono text-slate-700">/supabase/migrations/</code>.
            </p>
          </div>
          <button
            onClick={copyEnvSnippet}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied .env' : 'Copy .env Variables'}</span>
          </button>
        </div>

        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto">
          <code>
            # Supabase Credentials (.env)<br />
            VITE_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;<br />
            VITE_SUPABASE_ANON_KEY=&quot;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&quot;<br />
            SUPABASE_SERVICE_ROLE_KEY=&quot;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&quot;
          </code>
        </div>
      </div>
    </div>
  );
};
