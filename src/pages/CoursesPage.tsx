/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Course, Subject } from '../types/index.ts';
import { Modal } from '../components/common/Modal.tsx';
import { useToast } from '../components/common/Toast.tsx';
import { api } from '../lib/api.ts';
import { BookOpen, Plus, Clock, Users, ChevronRight, Loader2 } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');

  // Modals
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingSubject, setSubmittingSubject] = useState(false);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    durationYears: 3,
    totalSemesters: 6,
    description: '',
  });

  // New Subject Form State
  const [newSubject, setNewSubject] = useState({
    courseId: '',
    subjectCode: '',
    subjectName: '',
    semester: 1,
    credits: 4,
    totalHours: 60,
  });

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      api.getSubjects(selectedCourse.id).then((subs) => {
        setSubjects(subs);
      });
      setNewSubject((prev) => ({ ...prev, courseId: selectedCourse.id }));
    }
  }, [selectedCourse]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCourse(true);
    try {
      const created = await api.createCourse(newCourse);
      showToast(`Created course ${created.courseName}`, 'success');
      setIsAddCourseOpen(false);
      setNewCourse({
        courseCode: '',
        courseName: '',
        department: '',
        durationYears: 3,
        totalSemesters: 6,
        description: '',
      });
      await loadCourses();
      setSelectedCourse(created);
    } catch (err: any) {
      showToast(err.message || 'Failed to create course', 'error');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSubject(true);
    try {
      const created = await api.createSubject(newSubject);
      showToast(`Added subject ${created.subjectName}`, 'success');
      setIsAddSubjectOpen(false);
      setNewSubject({
        courseId: selectedCourse?.id || '',
        subjectCode: '',
        subjectName: '',
        semester: 1,
        credits: 4,
        totalHours: 60,
      });
      if (selectedCourse) {
        const subs = await api.getSubjects(selectedCourse.id);
        setSubjects(subs);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add subject', 'error');
    } finally {
      setSubmittingSubject(false);
    }
  };

  const filteredSubjects =
    selectedSemester === 'all'
      ? subjects
      : subjects.filter((s) => s.semester === selectedSemester);

  const canManage = role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Academic Curriculum & Courses</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse degree programs, semester breakdowns, syllabus structures, and credit allocations.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree Course</span>
            </button>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split: Course Selector Cards & Selected Course Curriculum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Degree Programs ({courses.length})
          </h3>
          <div className="space-y-2.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                        {course.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{course.courseName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{course.department}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.durationYears} Years ({course.totalSemesters} Sems)
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {course.studentCount || 0} Students
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Course Syllabus & Subject Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {selectedCourse ? (
            <div>
              <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {selectedCourse.courseCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{selectedCourse.courseName}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedCourse.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-slate-500">
                      {subjects.length} Total Subjects
                    </span>
                  </div>
                </div>

                {/* Semester Filter Tabs */}
                <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedSemester('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      selectedSemester === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Semesters
                  </button>
                  {Array.from({ length: selectedCourse.totalSemesters }).map((_, i) => {
                    const sem = i + 1;
                    return (
                      <button
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          selectedSemester === sem
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Sem {sem}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects List */}
              <div className="divide-y divide-slate-100">
                {filteredSubjects.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No subjects defined for this semester. Click &quot;Add Subject&quot; to expand the syllabus.
                  </div>
                ) : (
                  filteredSubjects.map((subject) => (
                    <div key={subject.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {subject.subjectCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{subject.subjectName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Semester {subject.semester}</span>
                          <span>·</span>
                          <span>{subject.credits} Credit Hours</span>
                          <span>·</span>
                          <span>{subject.totalHours} Practical / Lecture Hours</span>
                        </div>
                      </div>

                      <span className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
                        {subject.credits} Credits
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">Select a course to view syllabus</div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        title="Create New Degree Program"
        subtitle="Establish an academic course structure in the college catalog."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
            <input
              type="text"
              required
              placeholder="e.g. BSCIT, BTECH-AI"
              value={newCourse.courseCode}
              onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Degree Title</label>
            <input
              type="text"
              required
              placeholder="e.g. B.Sc. Information Technology"
              value={newCourse.courseName}
              onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              required
              placeholder="e.g. Department of Information Technology"
              value={newCourse.department}
              onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={newCourse.durationYears}
                onChange={(e) => setNewCourse({ ...newCourse, durationYears: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Semesters</label>
              <input
                type="number"
                min="2"
                max="12"
                required
                value={newCourse.totalSemesters}
                onChange={(e) => setNewCourse({ ...newCourse, totalSemesters: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Description</label>
            <textarea
              rows={2}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder="Program objectives and learning outcomes."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddCourseOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCourse}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submittingCourse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Course</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        title="Add Curriculum Subject"
        subtitle="Associate a new course unit with specific credits and syllabus hours."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course</label>
            <select
              value={newSubject.courseId}
              onChange={(e) => setNewSubject({ ...newSubject, courseId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="e.g. IT504"
                value={newSubject.subjectCode}
                onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={newSubject.semester}
                onChange={(e) => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Mobile Computing & Microservices"
              value={newSubject.subjectName}
              onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={newSubject.credits}
                onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Hours</label>
              <input
                type="number"
                min="15"
                max="120"
                value={newSubject.totalHours}
                onChange={(e) => setNewSubject({ ...newSubject, totalHours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingSubject}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submittingSubject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Subject</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
