/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Teacher, CorrectionRequest, ActivityLog } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { useToast } from '../components/common/Toast.tsx';
import { api } from '../lib/api.ts';
import { UserCheck, FileCheck, History, CheckCircle, XCircle } from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'teachers' | 'corrections' | 'activity'>('teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const loadData = async () => {
    try {
      const [tList, cList, aList] = await Promise.all([
        api.getTeachers(),
        api.getCorrectionRequests(),
        api.getActivityLogs(),
      ]);
      setTeachers(tList);
      setCorrections(cList);
      setActivityLogs(aList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCorrection = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.updateCorrectionRequest(id, status, `Reviewed and ${status.toLowerCase()} by Dean Office`);
      showToast(`Correction request ${status.toLowerCase()}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">User Administration & Audit Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Faculty accounts, student profile correction requests, and system-wide security audit trails.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'teachers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'corrections' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Corrections ({corrections.filter((c) => c.status === 'Pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({activityLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Faculty Teachers */}
      {activeTab === 'teachers' && (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Registered Faculty Members</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Role-Based Access Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Teacher Name</th>
                  <th className="py-3 px-4 font-semibold">Employee Code</th>
                  <th className="py-3 px-4 font-semibold">Department & Rank</th>
                  <th className="py-3 px-4 font-semibold">Academic Qualifications</th>
                  <th className="py-3 px-4 font-semibold">Joining Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{teacher.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{teacher.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {teacher.employeeCode}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{teacher.designation}</div>
                      <div className="text-[11px] text-slate-500">{teacher.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {teacher.qualification}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {teacher.joiningDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={teacher.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Profile Correction Requests */}
      {activeTab === 'corrections' && (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Student Profile Modification Requests</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {corrections.filter((c) => c.status === 'Pending').length} Action Required
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {corrections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No correction requests submitted.</div>
            ) : (
              corrections.map((req) => (
                <div key={req.id} className="p-4 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{req.studentName}</span>
                      <span className="font-mono text-xs text-slate-500">({req.rollNumber})</span>
                      <Badge status={req.status} />
                    </div>
                    <div className="text-xs text-slate-600">
                      Requested changing field <span className="font-mono font-semibold text-slate-800">{req.fieldName}</span>:
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded line-through">
                        {req.currentValue}
                      </span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded border border-emerald-200">
                        {req.requestedValue}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      &quot;{req.reason}&quot;
                    </p>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateCorrection(req.id, 'Approved')}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateCorrection(req.id, 'Rejected')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Activity Logs */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Full Audit Trail & Administrative Actions</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Immutable System Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor / User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Log Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 capitalize font-mono text-slate-600">
                      {log.actorRole}
                    </td>
                    <td className="py-3 px-4 font-medium text-indigo-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-slate-500">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
