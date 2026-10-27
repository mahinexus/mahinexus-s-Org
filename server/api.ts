/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import { Student, Mark, AttendanceRecord, AttendanceSession, UserRole, Course, Subject, CorrectionRequest } from '../src/types/index.ts';

export const apiRouter = Router();

// Middleware: Extract mock/real session from headers
// Frontend passes 'x-user-role' and 'x-user-id' in demo or bearer tokens
const authenticateUser = (req: Request, res: Response, next: Function) => {
  const roleHeader = req.headers['x-user-role'] as UserRole | undefined;
  const userIdHeader = req.headers['x-user-id'] as string | undefined;

  let currentUser = db.profiles[0]; // Default fallback to admin in dev if not set
  if (roleHeader) {
    const found = db.profiles.find(p => p.role === roleHeader && (!userIdHeader || p.id === userIdHeader));
    if (found) {
      currentUser = found;
    }
  }

  (req as any).user = currentUser;
  next();
};

apiRouter.use(authenticateUser);

// ----------------------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email
  const user = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // If role filter requested
  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account exists but role is ${user.role}, not ${role}` });
  }

  db.logAction(user.fullName, user.role, 'User Signed In', 'auth', `Signed in from ${req.ip || '127.0.0.1'}`);

  return res.json({
    user,
    token: `demo-jwt-token-${user.id}-${Date.now()}`
  });
});

apiRouter.post('/auth/demo-login', (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles: UserRole[] = ['admin', 'teacher', 'student'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (admin, teacher, student)' });
  }

  const targetUser = db.profiles.find(p => p.role === role);
  if (!targetUser) {
    return res.status(404).json({ error: `Demo user for role ${role} not found` });
  }

  db.logAction(targetUser.fullName, targetUser.role, 'Demo Session Switched', 'auth', `Switched active role to ${role}`);

  return res.json({
    user: targetUser,
    token: `demo-jwt-token-${targetUser.id}`
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
});

// ----------------------------------------------------------------------------
// 2. DASHBOARD ENDPOINTS
// ----------------------------------------------------------------------------
apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json(stats);
});

apiRouter.get('/dashboard/teacher-stats', (req: Request, res: Response) => {
  const user = (req as any).user;
  const teacher = db.teachers.find(t => t.userId === user.id || t.email === user.email) || db.teachers[0];

  const assignedSubjects = db.subjects.filter(s => teacher.assignedSubjects?.includes(s.id));
  const teacherSessions = db.attendanceSessions.filter(s => s.teacherId === teacher.id);
  
  // Assigned courses
  const assignedCourses = db.courses.filter(c => teacher.assignedCourses?.includes(c.id));

  // Count distinct students in assigned courses
  const assignedCourseIds = assignedCourses.map(c => c.id);
  const studentsInClasses = db.students.filter(s => assignedCourseIds.includes(s.courseId));

  res.json({
    teacher,
    assignedSubjects,
    assignedCourses,
    totalSessionsConducted: teacherSessions.length,
    studentsUnderGuidance: studentsInClasses.length,
    recentSessions: teacherSessions.slice(-4).reverse()
  });
});

apiRouter.get('/dashboard/student-stats', (req: Request, res: Response) => {
  const user = (req as any).user;
  // Find linked student record
  let student = db.students.find(s => s.userId === user.id || s.email === user.email);
  if (!student) {
    student = db.students[0]; // Fallback to first student for demo
  }

  db.refreshStudentAttendanceStats(student.id);

  const studentMarks = db.marks.filter(m => m.studentId === student.id);
  const attendanceHistory = db.attendanceRecords.filter(r => r.studentId === student.id);
  const course = db.courses.find(c => c.id === student?.courseId);
  const semesterSubjects = db.subjects.filter(s => s.courseId === student?.courseId && s.semester === student?.semester);

  // Subject-wise attendance calculation
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

  // GPA / Average Marks
  const avgMarksPercentage = studentMarks.length > 0
    ? Math.round(studentMarks.reduce((acc, m) => acc + (m.percentage || 0), 0) / studentMarks.length)
    : 88;

  res.json({
    student,
    course,
    semesterSubjects,
    attendanceHistory: attendanceHistory.slice(-6).reverse(),
    subjectAttendance,
    studentMarks,
    avgMarksPercentage
  });
});

// ----------------------------------------------------------------------------
// 3. STUDENTS CRUD & EXPORT
// ----------------------------------------------------------------------------
apiRouter.get('/students', (req: Request, res: Response) => {
  const { search, courseId, semester, academicStatus, sortBy, sortOrder, page, limit } = req.query;

  const result = db.getStudents({
    search: search as string,
    courseId: courseId as string,
    semester: semester as string,
    academicStatus: academicStatus as string,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10
  });

  res.json(result);
});

apiRouter.get('/students/:id', (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.id || s.studentId === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found' });
  }

  db.refreshStudentAttendanceStats(student.id);

  // Get marks and attendance records
  const marks = db.marks.filter(m => m.studentId === student.id);
  const attendance = db.attendanceRecords.filter(a => a.studentId === student.id);
  const course = db.courses.find(c => c.id === student.courseId);

  res.json({
    student,
    course,
    marks,
    attendance
  });
});

apiRouter.post('/students', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can create student accounts' });
  }

  const {
    fullName,
    rollNumber,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    courseId,
    semester,
    admissionYear,
    address,
    academicStatus
  } = req.body;

  // Validation
  if (!fullName || !rollNumber || !email || !phoneNumber || !courseId || !semester || !admissionYear) {
    return res.status(400).json({ error: 'All mandatory fields (Full Name, Roll Number, Email, Phone, Course, Semester, Admission Year) must be provided' });
  }

  // Duplicate Check
  const emailExists = db.students.some(s => s.email.toLowerCase() === email.toLowerCase().trim());
  if (emailExists) {
    return res.status(409).json({ error: `A student with email '${email}' already exists` });
  }

  const rollExists = db.students.some(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase().trim());
  if (rollExists) {
    return res.status(409).json({ error: `A student with roll number '${rollNumber}' already exists` });
  }

  const course = db.courses.find(c => c.id === courseId);
  const newId = `stu-${Date.now()}`;
  const studentSeq = String(db.students.length + 1).padStart(3, '0');
  const studentId = `STU-${admissionYear}-${studentSeq}`;

  const newStudent: Student = {
    id: newId,
    studentId,
    fullName: fullName.trim(),
    rollNumber: rollNumber.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    phoneNumber: phoneNumber.trim(),
    dateOfBirth: dateOfBirth || '2004-01-01',
    gender: gender || 'Other',
    courseId,
    courseName: course?.courseName || 'College Academic Program',
    courseCode: course?.courseCode || 'COURSE',
    semester: Number(semester),
    admissionYear: Number(admissionYear),
    address: address?.trim() || '',
    academicStatus: academicStatus || 'Active',
    attendancePercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.students.unshift(newStudent);
  db.logAction(user?.fullName || 'Administrator', 'admin', 'Student Enrolled', 'student', `Added new student ${newStudent.fullName} (${newStudent.rollNumber})`, newStudent.id);

  res.status(201).json(newStudent);
});

apiRouter.put('/students/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student' && user.studentId !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify other students records' });
  }

  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const {
    fullName,
    rollNumber,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    courseId,
    semester,
    admissionYear,
    address,
    academicStatus
  } = req.body;

  // Uniqueness check for updated email/roll
  if (email && email.toLowerCase() !== student.email.toLowerCase()) {
    const exists = db.students.some(s => s.id !== student.id && s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'Email already in use by another student' });
    }
    student.email = email.toLowerCase().trim();
  }

  if (rollNumber && rollNumber.toLowerCase() !== student.rollNumber.toLowerCase()) {
    const exists = db.students.some(s => s.id !== student.id && s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'Roll number already in use by another student' });
    }
    student.rollNumber = rollNumber.toUpperCase().trim();
  }

  if (fullName) student.fullName = fullName.trim();
  if (phoneNumber) student.phoneNumber = phoneNumber.trim();
  if (dateOfBirth) student.dateOfBirth = dateOfBirth;
  if (gender) student.gender = gender;
  if (courseId) {
    student.courseId = courseId;
    const course = db.courses.find(c => c.id === courseId);
    if (course) {
      student.courseName = course.courseName;
      student.courseCode = course.courseCode;
    }
  }
  if (semester !== undefined) student.semester = Number(semester);
  if (admissionYear !== undefined) student.admissionYear = Number(admissionYear);
  if (address !== undefined) student.address = address.trim();
  if (academicStatus) student.academicStatus = academicStatus;
  student.updatedAt = new Date().toISOString();

  db.logAction(user?.fullName || 'User', user?.role || 'admin', 'Student Updated', 'student', `Updated details for ${student.fullName} (${student.rollNumber})`, student.id);

  res.json(student);
});

apiRouter.delete('/students/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can delete student records' });
  }

  const index = db.students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const removed = db.students.splice(index, 1)[0];
  // Remove related marks & attendance records
  db.marks = db.marks.filter(m => m.studentId !== removed.id);
  db.attendanceRecords = db.attendanceRecords.filter(a => a.studentId !== removed.id);

  db.logAction(user?.fullName || 'Administrator', 'admin', 'Student Record Deleted', 'student', `Removed student record ${removed.fullName} (${removed.rollNumber})`, removed.id);

  res.json({ message: 'Student record successfully deleted', student: removed });
});

// CSV Export Endpoint
apiRouter.get('/students-export/csv', (req: Request, res: Response) => {
  const { courseId, semester, academicStatus } = req.query;

  let list = [...db.students];
  if (courseId) list = list.filter(s => s.courseId === courseId);
  if (semester) list = list.filter(s => s.semester === Number(semester));
  if (academicStatus && academicStatus !== 'All') list = list.filter(s => s.academicStatus === academicStatus);

  const headers = [
    'Student ID',
    'Full Name',
    'Roll Number',
    'Email Address',
    'Phone Number',
    'Course Code',
    'Course Name',
    'Semester',
    'Admission Year',
    'Gender',
    'Attendance %',
    'Status',
    'Enrolled Date'
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

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="campuscore_students_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csvContent);
});

// ----------------------------------------------------------------------------
// 4. ATTENDANCE SESSIONS & RECORDS
// ----------------------------------------------------------------------------
apiRouter.get('/attendance/sessions', (req: Request, res: Response) => {
  const { courseId, subjectId, date } = req.query;
  let sessions = [...db.attendanceSessions];

  if (courseId) sessions = sessions.filter(s => s.courseId === courseId);
  if (subjectId) sessions = sessions.filter(s => s.subjectId === subjectId);
  if (date) sessions = sessions.filter(s => s.sessionDate === date);

  // Attach record counts
  const enriched = sessions.map(sess => {
    const records = db.attendanceRecords.filter(r => r.sessionId === sess.id);
    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    return {
      ...sess,
      totalStudentsCount: records.length,
      totalStudentsPresent: presentCount
    };
  });

  res.json(enriched.reverse());
});

apiRouter.post('/attendance/sessions', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student') {
    return res.status(403).json({ error: 'Students cannot create attendance sessions' });
  }

  const { courseId, subjectId, sessionDate, startTime, endTime, sessionType, topicCovered } = req.body;
  if (!courseId || !subjectId || !sessionDate) {
    return res.status(400).json({ error: 'Course, Subject, and Session Date are required' });
  }

  const course = db.courses.find(c => c.id === courseId);
  const subject = db.subjects.find(s => s.id === subjectId);

  const newSession: AttendanceSession = {
    id: `sess-${Date.now()}`,
    courseId,
    courseName: course?.courseName,
    courseCode: course?.courseCode,
    subjectId,
    subjectName: subject?.subjectName,
    subjectCode: subject?.subjectCode,
    teacherId: user?.teacherId || user?.id || 'tch-system',
    teacherName: user?.fullName || 'Faculty Member',
    sessionDate,
    startTime: startTime || '10:00',
    endTime: endTime || '11:00',
    sessionType: sessionType || 'Lecture',
    topicCovered: topicCovered?.trim() || '',
    createdAt: new Date().toISOString()
  };

  db.attendanceSessions.unshift(newSession);
  db.logAction(user?.fullName || 'Faculty', user?.role || 'teacher', 'Attendance Session Created', 'attendance', `Created session for ${subject?.subjectName} on ${sessionDate}`, newSession.id);

  res.status(201).json(newSession);
});

apiRouter.get('/attendance/sessions/:id/records', (req: Request, res: Response) => {
  const records = db.attendanceRecords.filter(r => r.sessionId === req.params.id);
  res.json(records);
});

// Bulk Attendance Marking (Present / Absent / Late) with duplicate prevention
apiRouter.post('/attendance/mark', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student') {
    return res.status(403).json({ error: 'Students are not authorized to mark attendance' });
  }

  const { sessionId, records } = req.body as {
    sessionId: string;
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late'; remarks?: string }[];
  };

  if (!sessionId || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Valid sessionId and records array are required' });
  }

  const session = db.attendanceSessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Attendance session not found' });
  }

  let insertedOrUpdated = 0;
  for (const item of records) {
    const student = db.students.find(s => s.id === item.studentId);
    if (!student) continue;

    const existingIndex = db.attendanceRecords.findIndex(
      r => r.sessionId === sessionId && r.studentId === item.studentId
    );

    if (existingIndex >= 0) {
      // Update existing record
      db.attendanceRecords[existingIndex].status = item.status;
      db.attendanceRecords[existingIndex].remarks = item.remarks || db.attendanceRecords[existingIndex].remarks;
    } else {
      // Insert new unique record
      db.attendanceRecords.push({
        id: `att-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        studentId: item.studentId,
        studentName: student.fullName,
        rollNumber: student.rollNumber,
        status: item.status,
        remarks: item.remarks,
        sessionDate: session.sessionDate,
        subjectName: session.subjectName,
        createdAt: new Date().toISOString()
      });
    }

    db.refreshStudentAttendanceStats(student.id);
    insertedOrUpdated++;
  }

  db.logAction(
    user?.fullName || 'Faculty Member',
    user?.role || 'teacher',
    'Attendance Recorded',
    'attendance',
    `Updated attendance for ${insertedOrUpdated} students in session ${session.subjectName || sessionId}`,
    sessionId
  );

  res.json({
    message: `Attendance marked successfully for ${insertedOrUpdated} students`,
    count: insertedOrUpdated
  });
});

