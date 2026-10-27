/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types/index.ts';
import { Modal } from './common/Modal.tsx';
import { useToast } from './common/Toast.tsx';
import { AlertCircle, Loader2 } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  studentToEdit?: Student | null;
  courses: Course[];
  onSubmit: (data: Partial<Student>) => Promise<Student>;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
  courses,
  onSubmit,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '2004-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
    courseId: '',
    semester: 1,
    admissionYear: 2024,
    address: '',
    academicStatus: 'Active' as 'Active' | 'Graduated' | 'Inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        fullName: studentToEdit.fullName,
        rollNumber: studentToEdit.rollNumber,
        email: studentToEdit.email,
        phoneNumber: studentToEdit.phoneNumber,
        dateOfBirth: studentToEdit.dateOfBirth,
        gender: studentToEdit.gender || 'Male',
        courseId: studentToEdit.courseId,
        semester: studentToEdit.semester,
        admissionYear: studentToEdit.admissionYear,
        address: studentToEdit.address || '',
        academicStatus: studentToEdit.academicStatus,
      });
    } else {
      setFormData({
        fullName: '',
        rollNumber: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '2004-01-01',
        gender: 'Male',
        courseId: courses[0]?.id || 'course-bscit',
        semester: 1,
        admissionYear: 2024,
        address: '',
        academicStatus: 'Active',
      });
    }
    setErrors({});
    setServerError(null);
  }, [studentToEdit, courses, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'College roll number is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    if (!formData.courseId) errs.courseId = 'Select an academic course';
    if (!formData.semester || formData.semester < 1 || formData.semester > 10) {
      errs.semester = 'Semester must be between 1 and 10';
    }
    if (!formData.admissionYear || formData.admissionYear < 2018 || formData.admissionYear > 2027) {
      errs.admissionYear = 'Enter valid admission year';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await onSubmit(formData);
      showToast(
        studentToEdit
          ? `Updated student record for ${result.fullName}`
          : `Successfully enrolled ${result.fullName}`,
        'success'
      );
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save student record');
      showToast(err.message || 'Validation error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Student Record' : 'Enroll New Student'}
      subtitle={
        studentToEdit
          ? `Editing details for Roll No: ${studentToEdit.rollNumber}`
          : 'Register an admitted student into the database.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Maya Lin"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
                errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College Roll Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              placeholder="e.g. 2024-IT-045"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
                errors.rollNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.rollNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.rollNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@college.edu"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
                errors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.phoneNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Degree Program <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Semester <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Year <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="2018"
              max="2027"
              value={formData.admissionYear}
              onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Status</label>
            <select
              value={formData.academicStatus}
              onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            >
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mailing Address (Optional)</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Room 204, Campus Hostel / Residential Address"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
            <span>{studentToEdit ? 'Save Changes' : 'Enroll Student'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
