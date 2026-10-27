/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BadgeProps {
  status: 'Active' | 'Inactive' | 'Graduated' | 'Present' | 'Absent' | 'Late' | 'Pending' | 'Approved' | 'Rejected' | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let indicator = 'bg-slate-400';

  if (normalized === 'active' || normalized === 'present' || normalized === 'approved') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    indicator = 'bg-emerald-500';
  } else if (normalized === 'absent' || normalized === 'inactive' || normalized === 'rejected') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200/60';
    indicator = 'bg-rose-500';
  } else if (normalized === 'late' || normalized === 'pending') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/60';
    indicator = 'bg-amber-500';
  } else if (normalized === 'graduated') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200/60';
    indicator = 'bg-blue-500';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${styles} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${indicator}`} aria-hidden="true" />
      {status}
    </span>
  );
};