apiRouter.get('/attendance/student/:studentId', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student' && user.studentId && user.studentId !== req.params.studentId) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own attendance' });
  }

  const records = db.attendanceRecords.filter(r => r.studentId === req.params.studentId);
  res.json(records.reverse());
});

// ----------------------------------------------------------------------------
// 5. MARKS & ACADEMIC EVALUATION
// ----------------------------------------------------------------------------
const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

apiRouter.get('/marks', (req: Request, res: Response) => {
  const { studentId, subjectId } = req.query;
  let list = [...db.marks];

  if (studentId) list = list.filter(m => m.studentId === studentId);
  if (subjectId) list = list.filter(m => m.subjectId === subjectId);

  res.json(list.reverse());
});

apiRouter.post('/marks', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student') {
    return res.status(403).json({ error: 'Students cannot enter or modify marks' });
  }

  const { studentId, subjectId, assessmentName, maxMarks, marksObtained, examDate, remarks } = req.body;

  if (!studentId || !subjectId || !assessmentName || maxMarks === undefined || marksObtained === undefined) {
    return res.status(400).json({ error: 'Student, Subject, Assessment Name, Max Marks, and Marks Obtained are required' });
  }

  const max = Number(maxMarks);
  const obtained = Number(marksObtained);

  // Strict Validation: marks must not be negative or greater than maxMarks
  if (isNaN(max) || max <= 0) {
    return res.status(400).json({ error: 'Maximum marks must be a positive number' });
  }
  if (isNaN(obtained) || obtained < 0) {
    return res.status(400).json({ error: 'Marks obtained cannot be negative' });
  }
  if (obtained > max) {
    return res.status(400).json({ error: `Marks obtained (${obtained}) cannot exceed maximum marks (${max})` });
  }

  const student = db.students.find(s => s.id === studentId);
  const subject = db.subjects.find(s => s.id === subjectId);
  const percentage = Math.round((obtained / max) * 100);
  const grade = calculateGrade(percentage);

  const newMark: Mark = {
    id: `mrk-${Date.now()}`,
    studentId,
    studentName: student?.fullName,
    rollNumber: student?.rollNumber,
    courseName: student?.courseName,
    subjectId,
    subjectName: subject?.subjectName,
    subjectCode: subject?.subjectCode,
    assessmentName: assessmentName.trim(),
    maxMarks: max,
    marksObtained: obtained,
    percentage,
    grade,
    examDate: examDate || new Date().toISOString().split('T')[0],
    enteredBy: user?.fullName || 'Faculty Evaluator',
    remarks: remarks?.trim() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.marks.unshift(newMark);
  db.logAction(user?.fullName || 'Faculty', user?.role || 'teacher', 'Marks Recorded', 'mark', `Recorded ${assessmentName} for ${student?.fullName}: ${obtained}/${max} (${grade})`, newMark.id);

  res.status(201).json(newMark);
});

