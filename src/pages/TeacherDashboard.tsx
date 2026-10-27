/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { StatsCard } from '../components/common/StatsCard.tsx';
import { TakeAttendanceModal } from '../components/TakeAttendanceModal.tsx';
import { AddMarksModal } from '../components/AddMarksModal.tsx';
import { StudentDetailsModal } from '../components/StudentDetailsModal.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { api } from '../lib/api.ts';
import {
  BookOpen,
  CalendarCheck,
  Award,
  Users,
  Search,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Course, Student, Subject, AttendanceSession } from '../types/index.ts';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isMarksOpen, setIsMarksOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tStats, cList, stuList] = await Promise.all([
        api.getTeacherDashboardStats(),
        api.getCourses(),
        api.getStudents({ limit: 50 }),
      ]);
      setData(tStats);
      setCourses(cList);
      setStudents(stuList.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.courseCode && s.courseCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Faculty Profile Hero */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
            Faculty Academic Portal
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Welcome back, {user?.fullName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Information Technology & Computer Science · Academic Year 2026–27
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAttendanceOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setIsMarksOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* Faculty KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Subjects"
          value={data?.assignedSubjects?.length || 3}
          subtitle="Curriculum lecture & lab courses"
          icon={<BookOpen className="w-4 h-4 text-indigo-600" />}
        />
        <StatsCard
          title="Students Under Guidance"
          value={data?.studentsUnderGuidance || 12}
          subtitle="Enrolled in your cohorts"
          icon={<Users className="w-4 h-4 text-emerald-600" />}
        />
        <StatsCard
          title="Sessions Conducted"
          value={data?.totalSessionsConducted || 8}
          subtitle="Recorded in current term"
          icon={<CalendarCheck className="w-4 h-4 text-blue-600" />}
        />
        <StatsCard
          title="Average Class Attendance"
          value="91.4%"
          subtitle="Across your subjects"
          icon={<CheckCircle className="w-4 h-4 text-amber-600" />}
          trend={{ value: 'Above college target', isPositive: true }}
        />
      </div>

      {/* Assigned Subjects & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Subjects (1 Col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Your Assigned Subjects</h3>
          <p className="text-xs text-slate-500">Authorized curriculum subjects for attendance and marks</p>
          <div className="space-y-2 pt-2">
            {(data?.assignedSubjects || [
              { id: 'sub-1', subjectName: 'Full-Stack Web Development', subjectCode: 'IT501', semester: 5, credits: 4 },
              { id: 'sub-2', subjectName: 'Cloud Computing & DevOps', subjectCode: 'IT502', semester: 5, credits: 3 },
              { id: 'sub-3', subjectName: 'Mobile Application Architecture', subjectCode: 'BCA501', semester: 5, credits: 4 }
            ]).map((sub: Subject) => (
              <div key={sub.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{sub.subjectName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {sub.subjectCode} · Sem {sub.semester} · {sub.credits} Credits
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Students Roster (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Cohort Students</h3>
              <p className="text-xs text-slate-500 mt-0.5">Students enrolled in your courses</p>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or roll..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Student</th>
                  <th className="py-2.5 px-4 font-semibold">Roll Number</th>
                  <th className="py-2.5 px-4 font-semibold">Course</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Attendance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 7).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{student.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.courseCode} · Sem {student.semester}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
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
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TakeAttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        courses={courses}
        onAttendanceSaved={() => loadData()}
      />

      <AddMarksModal
        isOpen={isMarksOpen}
        onClose={() => setIsMarksOpen(false)}
        courses={courses}
        onMarksSaved={() => loadData()}
      />

      <StudentDetailsModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        canEdit={false}
      />
    </div>
  );
};
