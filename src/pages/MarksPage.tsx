/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Mark, Course } from '../types/index.ts';
import { AddMarksModal } from '../components/AddMarksModal.tsx';
import { api } from '../lib/api.ts';
import { useToast } from '../components/common/Toast.tsx';
import { Award, Plus, Trash2, Search } from 'lucide-react';

export const MarksPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [marks, setMarks] = useState<Mark[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('All');

  // Modal
  const [isAddMarksOpen, setIsAddMarksOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mList, cList] = await Promise.all([
        api.getMarks(),
        api.getCourses(),
      ]);
      setMarks(mList);
      setCourses(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMark = async (id: string, studentName?: string) => {
    if (!window.confirm(`Are you sure you want to remove this assessment grade entry for ${studentName || 'student'}?`)) {
      return;
    }
    try {
      await api.deleteMark(id);
      showToast('Assessment mark deleted', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete mark', 'error');
    }
  };

  const filteredMarks = marks.filter((m) => {
    const matchesSearch =
      (m.studentName && m.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (m.rollNumber && m.rollNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.subjectName && m.subjectName.toLowerCase().includes(search.toLowerCase())) ||
      (m.subjectCode && m.subjectCode.toLowerCase().includes(search.toLowerCase()));

    const matchesAssessment =
      selectedAssessment === 'All' || m.assessmentName === selectedAssessment;

    return matchesSearch && matchesAssessment;
  });

  const canManage = role === 'admin' || role === 'teacher';

  const avgMarks = marks.length > 0
    ? Math.round(marks.reduce((acc, m) => acc + (m.percentage || 0), 0) / marks.length)
    : 89;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Academic Marks & Assessment Evaluation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Standardized grading records, validation limits, and transcript management.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddMarksOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Assessment Marks</span>
          </button>
        )}
      </div>

      {/* Grade Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Graded Submissions</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">{marks.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Across all departments</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Class Score</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1">{avgMarks}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Grade A standard performance</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Distinction (A+ / A)</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {marks.filter((m) => m.grade === 'A+' || m.grade === 'A').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Scored &ge; 80%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, roll number, or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="All">All Assessment Types</option>
            <option value="Midterm 1">Midterm 1</option>
            <option value="Midterm 2">Midterm 2</option>
            <option value="Final Exam">Final Exam</option>
            <option value="Lab Practical">Lab Practical</option>
            <option value="Internal Assignment">Internal Assignment</option>
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Student & Roll No</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Assessment</th>
                <th className="py-3 px-4 font-semibold text-right">Score</th>
                <th className="py-3 px-4 font-semibold text-right">Percentage</th>
                <th className="py-3 px-4 font-semibold text-center">Grade</th>
                <th className="py-3 px-4 font-semibold">Date & Evaluator</th>
                {canManage && <th className="py-3 px-4 font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading assessment marks...
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">No assessment entries found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click &quot;Record Assessment Marks&quot; to grade student work.</p>
                  </td>
                </tr>
              ) : (
                filteredMarks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{mark.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{mark.rollNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{mark.subjectName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{mark.subjectCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{mark.assessmentName}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold">
                      {mark.marksObtained} / {mark.maxMarks}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {mark.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                        {mark.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      <div>{mark.examDate}</div>
                      <div className="text-slate-400 text-[10px] font-sans">{mark.enteredBy || 'Faculty'}</div>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMark(mark.id, mark.studentName)}
                          title="Delete mark"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddMarksModal
        isOpen={isAddMarksOpen}
        onClose={() => setIsAddMarksOpen(false)}
        courses={courses}
        onMarksSaved={() => loadData()}
      />
    </div>
  );
};