apiRouter.delete('/marks/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const idx = db.marks.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Mark entry not found' });
  }

  const removed = db.marks.splice(idx, 1)[0];
  db.logAction(user?.fullName || 'Faculty', user?.role || 'teacher', 'Marks Removed', 'mark', `Deleted mark entry for ${removed.studentName} (${removed.subjectName})`, removed.id);

  res.json({ message: 'Mark deleted successfully' });
});

apiRouter.get('/marks/student/:studentId', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student' && user.studentId && user.studentId !== req.params.studentId) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own marks' });
  }

  const marks = db.marks.filter(m => m.studentId === req.params.studentId);
  res.json(marks);
});

// ----------------------------------------------------------------------------
// 6. COURSES & SUBJECTS
// ----------------------------------------------------------------------------
apiRouter.get('/courses', (req: Request, res: Response) => {
  const enriched = db.courses.map(course => {
    const studentCount = db.students.filter(s => s.courseId === course.id).length;
    const subjectCount = db.subjects.filter(s => s.courseId === course.id).length;
    return {
      ...course,
      studentCount,
      subjectCount
    };
  });
  res.json(enriched);
});

apiRouter.post('/courses', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can create courses' });
  }

  const { courseCode, courseName, department, durationYears, totalSemesters, description } = req.body;
  if (!courseCode || !courseName || !department) {
    return res.status(400).json({ error: 'Course Code, Course Name, and Department are required' });
  }

  const id = `course-${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (db.courses.some(c => c.courseCode.toLowerCase() === courseCode.toLowerCase())) {
    return res.status(409).json({ error: 'Course code already exists' });
  }

  const newCourse: Course = {
    id,
    courseCode: courseCode.trim().toUpperCase(),
    courseName: courseName.trim(),
    department: department.trim(),
    durationYears: Number(durationYears) || 3,
    totalSemesters: Number(totalSemesters) || 6,
    description: description?.trim() || ''
  };

  db.courses.push(newCourse);
  db.logAction(user?.fullName || 'Admin', 'admin', 'Course Added', 'course', `Created new curriculum: ${newCourse.courseName} (${newCourse.courseCode})`, newCourse.id);

  res.status(201).json(newCourse);
});

apiRouter.get('/subjects', (req: Request, res: Response) => {
  const { courseId, semester } = req.query;
  let list = [...db.subjects];

  if (courseId) list = list.filter(s => s.courseId === courseId);
  if (semester) list = list.filter(s => s.semester === Number(semester));

  const enriched = list.map(sub => {
    const course = db.courses.find(c => c.id === sub.courseId);
    return {
      ...sub,
      courseName: course?.courseName,
      courseCode: course?.courseCode
    };
  });

  res.json(enriched);
});

apiRouter.post('/subjects', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can add subjects' });
  }

  const { courseId, subjectCode, subjectName, semester, credits, totalHours } = req.body;
  if (!courseId || !subjectCode || !subjectName || !semester) {
    return res.status(400).json({ error: 'Course, Subject Code, Subject Name, and Semester are required' });
  }

  const id = `sub-${subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const newSubject: Subject = {
    id,
    courseId,
    subjectCode: subjectCode.trim().toUpperCase(),
    subjectName: subjectName.trim(),
    semester: Number(semester),
    credits: Number(credits) || 4,
    totalHours: Number(totalHours) || 60
  };

  db.subjects.push(newSubject);
  db.logAction(user?.fullName || 'Admin', 'admin', 'Subject Added', 'course', `Added subject ${newSubject.subjectName} (${newSubject.subjectCode})`, newSubject.id);

  res.status(201).json(newSubject);
});

