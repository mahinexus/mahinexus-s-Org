/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, Subject, Course } from '../types/index.ts';
import { Modal } from './common/Modal.tsx';
import { useToast } from './common/Toast.tsx';
import { api } from '../lib/api.ts';
import { Loader2, AlertCircle } from 'lucide-react';

interface AddMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onMarksSaved: () => void;
  preselectedStudentId?: string;
}

export const AddMarksModal: React.FC<AddMarksModalProps> = ({
  isOpen,
  onClose,
  courses,
  onMarksSaved,
  preselectedStudentId,
}) => {
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course-bscit');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [studentId, setStudentId] = useState(preselectedStudentId || '');
  const [subjectId, setSubjectId] = useState('');
  const [assessmentName, setAssessmentName] = useState('Midterm 1');
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [marksObtained, setMarksObtained] = useState<number | ''>(42);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourseId) {
      api.getSubjects(selectedCourseId).then((subs) => {
        setSubjects(subs);
        if (subs.length > 0) setSubjectId(subs[0].id);
      });

      api.getStudents({ courseId: selectedCourseId, limit: 100 }).then((res) => {
        setStudents(res.students);
        if (preselectedStudentId) {
          setStudentId(preselectedStudentId);
        } else if (res.students.length > 0) {
          setStudentId(res.students[0].id);
        }
      });
    }
  }, [selectedCourseId, preselectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!studentId || !subjectId || !assessmentName) {
      setValidationError('Please select student, subject, and assessment');
      return;
    }

    const max = Number(maxMarks);
    const obtained = Number(marksObtained);

    if (isNaN(max) || max <= 0) {
      setValidationError('Maximum marks must be greater than zero');
      return;
    }
    if (isNaN(obtained) || obtained < 0) {
      setValidationError('Marks obtained cannot be negative');
      return;
    }
    if (obtained > max) {
      setValidationError(`Marks obtained (${obtained}) cannot exceed maximum marks (${max})`);
      return;
    }

    setSubmitting(true);
    try {
      await api.createMark({
        studentId,
        subjectId,
        assessmentName,
        maxMarks: max,
        marksObtained: obtained,
        examDate,
        remarks,
      });

      showToast('Assessment marks recorded successfully', 'success');
      onMarksSaved();
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to record marks');
      showToast(err.message || 'Error saving marks', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const percentage =
    marksObtained !== '' && maxMarks > 0 ? Math.round((Number(marksObtained) / maxMarks) * 100) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Assessment Marks"
      subtitle="Input evaluated examination, midterm, or practical laboratory scores."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectCode} - {sub.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Type</label>
            <select
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              <option value="Midterm 1">Midterm Exam 1</option>
              <option value="Midterm 2">Midterm Exam 2</option>
              <option value="Final Exam">Final Semester Exam</option>
              <option value="Lab Practical">Lab Practical & Viva</option>
              <option value="Internal Assignment">Internal Assignment</option>
              <option value="Capstone Project">Senior Project Defense</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
            <input
              type="number"
              min="1"
              max="200"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Obtained</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={maxMarks}
              value={marksObtained}
              onChange={(e) => setMarksObtained(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Calculated Score:</span>
            <span className="text-xs font-bold font-mono text-indigo-700">
              {percentage !== null
                ? `${percentage}% (${percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F'})`
                : '—'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluator Feedback / Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Well organized solution with clear algorithmic analysis"
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

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
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Marks</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
