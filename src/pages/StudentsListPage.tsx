/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Student, Course, StudentFilters } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { StudentFormModal } from '../components/StudentFormModal.tsx';
import { StudentDetailsModal } from '../components/StudentDetailsModal.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { useToast } from '../components/common/Toast.tsx';
import { api } from '../lib/api.ts';
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
  UserCheck
} from 'lucide-react';

export const StudentsListPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'rollNumber' | 'admissionYear' | 'attendance' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params: StudentFilters = {
        search,
        courseId: courseFilter || undefined,
        semester: semesterFilter ? Number(semesterFilter) : undefined,
        academicStatus: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit: 8,
      };

      const res = await api.getStudents(params);
      setStudents(res.students);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, semesterFilter, statusFilter, sortBy, sortOrder, page, showToast]);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSort = (field: 'name' | 'rollNumber' | 'admissionYear' | 'attendance' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      showToast(`Student ${studentToDelete.fullName} record deleted`, 'success');
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      courseId: courseFilter,
      semester: semesterFilter ? Number(semesterFilter) : undefined,
      academicStatus: statusFilter,
    });
    window.location.href = url;
  };

  const canManage = role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Students Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, enroll, and manage college students across all academic programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, roll number, email, or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

        {/* Course Filter */}
        <div>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="">All Courses & Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <select
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="All">All Academic Statuses</option>
            <option value="Active">Active Standing</option>
            <option value="Graduated">Graduated Alumni</option>
            <option value="Inactive">Inactive / On Leave</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Full Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rollNumber')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roll Number</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Course & Semester</th>
                <th
                  onClick={() => handleSort('admissionYear')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Admission Year</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-indigo-600 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Attendance Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">No student records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or enroll a new student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{student.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.courseCode || student.courseName} · Sem {student.semester}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {student.admissionYear}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {student.attendancePercentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={student.academicStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          title="View Profile"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          aria-label={`View profile of ${student.fullName}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setStudentToEdit(student);
                                setIsFormOpen(true);
                              }}
                              title="Edit Details"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                              aria-label={`Edit ${student.fullName}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setStudentToDelete(student)}
                              title="Delete Record"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                              aria-label={`Delete ${student.fullName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold font-mono tabular-nums">{students.length}</span> of{' '}
            <span className="font-semibold font-mono tabular-nums">{total}</span> student records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-mono tabular-nums px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        courses={courses}
        onSubmit={async (data) => {
          if (studentToEdit) {
            return api.updateStudent(studentToEdit.id, data);
          } else {
            return api.createStudent(data);
          }
        }}
        onSuccess={() => fetchStudents()}
      />

      {/* Student Details Dossier */}
      <StudentDetailsModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        canEdit={canManage}
        onEdit={(stu) => {
          setStudentToEdit(stu);
          setIsFormOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        title="Confirm Student Deletion"
        subtitle="This action will permanently purge the student record, assessment marks, and attendance logs."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              Are you sure you want to delete <span className="font-bold">{studentToDelete?.fullName}</span>{' '}
              (Roll No: <span className="font-mono">{studentToDelete?.rollNumber}</span>)? This cannot be undone.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStudentToDelete(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm & Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