// ----------------------------------------------------------------------------
// 7. TEACHERS & USERS
// ----------------------------------------------------------------------------
apiRouter.get('/teachers', (req: Request, res: Response) => {
  res.json(db.teachers);
});

apiRouter.get('/users', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can view user list' });
  }
  res.json(db.profiles);
});

// ----------------------------------------------------------------------------
// 8. CORRECTION REQUESTS
// ----------------------------------------------------------------------------
apiRouter.get('/correction-requests', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role === 'student' && user.studentId) {
    return res.json(db.correctionRequests.filter(c => c.studentId === user.studentId));
  }
  res.json(db.correctionRequests);
});

apiRouter.post('/correction-requests', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { studentId, fieldName, currentValue, requestedValue, reason } = req.body;

  if (!fieldName || !requestedValue || !reason) {
    return res.status(400).json({ error: 'Field name, requested value, and reason are required' });
  }

  const student = db.students.find(s => s.id === studentId || s.id === user?.studentId) || db.students[0];

  const request: CorrectionRequest = {
    id: `cr-${Date.now()}`,
    studentId: student.id,
    studentName: student.fullName,
    rollNumber: student.rollNumber,
    fieldName,
    currentValue: currentValue || 'Current record',
    requestedValue: requestedValue.trim(),
    reason: reason.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.correctionRequests.unshift(request);
  db.logAction(student.fullName, 'student', 'Correction Requested', 'student', `Requested change to ${fieldName}: "${requestedValue}"`, request.id);

  res.status(201).json(request);
});

