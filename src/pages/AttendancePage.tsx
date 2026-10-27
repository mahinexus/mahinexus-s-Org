/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AttendanceSession, Course, Subject } from '../types/index.ts';
import { TakeAttendanceModal } from '../components/TakeAttendanceModal.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { api } from '../lib/api.ts';
import {
  CalendarCheck,
  Plus,
  Filter,
  Users,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { role } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, sList] = await Promise.all([
        api.getCourses(),
        api.getAttendanceSessions({
          courseId: selectedCourseFilter || undefined,
          date: dateFilter || undefined,
        }),
      ]);
      setCourses(cList);
      setSessions(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseFilter, dateFilter]);

  const canRecord = role === 'admin' || role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Attendance Session Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct lecture sessions, record attendance states (Present, Absent, Late), and calculate percentages.
          </p>
        </div>

        {canRecord && (
          <button
            onClick={() => setIsTakeAttendanceOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Session</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="">All Academic Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* Attendance Sessions Grid */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Recorded Attendance Sessions ({sessions.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Strict Duplicate Prevention Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold">Subject & Code</th>
                <th className="py-3 px-4 font-semibold">Program</th>
                <th className="py-3 px-4 font-semibold">Session Type</th>
                <th className="py-3 px-4 font-semibold">Topic Covered</th>
                <th className="py-3 px-4 font-semibold text-right">Attendance Tally</th>
                <th className="py-3 px-4 font-semibold text-center">Calculated Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading session attendance records...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">No attendance sessions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click &quot;Record New Session&quot; to log class attendance.</p>
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => {
                  const total = sess.totalStudentsCount || 5;
                  const present = sess.totalStudentsPresent !== undefined ? sess.totalStudentsPresent : 5;
                  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-900">{sess.sessionDate}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {sess.startTime || '10:00'} - {sess.endTime || '11:00'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{sess.subjectName}</div>
                        <div className="text-[11px] text-slate-500 font-mono font-normal">
                          {sess.subjectCode} · By {sess.teacherName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {sess.courseCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {sess.sessionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {sess.topicCovered || 'Regular Syllabus Lecture'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                        <span className="text-emerald-700 font-semibold">{present} Present</span> / {total}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            rate >= 75
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TakeAttendanceModal
        isOpen={isTakeAttendanceOpen}
        onClose={() => setIsTakeAttendanceOpen(false)}
        courses={courses}
        onAttendanceSaved={() => loadData()}
      />
    </div>
  );
};
