/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  studentId?: string; // Linked student record ID if role === 'student'
  teacherId?: string; // Linked teacher record ID if role === 'teacher'
  createdAt: string;
}

export interface Student {
  id: string;
  userId?: string;
  studentId: string; // e.g. STU-2024-001
  fullName: string;
  rollNumber: string; // e.g. 2024-IT-001
  email: string;
  phoneNumber: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  courseId: string;
  courseName?: string;
  courseCode?: string;
  semester: number;
  admissionYear: number;
  address?: string;
  academicStatus: 'Active' | 'Graduated' | 'Inactive';
  profileImageUrl?: string;
  attendancePercentage: number; // Dynamically calculated from recorded sessions
  totalSessionsAttended?: number;
  totalSessionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  employeeCode: string;
  department: string;
  designation: string;
  qualification: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  assignedCourses?: string[];
  assignedSubjects?: string[];
  avatarUrl?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  courseCode: string; // e.g. BSCIT, BTECH-CS
  courseName: string;
  department: string;
  durationYears: number;
  totalSemesters: number;
  description: string;
  studentCount?: number;
  subjectCount?: number;
}

export interface Subject {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  subjectCode: string; // e.g. CS101, IT402
  subjectName: string;
  semester: number;
  credits: number;
  totalHours: number;
  assignedTeacherName?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId: string;
  teacherName?: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  sessionType: 'Lecture' | 'Lab' | 'Tutorial';
  topicCovered?: string;
  totalStudentsPresent?: number;
  totalStudentsCount?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  status: AttendanceStatus;
  remarks?: string;
  sessionDate?: string;
  subjectName?: string;
  createdAt: string;
}

export interface Mark {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  courseName?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  assessmentName: string; // e.g. 'Midterm 1', 'Final Exam', 'Assignment 1', 'Lab Practical'
  maxMarks: number;
  marksObtained: number;
  percentage?: number;
  grade?: string; // A+, A, B, C, F
  examDate: string;
  enteredBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: UserRole | 'system';
  action: string;
  entityType: 'student' | 'teacher' | 'course' | 'attendance' | 'mark' | 'auth' | 'system';
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalCourses: number;
  averageAttendance: number;
  studentsByCourse: { courseName: string; count: number; code: string }[];
  studentsBySemester: { semester: string; count: number }[];
  attendanceTrend: { date: string; presentRate: number; totalSessions: number }[];
  statusDistribution: { status: string; count: number }[];
  recentStudents: Student[];
  recentActivities: ActivityLog[];
}

export interface StudentFilters {
  search?: string;
  courseId?: string;
  semester?: number | string;
  academicStatus?: string;
  sortBy?: 'name' | 'rollNumber' | 'admissionYear' | 'attendance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