apiRouter.put('/correction-requests/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can approve or reject correction requests' });
  }

  const { status, adminNotes } = req.body;
  const request = db.correctionRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  request.status = status;
  if (adminNotes) request.adminNotes = adminNotes;
  request.updatedAt = new Date().toISOString();

  // If approved, update student
  if (status === 'Approved') {
    const student = db.students.find(s => s.id === request.studentId);
    if (student) {
      if (request.fieldName === 'phone_number') student.phoneNumber = request.requestedValue;
      if (request.fieldName === 'address') student.address = request.requestedValue;
      if (request.fieldName === 'fullName') student.fullName = request.requestedValue;
    }
  }

  db.logAction(user?.fullName || 'Admin', 'admin', `Correction ${status}`, 'student', `Marked correction for ${request.studentName} as ${status}`, request.id);

  res.json(request);
});

// ----------------------------------------------------------------------------
// 9. ACTIVITY LOGS
// ----------------------------------------------------------------------------
apiRouter.get('/activity-logs', (req: Request, res: Response) => {
  res.json(db.activityLogs);
});

// ----------------------------------------------------------------------------
// 10. SYSTEM UTILITIES & HEALTH
// ----------------------------------------------------------------------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL Relational / In-Memory Mock Active',
    supabaseConnected: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')),
    studentsCount: db.students.length,
    coursesCount: db.courses.length,
    attendanceSessionsCount: db.attendanceSessions.length
  });
});
