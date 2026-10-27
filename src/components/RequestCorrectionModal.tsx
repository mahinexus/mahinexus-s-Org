/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student } from '../types/index.ts';
import { Modal } from './common/Modal.tsx';
import { useToast } from './common/Toast.tsx';
import { api } from '../lib/api.ts';
import { Loader2 } from 'lucide-react';

interface RequestCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmitted?: () => void;
}

export const RequestCorrectionModal: React.FC<RequestCorrectionModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmitted,
}) => {
  const { showToast } = useToast();
  const [fieldName, setFieldName] = useState('phone_number');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getCurrentValue = () => {
    if (!student) return '';
    if (fieldName === 'phone_number') return student.phoneNumber;
    if (fieldName === 'address') return student.address || 'None recorded';
    if (fieldName === 'fullName') return student.fullName;
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !reason.trim()) {
      showToast('Please provide requested value and reason', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createCorrectionRequest({
        studentId: student?.id,
        fieldName,
        currentValue: getCurrentValue(),
        requestedValue: requestedValue.trim(),
        reason: reason.trim(),
      });

      showToast('Profile correction request submitted to the Dean’s Office', 'success');
      setRequestedValue('');
      setReason('');
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Record Correction"
      subtitle="Submit an official request to update your student profile information."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Field to Correct</label>
          <select
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          >
            <option value="phone_number">Contact Phone Number</option>
            <option value="address">Permanent / Hostel Address</option>
            <option value="fullName">Full Name (Legal Documentation)</option>
          </select>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Current Record: </span>
          <span className="font-semibold text-slate-800">{getCurrentValue()}</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New / Corrected Value <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={requestedValue}
            onChange={(e) => setRequestedValue(e.target.value)}
            placeholder="e.g. +1 (555) 987-6543"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Reason & Verification Context <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain reason for discrepancy (e.g. carrier device replacement, relocation)"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
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
            <span>Submit Request</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
