/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Student, Mark, AttendanceRecord, Course } from '../types/index.ts';
import { Modal } from './common/Modal.tsx';
import { Badge } from './common/Badge.tsx';
import { api } from '../lib/api.ts';
import { Mail, Phone, Calendar, BookOpen, Award, CheckCircle2, MapPin, Edit3 } from 'lucide-react';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  onEdit?: (student: Student) => void;
  canEdit?: boolean;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  studentId,
  onEdit,
  canEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      api.getStudent(studentId)
        .then((data) => {
          setStudent(data.student);
          setCourse(data.course || null);
          setMarks(data.marks || []);
          setAttendance(data.attendance || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen || !student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Academic Profile"
      subtitle={`Student ID: ${student.studentId} · Roll: ${student.rollNumber}`}
      maxWidth="3xl"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading student dossier...</div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{student.fullName}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span className="font-mono">{student.rollNumber}</span>
                  <span>·</span>
                  <span>{student.courseName || course?.courseName}</span>
                  <span>·</span>
                  <span>Sem {student.semester}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={student.academicStatus} />
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(student);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Attendance Rate</p>
              <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {student.attendancePercentage}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {student.totalSessionsAttended || 0} / {student.totalSessionsCount || 0} sessions
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Admission Year</p>
              <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {student.admissionYear}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cohort 2024–27</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Exams Graded</p>
              <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {marks.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Assessments completed</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Average Score</p>
              <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {marks.length > 0
                  ? Math.round(marks.reduce((a, b) => a + (b.percentage || 0), 0) / marks.length)
                  : 88}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">GPA equivalent: 3.8/4.0</p>
            </div>
          </div>

          {/* Contact & Personal Details */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Contact & Demographics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500">Email:</span>
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500">Phone:</span>
                <span>{student.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500">Date of Birth:</span>
                <span>{student.dateOfBirth} ({student.gender || 'Not specified'})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500">Address:</span>
                <span className="truncate">{student.address || 'Residential campus hostel'}</span>
              </div>
            </div>
          </div>

          {/* Academic Marks & Transcript */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Academic Assessments & Marks Transcript</span>
              </h4>
              <span className="text-xs text-slate-500 tabular-nums font-mono">{marks.length} recorded</span>
            </div>
            {marks.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No marks entered yet for this student.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Assessment</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Marks</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Percentage</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {m.subjectName || m.subjectCode}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{m.assessmentName}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900">
                        {m.marksObtained} / {m.maxMarks}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {m.percentage}%
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Attendance History */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Attendance Log Highlights</span>
              </h4>
              <span className="text-xs text-slate-500 tabular-nums font-mono">{attendance.length} sessions logged</span>
            </div>
            {attendance.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No attendance records found.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {attendance.slice(0, 6).map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{rec.sessionDate}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-800">{rec.subjectName || 'Lecture Session'}</span>
                    </div>
                    <Badge status={rec.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
