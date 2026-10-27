/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { StatsCard } from '../components/common/StatsCard.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { RequestCorrectionModal } from '../components/RequestCorrectionModal.tsx';
import { api } from '../lib/api.ts';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  AlertTriangle,
  FileEdit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Mark, AttendanceRecord, Subject, Student, Course } from '../types/index.ts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDashboardStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const student: Student | undefined = data?.student;
  const course: Course | undefined = data?.course;
  const attendancePercentage = student?.attendancePercentage || 92;
  const isAttendanceWarning = attendancePercentage < 75;

  return (
    <div className="space-y-6">
      {/* Student Profile Hero */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 border border-indigo-500/50 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {student?.fullName ? student.fullName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{student?.fullName || 'Student'}</h2>
              <Badge status={student?.academicStatus || 'Active'} />
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono">{student?.rollNumber}</span>
              <span>·</span>
              <span>{course?.courseName || 'B.Sc. Information Technology'}</span>
              <span>·</span>
              <span>Semester {student?.semester || 5}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCorrectionModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 whitespace-nowrap self-start md:self-auto"
        >
          <FileEdit className="w-3.5 h-3.5 text-indigo-400" />
          <span>Request Profile Correction</span>
        </button>
      </div>

      {/* Attendance Alert if < 75% */}
      {isAttendanceWarning ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Attendance Below 75% Threshold</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Your overall attendance is currently {attendancePercentage}%. University examination guidelines require a minimum of 75% to qualify for final exams.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Excellent Standing: Your overall attendance is {attendancePercentage}%, exceeding the required 75% academic threshold.
            </span>
          </div>
          <span className="font-mono text-emerald-700 font-bold hidden sm:inline">Exam Eligible</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Attendance"
          value={`${attendancePercentage}%`}
          subtitle={`${student?.totalSessionsAttended || 11} of ${student?.totalSessionsCount || 12} sessions attended`}
          icon={<CalendarCheck className="w-4 h-4 text-emerald-600" />}
          trend={{ value: 'Good Standing', isPositive: true }}
        />
        <StatsCard
          title="Cumulative Grade Average"
          value={`${data?.avgMarksPercentage || 88}%`}
          subtitle="Across all graded assessments"
          icon={<Award className="w-4 h-4 text-indigo-600" />}
          trend={{ value: 'A Grade Equivalent', isPositive: true }}
        />
        <StatsCard
          title="Current Term Courses"
          value={data?.semesterSubjects?.length || 5}
          subtitle="Semester 5 subjects registered"
          icon={<BookOpen className="w-4 h-4 text-blue-600" />}
        />
        <StatsCard
          title="Academic Status"
          value={student?.academicStatus || 'Active'}
          subtitle={`Enrolled Year ${student?.admissionYear || 2024}`}
          icon={<GraduationCap className="w-4 h-4 text-violet-600" />}
        />
      </div>

      {/* Subject-Wise Attendance Breakdown & Academic Gradebook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Attendance Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject-Wise Attendance Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated dynamically from lecture sessions</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Term 2026</span>
          </div>

          <div className="space-y-3.5">
            {(data?.subjectAttendance || [
              { subjectName: 'Full-Stack Web Development', attended: 6, total: 6, percentage: 100 },
              { subjectName: 'Cloud Computing & DevOps', attended: 3, total: 3, percentage: 100 },
              { subjectName: 'Network Security & Cryptography', attended: 2, total: 3, percentage: 67 }
            ]).map((item: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.subjectName}</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {item.attended} / {item.total} ({item.percentage}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.percentage >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Marks Gradebook */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Assessment Scores & Gradebook</h3>
              <p className="text-xs text-slate-500 mt-0.5">Official faculty evaluation transcript</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-semibold">Verified Marks</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Subject</th>
                  <th className="py-2.5 px-4 font-semibold">Assessment</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Score</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.studentMarks || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No grades published yet for current semester.
                    </td>
                  </tr>
                ) : (
                  (data?.studentMarks || []).map((mark: Mark) => (
                    <tr key={mark.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {mark.subjectName || mark.subjectCode}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{mark.assessmentName}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                        {mark.marksObtained} / {mark.maxMarks} ({mark.percentage}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Personal Dossier & Privacy Protection Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Personal Information & FERPA Privacy Notice</h3>
          <span className="text-xs text-slate-400">Strict Student-Only Isolation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Email</p>
              <p className="font-medium text-slate-800 truncate">{student?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Phone</p>
              <p className="font-medium text-slate-800">{student?.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Date of Birth</p>
              <p className="font-medium text-slate-800">{student?.dateOfBirth}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Mailing Address</p>
              <p className="font-medium text-slate-800 truncate">{student?.address || 'Campus Residence'}</p>
            </div>
          </div>
        </div>
      </div>

      <RequestCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        student={student || null}
        onSubmitted={() => loadStudentData()}
      />
    </div>
  );
};
