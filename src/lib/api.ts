/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Student,
  Course,
  Subject,
  Teacher,
  UserProfile,
  DashboardStats,
  AttendanceSession,
  AttendanceRecord,
  Mark,
  CorrectionRequest,
  ActivityLog,
  StudentFilters,
  UserRole
} from '../types/index.ts';
import { db } from '../../server/db.ts';

// Get current session headers from localStorage
const getAuthHeaders = (): Record<string, string> => {
  const storedUser = localStorage.getItem('campuscore_user');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role) headers['x-user-role'] = parsed.role;
      if (parsed.id) headers['x-user-id'] = parsed.id;
    } catch (e) {
      // Ignore parse error
    }
  }

  return headers;
};

// Check if response is valid JSON from an Express API endpoint
const isJsonResponse = (res: Response): boolean => {
  const contentType = res.headers.get('content-type');
  return Boolean(res.ok && contentType && contentType.includes('application/json'));
};

export const api = {
  // Auth
  async login(email: string, password: string, role?: UserRole): Promise<{ user: UserProfile; token: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (isJsonResponse(res)) {
        return await res.json();
      }
    } catch (e) {
      // Fallback to local DB store
    }

    const user = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    db.logAction(user.fullName, user.role, 'User Signed In', 'auth', 'Signed into portal session');
    return {
      user,
      token: `demo-jwt-token-${user.id}`
    };
  },

  async demoLogin(role: UserRole): Promise<{ user: UserProfile; token: string }> {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (isJsonResponse(res)) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    const targetUser = db.profiles.find(p => p.role === role) || db.profiles[0];
    db.logAction(targetUser.fullName, targetUser.role, 'Demo Session Switched', 'auth', `Switched active role to ${role}`);
    return {
      user: targetUser,
      token: `demo-jwt-token-${targetUser.id}`
    };
  },

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const headers = getAuthHeaders();
    const role = headers['x-user-role'] as UserRole || 'admin';
    const user = db.profiles.find(p => p.role === role) || db.profiles[0];
    return { user };
  },

  // Dashboards
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/dashboard/stats', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    return db.getDashboardStats();
  },

  async getTeacherDashboardStats(): Promise<any> {
    try {
      const res = await fetch('/api/dashboard/teacher-stats', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const teacher = db.teachers[0];
    const assignedSubjects = db.subjects.filter(s => teacher.assignedSubjects?.includes(s.id));
    const assignedCourses = db.courses.filter(c => teacher.assignedCourses?.includes(c.id));
    const teacherSessions = db.attendanceSessions.filter(s => s.teacherId === teacher.id);
    const assignedCourseIds = assignedCourses.map(c => c.id);
    const studentsInClasses = db.students.filter(s => assignedCourseIds.includes(s.courseId));

    return {
      teacher,
      assignedSubjects,
      assignedCourses,
      totalSessionsConducted: teacherSessions.length,
      studentsUnderGuidance: studentsInClasses.length,
      recentSessions: teacherSessions.slice(-4).reverse()
    };
  },

  async getStudentDashboardStats(): Promise<any> {
    try {
      const res = await fetch('/api/dashboard/student-stats', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const headers = getAuthHeaders();
    let student = db.students.find(s => s.id === headers['x-user-id'] || s.userId === headers['x-user-id']) || db.students[0];
    db.refreshStudentAttendanceStats(student.id);

    const studentMarks = db.marks.filter(m => m.studentId === student.id);
    const attendanceHistory = db.attendanceRecords.filter(r => r.studentId === student.id);
    const course = db.courses.find(c => c.id === student?.courseId);
    const semesterSubjects = db.subjects.filter(s => s.courseId === student?.courseId && s.semester === student?.semester);

    const subjectAttendance: { subjectName: string; attended: number; total: number; percentage: number }[] = [];
    for (const sub of semesterSubjects) {
      const subSessions = db.attendanceSessions.filter(sess => sess.subjectId === sub.id);
      const subSessionIds = subSessions.map(sess => sess.id);
      const records = attendanceHistory.filter(r => subSessionIds.includes(r.sessionId));
      const attended = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const total = records.length;
      subjectAttendance.push({
        subjectName: sub.subjectName,
        attended,
        total,
        percentage: total > 0 ? Math.round((attended / total) * 100) : 100
      });
    }

    const avgMarksPercentage = studentMarks.length > 0
      ? Math.round(studentMarks.reduce((acc, m) => acc + (m.percentage || 0), 0) / studentMarks.length)
      : 88;

    return {
      student,
      course,
      semesterSubjects,
      attendanceHistory: attendanceHistory.slice(-6).reverse(),
      subjectAttendance,
      studentMarks,
      avgMarksPercentage
    };
  },

  // Students
  async getStudents(params?: StudentFilters): Promise<{
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        if (params.search) searchParams.append('search', params.search);
        if (params.courseId) searchParams.append('courseId', params.courseId);
        if (params.semester) searchParams.append('semester', String(params.semester));
        if (params.academicStatus) searchParams.append('academicStatus', params.academicStatus);
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        if (params.page) searchParams.append('page', String(params.page));
        if (params.limit) searchParams.append('limit', String(params.limit));
      }
      const res = await fetch(`/api/students?${searchParams.toString()}`, { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    return db.getStudents(params || {});
  },

  async getStudent(id: string): Promise<{
    student: Student;
    course?: Course;
    marks: Mark[];
    attendance: AttendanceRecord[];
  }> {
    try {
      const res = await fetch(`/api/students/${id}`, { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const student = db.students.find(s => s.id === id || s.studentId === id);
    if (!student) throw new Error('Student record not found');
    db.refreshStudentAttendanceStats(student.id);

    return {
      student,
      course: db.courses.find(c => c.id === student.courseId),
      marks: db.marks.filter(m => m.studentId === student.id),
      attendance: db.attendanceRecords.filter(a => a.studentId === student.id)
    };
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    // Validation
    const { fullName, rollNumber, email, phoneNumber, courseId, semester, admissionYear } = studentData;
    if (!fullName || !rollNumber || !email || !phoneNumber || !courseId || !semester || !admissionYear) {
      throw new Error('All mandatory fields must be provided');
    }

    if (db.students.some(s => s.email.toLowerCase() === email.toLowerCase().trim())) {
      throw new Error(`A student with email '${email}' already exists`);
    }
    if (db.students.some(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase().trim())) {
      throw new Error(`A student with roll number '${rollNumber}' already exists`);
    }

    const course = db.courses.find(c => c.id === courseId);
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      studentId: `STU-${admissionYear}-${String(db.students.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: studentData.dateOfBirth || '2004-01-01',
      gender: studentData.gender || 'Male',
      courseId,
      courseName: course?.courseName || 'Academic Course',
      courseCode: course?.courseCode || 'COURSE',
      semester: Number(semester),
      admissionYear: Number(admissionYear),
      address: studentData.address?.trim() || '',
      academicStatus: studentData.academicStatus || 'Active',
      attendancePercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.students.unshift(newStudent);
    db.logAction('Dean Office', 'admin', 'Student Enrolled', 'student', `Enrolled ${newStudent.fullName} (${newStudent.rollNumber})`, newStudent.id);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const student = db.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');

    if (updates.email && updates.email.toLowerCase() !== student.email.toLowerCase()) {
      if (db.students.some(s => s.id !== student.id && s.email.toLowerCase() === updates.email!.toLowerCase())) {
        throw new Error('Email already in use');
      }
      student.email = updates.email.toLowerCase();
    }

    if (updates.rollNumber && updates.rollNumber.toLowerCase() !== student.rollNumber.toLowerCase()) {
      if (db.students.some(s => s.id !== student.id && s.rollNumber.toLowerCase() === updates.rollNumber!.toLowerCase())) {
        throw new Error('Roll number already in use');
      }
      student.rollNumber = updates.rollNumber.toUpperCase();
    }

    if (updates.fullName) student.fullName = updates.fullName;
    if (updates.phoneNumber) student.phoneNumber = updates.phoneNumber;
    if (updates.dateOfBirth) student.dateOfBirth = updates.dateOfBirth;
    if (updates.gender) student.gender = updates.gender;
    if (updates.courseId) {
      student.courseId = updates.courseId;
      const c = db.courses.find(crs => crs.id === updates.courseId);
      if (c) {
        student.courseName = c.courseName;
        student.courseCode = c.courseCode;
      }
    }
    if (updates.semester) student.semester = Number(updates.semester);
    if (updates.admissionYear) student.admissionYear = Number(updates.admissionYear);
    if (updates.address !== undefined) student.address = updates.address;
    if (updates.academicStatus) student.academicStatus = updates.academicStatus;
    student.updatedAt = new Date().toISOString();

    db.logAction('Dean Office', 'admin', 'Student Updated', 'student', `Updated details for ${student.fullName}`, student.id);
    return student;
  },

  async deleteStudent(id: string): Promise<{ message: string; student: Student }> {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const idx = db.students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found');
    const removed = db.students.splice(idx, 1)[0];
    db.marks = db.marks.filter(m => m.studentId !== removed.id);
    db.attendanceRecords = db.attendanceRecords.filter(a => a.studentId !== removed.id);
    db.logAction('Dean Office', 'admin', 'Student Record Deleted', 'student', `Purged ${removed.fullName} (${removed.rollNumber})`, removed.id);
    return { message: 'Student deleted', student: removed };
  },

  getExportCsvUrl(filters?: StudentFilters): string {
    const list = db.students;
    const headers = [
      'Student ID', 'Full Name', 'Roll Number', 'Email Address', 'Phone Number',
      'Course Code', 'Course Name', 'Semester', 'Admission Year', 'Gender',
      'Attendance %', 'Status', 'Enrolled Date'
    ];
    const rows = list.map(s => [
      `"${s.studentId}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.rollNumber}"`,
      `"${s.email}"`,
      `"${s.phoneNumber}"`,
      `"${s.courseCode || ''}"`,
      `"${(s.courseName || '').replace(/"/g, '""')}"`,
      s.semester,
      s.admissionYear,
      `"${s.gender || ''}"`,
      `${s.attendancePercentage}%`,
      `"${s.academicStatus}"`,
      `"${s.createdAt.split('T')[0]}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
    return csvContent;
  },

  // Courses & Subjects
  async getCourses(): Promise<Course[]> {
    try {
      const res = await fetch('/api/courses', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    return db.courses.map(course => ({
      ...course,
      studentCount: db.students.filter(s => s.courseId === course.id).length,
      subjectCount: db.subjects.filter(s => s.courseId === course.id).length
    }));
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const { courseCode, courseName, department, durationYears, totalSemesters, description } = courseData;
    if (!courseCode || !courseName || !department) throw new Error('Code, Name, and Department required');

    const id = `course-${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newCourse: Course = {
      id,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      department: department.trim(),
      durationYears: Number(durationYears) || 3,
      totalSemesters: Number(totalSemesters) || 6,
      description: description || ''
    };
    db.courses.push(newCourse);
    db.logAction('Dean Office', 'admin', 'Course Added', 'course', `Created degree program ${newCourse.courseName}`);
    return newCourse;
  },

  async getSubjects(courseId?: string, semester?: number): Promise<Subject[]> {
    try {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (semester) params.append('semester', String(semester));
      const res = await fetch(`/api/subjects?${params.toString()}`, { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    let list = [...db.subjects];
    if (courseId) list = list.filter(s => s.courseId === courseId);
    if (semester) list = list.filter(s => s.semester === semester);
    return list;
  },

  async createSubject(subjectData: Partial<Subject>): Promise<Subject> {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subjectData),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const { courseId, subjectCode, subjectName, semester, credits, totalHours } = subjectData;
    if (!courseId || !subjectCode || !subjectName || !semester) throw new Error('Course, Code, Name, and Semester required');

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      courseId,
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      semester: Number(semester),
      credits: Number(credits) || 4,
      totalHours: Number(totalHours) || 60
    };
    db.subjects.push(newSub);
    db.logAction('Dean Office', 'admin', 'Subject Added', 'course', `Added subject ${newSub.subjectName}`);
    return newSub;
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    try {
      const res = await fetch('/api/teachers', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}
    return db.teachers;
  },

  // Attendance
  async getAttendanceSessions(filters?: { courseId?: string; subjectId?: string; date?: string }): Promise<AttendanceSession[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append('courseId', filters.courseId);
      if (filters?.subjectId) params.append('subjectId', filters.subjectId);
      if (filters?.date) params.append('date', filters.date);
      const res = await fetch(`/api/attendance/sessions?${params.toString()}`, { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    let sessions = [...db.attendanceSessions];
    if (filters?.courseId) sessions = sessions.filter(s => s.courseId === filters.courseId);
    if (filters?.subjectId) sessions = sessions.filter(s => s.subjectId === filters.subjectId);
    if (filters?.date) sessions = sessions.filter(s => s.sessionDate === filters.date);

    return sessions.map(sess => {
      const records = db.attendanceRecords.filter(r => r.sessionId === sess.id);
      const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      return {
        ...sess,
        totalStudentsCount: records.length,
        totalStudentsPresent: presentCount
      };
    }).reverse();
  },

  async createAttendanceSession(sessionData: Partial<AttendanceSession>): Promise<AttendanceSession> {
    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const { courseId, subjectId, sessionDate, sessionType, topicCovered } = sessionData;
    const course = db.courses.find(c => c.id === courseId);
    const subject = db.subjects.find(s => s.id === subjectId);

    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      courseId: courseId!,
      courseName: course?.courseName,
      courseCode: course?.courseCode,
      subjectId: subjectId!,
      subjectName: subject?.subjectName,
      subjectCode: subject?.subjectCode,
      teacherId: 'tch-sharma',
      teacherName: 'Prof. Rajesh Sharma',
      sessionDate: sessionDate || new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      sessionType: sessionType || 'Lecture',
      topicCovered: topicCovered || '',
      createdAt: new Date().toISOString()
    };
    db.attendanceSessions.unshift(newSession);
    db.logAction('Prof. Rajesh Sharma', 'teacher', 'Attendance Session Created', 'attendance', `Created session for ${subject?.subjectName}`, newSession.id);
    return newSession;
  },

  async markAttendance(sessionId: string, records: { studentId: string; status: 'Present' | 'Absent' | 'Late'; remarks?: string }[]): Promise<{ message: string; count: number }> {
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionId, records }),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const session = db.attendanceSessions.find(s => s.id === sessionId);
    let count = 0;
    for (const item of records) {
      const student = db.students.find(s => s.id === item.studentId);
      if (!student) continue;

      const existingIdx = db.attendanceRecords.findIndex(r => r.sessionId === sessionId && r.studentId === item.studentId);
      if (existingIdx >= 0) {
        db.attendanceRecords[existingIdx].status = item.status;
      } else {
        db.attendanceRecords.push({
          id: `att-rec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          sessionId,
          studentId: item.studentId,
          studentName: student.fullName,
          rollNumber: student.rollNumber,
          status: item.status,
          sessionDate: session?.sessionDate,
          subjectName: session?.subjectName,
          createdAt: new Date().toISOString()
        });
      }
      db.refreshStudentAttendanceStats(student.id);
      count++;
    }
    db.logAction('Faculty Evaluator', 'teacher', 'Attendance Recorded', 'attendance', `Marked attendance for ${count} students`, sessionId);
    return { message: 'Attendance marked successfully', count };
  },

  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    return db.attendanceRecords.filter(r => r.studentId === studentId).reverse();
  },

  // Marks
  async getMarks(filters?: { studentId?: string; subjectId?: string }): Promise<Mark[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.subjectId) params.append('subjectId', filters.subjectId);
      const res = await fetch(`/api/marks?${params.toString()}`, { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    let list = [...db.marks];
    if (filters?.studentId) list = list.filter(m => m.studentId === filters.studentId);
    if (filters?.subjectId) list = list.filter(m => m.subjectId === filters.subjectId);
    return list.reverse();
  },

  async createMark(markData: Partial<Mark>): Promise<Mark> {
    try {
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(markData),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const { studentId, subjectId, assessmentName, maxMarks, marksObtained, examDate, remarks } = markData;
    const max = Number(maxMarks);
    const obtained = Number(marksObtained);

    if (isNaN(max) || max <= 0) throw new Error('Maximum marks must be positive');
    if (isNaN(obtained) || obtained < 0) throw new Error('Marks obtained cannot be negative');
    if (obtained > max) throw new Error(`Marks obtained (${obtained}) cannot exceed maximum marks (${max})`);

    const student = db.students.find(s => s.id === studentId);
    const subject = db.subjects.find(s => s.id === subjectId);
    const percentage = Math.round((obtained / max) * 100);
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

    const newMark: Mark = {
      id: `mrk-${Date.now()}`,
      studentId: studentId!,
      studentName: student?.fullName,
      rollNumber: student?.rollNumber,
      courseName: student?.courseName,
      subjectId: subjectId!,
      subjectName: subject?.subjectName,
      subjectCode: subject?.subjectCode,
      assessmentName: assessmentName!,
      maxMarks: max,
      marksObtained: obtained,
      percentage,
      grade,
      examDate: examDate || new Date().toISOString().split('T')[0],
      enteredBy: 'Faculty Evaluator',
      remarks: remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.marks.unshift(newMark);
    db.logAction('Faculty Evaluator', 'teacher', 'Marks Recorded', 'mark', `Recorded ${assessmentName} for ${student?.fullName}`, newMark.id);
    return newMark;
  },

  async deleteMark(id: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`/api/marks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const idx = db.marks.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Mark not found');
    const removed = db.marks.splice(idx, 1)[0];
    db.logAction('Faculty Evaluator', 'teacher', 'Marks Removed', 'mark', `Deleted mark entry for ${removed.studentName}`);
    return { message: 'Mark deleted successfully' };
  },

  async getStudentMarks(studentId: string): Promise<Mark[]> {
    return db.marks.filter(m => m.studentId === studentId);
  },

  // Correction Requests
  async getCorrectionRequests(): Promise<CorrectionRequest[]> {
    try {
      const res = await fetch('/api/correction-requests', { headers: getAuthHeaders() });
      if (isJsonResponse(res)) return await res.json();
    } catch {}
    return db.correctionRequests;
  },

  async createCorrectionRequest(data: { studentId?: string; fieldName: string; currentValue: string; requestedValue: string; reason: string }): Promise<CorrectionRequest> {
    try {
      const res = await fetch('/api/correction-requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const student = db.students.find(s => s.id === data.studentId) || db.students[0];
    const req: CorrectionRequest = {
      id: `cr-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      rollNumber: student.rollNumber,
      fieldName: data.fieldName,
      currentValue: data.currentValue,
      requestedValue: data.requestedValue,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.correctionRequests.unshift(req);
    db.logAction(student.fullName, 'student', 'Correction Requested', 'student', `Requested change to ${data.fieldName}`);
    return req;
  },

  async updateCorrectionRequest(id: string, status: 'Approved' | 'Rejected', adminNotes?: string): Promise<CorrectionRequest> {
    try {
      const res = await fetch(`/api/correction-requests/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNotes }),
      });
      if (isJsonResponse(res)) return await res.json();
    } catch {}

    const req = db.correctionRequests.find(r => r.id === id);
    if (!req) throw new Error('Request not found');
    req.status = status;
    if (adminNotes) req.adminNotes = adminNotes;
    req.updatedAt = new Date().toISOString();

    if (status === 'Approved') {
      const student = db.students.find(s => s.id === req.studentId);
      if (student) {
        if (req.fieldName === 'phone_number') student.phoneNumber = req.requestedValue;
        if (req.fieldName === 'address') student.address = req.requestedValue;
        if (req.fieldName === 'fullName') student.fullName = req.requestedValue;
      }
    }
    db.logAction('Dean Office', 'admin', `Correction ${status}`, 'student', `Marked correction as ${status}`);
    return req;
  },

  // Users & Activity Logs
  async getUsers(): Promise<UserProfile[]> {
    return db.profiles;
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.activityLogs;
  },

  async getSystemHealth(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL Relational / Local In-Memory Active',
      supabaseConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')),
      studentsCount: db.students.length,
      coursesCount: db.courses.length,
      attendanceSessionsCount: db.attendanceSessions.length
    };
  }
};
