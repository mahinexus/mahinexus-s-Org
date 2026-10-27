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
  Clock,
  Dna,
  Sparkles,
  FlaskConical,
  Atom
} from 'lucide-react';
import { BioscienceWorkbench } from '../components/science/BioscienceWorkbench.tsx';
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
  const [showScienceWorkbench, setShowScienceWorkbench] = useState(false);
  const [cohortFilter, setCohortFilter] = useState<'all' | 'bioinformatics'>('all');

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
            {/* Bioscience & Cohort Filter Sub-bar */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-indigo-50/30 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCohortFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    cohortFilter === 'all'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  All Cohorts ({stats?.recentStudents.length || 0})
                </button>
                <button
                  onClick={() => setCohortFilter('bioinformatics')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    cohortFilter === 'bioinformatics'
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20'
                      : 'text-emerald-700 bg-emerald-100/60 hover:bg-emerald-200/60'
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span>Bioinformatics Lab</span>
                </button>
              </div>

              <button
                onClick={() => setShowScienceWorkbench(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:shadow"
              >
                <Atom className="w-3.5 h-3.5" />
                <span>Launch Science Workbench</span>
                <span className="text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded text-emerald-100 font-mono">AlphaFold · PubChem</span>
              </button>
            </div>

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
                {(cohortFilter === 'bioinformatics'
                  ? stats?.recentStudents.filter((s) => s.courseCode === 'BSCBIO' || s.courseName?.toLowerCase().includes('bio')) || []
                  : stats?.recentStudents || []
                ).map((student) => {
                  const isBio = student.courseCode === 'BSCBIO';
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isBio ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {student.fullName}
                          {isBio && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                              <Dna className="w-2.5 h-2.5" /> Bio
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{student.courseCode}</span> · Sem {student.semester}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                        {student.attendancePercentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge status={student.academicStatus} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isBio && (
                          <button
                            onClick={() => setShowScienceWorkbench(true)}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] inline-flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
                            title="Open Science Workbench with AlphaFold 3D model & PubChem"
                          >
                            <FlaskConical className="w-3 h-3" />
                            <span>Lab</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px]"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {cohortFilter === 'bioinformatics' &&
                  (stats?.recentStudents.filter((s) => s.courseCode === 'BSCBIO' || s.courseName?.toLowerCase().includes('bio')).length || 0) === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        <Dna className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-slate-700">Bioinformatics Cohort Records</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          Enrolled students Maya Lin-Franklin and Liam Watson are registered in B.Sc. Bioinformatics. Click below to launch the DeepMind Science lab or view the full directory.
                        </p>
                        <button
                          onClick={() => setShowScienceWorkbench(true)}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Launch Bioscience Lab Workbench</span>
                        </button>
                      </td>
                    </tr>
                  )}
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

      {showScienceWorkbench && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-slate-700/50">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    Bioscience & Molecular Computing Workbench
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono">AlphaFold DB · PubChem · PubMed</span>
                  </h3>
                  <p className="text-xs text-slate-400">Department of Computational Biology & Genomics · Real-time Science APIs</p>
                </div>
              </div>
              <button
                onClick={() => setShowScienceWorkbench(false)}
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                Close Lab ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 bg-slate-50">
              <BioscienceWorkbench />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
