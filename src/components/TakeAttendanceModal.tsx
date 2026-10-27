/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Subject, Student, AttendanceStatus } from '../types/index.ts';
import { Modal } from './common/Modal.tsx';
import { useToast } from './common/Toast.tsx';
import { api } from '../lib/api.ts';
import { Loader2, Check, Clock, XCircle, CheckCheck } from 'lucide-react';

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onAttendanceSaved: () => void;
}

export const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({
  isOpen,
  onClose,
  courses,
  onAttendanceSaved,
}) => {
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course-bscit');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [topicCovered, setTopicCovered] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load subjects when course changes
  useEffect(() => {
    if (selectedCourseId) {
      api.getSubjects(selectedCourseId).then((subs) => {
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
        }
      });
    }
  }, [selectedCourseId]);

  // Load students for the selected course
  useEffect(() => {
    if (isOpen && selectedCourseId) {
      setLoadingStudents(true);
      api.getStudents({ courseId: selectedCourseId, limit: 100 })
        .then((res) => {
          setStudents(res.students);
          // Default all to Present
          const initialMap: Record<string, AttendanceStatus> = {};
          res.students.forEach((s) => {
            initialMap[s.id] = 'Present';
          });
          setAttendanceMap(initialMap);
        })
        .finally(() => setLoadingStudents(false));
    }
  }, [isOpen, selectedCourseId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSubjectId || !sessionDate) {
      showToast('Please select course, subject, and date', 'error');
      return;
    }

    if (students.length === 0) {
      showToast('No students enrolled in this course to mark attendance', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Session
      const session = await api.createAttendanceSession({
        courseId: selectedCourseId,
        subjectId: selectedSubjectId,
        sessionDate,
        sessionType,
        topicCovered,
      });

      // 2. Mark records
      const recordsToPost = students.map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'Present',
      }));

      await api.markAttendance(session.id, recordsToPost);

      showToast(`Attendance recorded for ${recordsToPost.length} students`, 'success');
      onAttendanceSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to record attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Class Attendance"
      subtitle="Create a lecture or lab session and mark student attendance."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {subjects.length === 0 && <option value="">No subjects available</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab Practical</option>
              <option value="Tutorial">Tutorial / Seminar</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Covered</label>
            <input
              type="text"
              value={topicCovered}
              onChange={(e) => setTopicCovered(e.target.value)}
              placeholder="e.g. Unit 3: Normalization & ACID Transactions"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>
        </div>

        {/* Student Attendance Roster */}
        <div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Students ({students.length})
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => markAll('Present')}
                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
              <button
                type="button"
                onClick={() => markAll('Absent')}
                className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {loadingStudents ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading student class roster...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No students enrolled in this course yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {students.map((student) => {
                const currentStatus = attendanceMap[student.id] || 'Present';
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50/50"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {student.rollNumber} · Sem {student.semester}
                      </p>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'Present')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Present</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'Late')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          currentStatus === 'Late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Late</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'Absent')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          currentStatus === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || students.length === 0}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Attendance Session</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
