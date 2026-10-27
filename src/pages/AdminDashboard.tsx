/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { DashboardStats, Student, Course } from '../types/index.ts';
import { StatsCard } from '../components/common/StatsCard.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { StudentFormModal } from '../components/StudentFormModal.tsx';
import { StudentDetailsModal } from '../components/StudentDetailsModal.tsx';
import { TakeAttendanceModal } from '../components/TakeAttendanceModal.tsx';
import { api } from '../lib/api.ts';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStats, courseList] = await Promise.all([
        api.getDashboardStats(),
        api.getCourses(),
      ]);
      setStats(dashStats);
      setCourses(courseList);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExportCsv = () => {
    window.location.href = api.getExportCsvUrl();
  };

  if (loading && !stats) {
    return (
      <div className="py-24 text-center">
        <p className="text-xs font-medium text-slate-500">Loading university administrative data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Dean & Administrative Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time enrollment records, calculated attendance metrics, and faculty curriculum oversight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Record Attendance</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled in all programs"
          icon={<Users className="w-4 h-4 text-indigo-600" />}
        />
        <StatsCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          subtitle="In regular academic standing"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          trend={{ value: `${Math.round(((stats?.activeStudents || 0) / (stats?.totalStudents || 1)) * 100)}%`, isPositive: true }}
        />
        <StatsCard
          title="Faculty Members"
          value={stats?.totalTeachers || 0}
          subtitle="Active professors & deans"
          icon={<GraduationCap className="w-4 h-4 text-blue-600" />}
        />
        <StatsCard
          title="Academic Courses"
          value={stats?.totalCourses || 0}
          subtitle="Degree programs"
          icon={<BookOpen className="w-4 h-4 text-violet-600" />}
        />
        <StatsCard
          title="Avg. Attendance"
          value={`${stats?.averageAttendance || 0}%`}
          subtitle="Across all logged sessions"
          icon={<Award className="w-4 h-4 text-amber-600" />}
          trend={{ value: '+4.2% vs last term', isPositive: true }}
        />
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Enrollment Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Degree Program</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across college departments</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Live DB Data</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.studentsByCourse || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="courseName" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Students" barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trends */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Attendance Rate Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Session attendance across recorded lectures</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold">91% Average</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="presentRate" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#attRateGrad)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Students & Administrative Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Students (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recently Enrolled Students</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest registrations with calculated attendance rate</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Student Name</th>
                  <th className="py-2.5 px-4 font-semibold">Roll Number</th>
                  <th className="py-2.5 px-4 font-semibold">Course & Sem</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Attendance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{student.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.courseCode} · Sem {student.semester}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {student.attendancePercentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={student.academicStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudentId(student.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px]"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Administrative Activity Log (1 Col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Administrative Audit Trail</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Live Logs</span>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
            {stats?.recentActivities.map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">{log.action}</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{log.details}</p>
                <p className="text-[10px] text-slate-400">
                  By {log.actorName} ({log.actorRole})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        courses={courses}
        onSubmit={(data) => api.createStudent(data)}
        onSuccess={() => fetchDashboardData()}
      />

      <TakeAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        courses={courses}
        onAttendanceSaved={() => fetchDashboardData()}
      />

      <StudentDetailsModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        canEdit={true}
      />
    </div>
  );
};
