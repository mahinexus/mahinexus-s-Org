/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  Student,
  Teacher,
  Course,
  Subject,
  AttendanceSession,
  AttendanceRecord,
  Mark,
  CorrectionRequest,
  ActivityLog,
  DashboardStats,
  StudentFilters
} from '../src/types/index.ts';

// In-memory relational store with seed data
class DatabaseStore {
  public profiles: UserProfile[] = [];
  public courses: Course[] = [];
  public subjects: Subject[] = [];
  public teachers: Teacher[] = [];
  public students: Student[] = [];
  public attendanceSessions: AttendanceSession[] = [];
  public attendanceRecords: AttendanceRecord[] = [];
  public marks: Mark[] = [];
  public correctionRequests: CorrectionRequest[] = [];
  public activityLogs: ActivityLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Courses
    this.courses = [
      {
        id: 'course-bscit',
        courseCode: 'BSCIT',
        courseName: 'B.Sc. Information Technology',
        department: 'Department of Information Technology',
        durationYears: 3,
        totalSemesters: 6,
        description: 'Comprehensive program covering software engineering, database systems, networking, and cloud applications.'
      },
      {
        id: 'course-btech-cs',
        courseCode: 'BTECH-CS',
        courseName: 'B.Tech Computer Science & Engineering',
        department: 'Department of Computer Science',
        durationYears: 4,
        totalSemesters: 8,
        description: 'Rigorous engineering program focusing on computer architecture, algorithms, distributed systems, and AI.'
      },
      {
        id: 'course-bca',
        courseCode: 'BCA',
        courseName: 'Bachelor of Computer Applications',
        department: 'Department of Computing & Applications',
        durationYears: 3,
        totalSemesters: 6,
        description: 'Industry-oriented application development curriculum emphasizing modern web stacks and systems administration.'
      },
      {
        id: 'course-bba',
        courseCode: 'BBA',
        courseName: 'Bachelor of Business Administration',
        department: 'School of Business Management',
        durationYears: 3,
        totalSemesters: 6,
        description: 'Interdisciplinary study of business operations, organizational leadership, economics, and analytics.'
      }
    ];

    // 2. Subjects
    this.subjects = [
      // BSCIT
      { id: 'sub-it-dsa', courseId: 'course-bscit', subjectCode: 'IT301', subjectName: 'Data Structures & Algorithms', semester: 3, credits: 4, totalHours: 60 },
      { id: 'sub-it-dbms', courseId: 'course-bscit', subjectCode: 'IT401', subjectName: 'Database Management Systems', semester: 4, credits: 4, totalHours: 60 },
      { id: 'sub-it-web', courseId: 'course-bscit', subjectCode: 'IT501', subjectName: 'Full-Stack Web Development', semester: 5, credits: 4, totalHours: 60 },
      { id: 'sub-it-cloud', courseId: 'course-bscit', subjectCode: 'IT502', subjectName: 'Cloud Computing & DevOps', semester: 5, credits: 3, totalHours: 45 },
      { id: 'sub-it-net', courseId: 'course-bscit', subjectCode: 'IT503', subjectName: 'Network Security & Cryptography', semester: 5, credits: 4, totalHours: 60 },
      { id: 'sub-it-capstone', courseId: 'course-bscit', subjectCode: 'IT601', subjectName: 'Senior Capstone Project', semester: 6, credits: 6, totalHours: 90 },

      // BTECH-CS
      { id: 'sub-cs-os', courseId: 'course-btech-cs', subjectCode: 'CS402', subjectName: 'Operating Systems & Concurrency', semester: 4, credits: 4, totalHours: 60 },
      { id: 'sub-cs-algo', courseId: 'course-btech-cs', subjectCode: 'CS501', subjectName: 'Advanced Algorithm Design', semester: 5, credits: 4, totalHours: 60 },
      { id: 'sub-cs-ai', courseId: 'course-btech-cs', subjectCode: 'CS601', subjectName: 'Artificial Intelligence & Machine Learning', semester: 6, credits: 4, totalHours: 60 },
      { id: 'sub-cs-se', courseId: 'course-btech-cs', subjectCode: 'CS502', subjectName: 'Software Engineering & Microservices', semester: 5, credits: 3, totalHours: 45 },

      // BCA
      { id: 'sub-bca-py', courseId: 'course-bca', subjectCode: 'BCA301', subjectName: 'Python for Enterprise Computing', semester: 3, credits: 4, totalHours: 60 },
      { id: 'sub-bca-sql', courseId: 'course-bca', subjectCode: 'BCA401', subjectName: 'Relational Database Engineering', semester: 4, credits: 4, totalHours: 60 },
      { id: 'sub-bca-mobile', courseId: 'course-bca', subjectCode: 'BCA501', subjectName: 'Mobile Application Architecture', semester: 5, credits: 4, totalHours: 60 },

      // BBA
      { id: 'sub-bba-mgt', courseId: 'course-bba', subjectCode: 'BBA301', subjectName: 'Financial Analytics & Accounting', semester: 3, credits: 3, totalHours: 45 },
      { id: 'sub-bba-mk', courseId: 'course-bba', subjectCode: 'BBA401', subjectName: 'Digital Strategy & Marketing', semester: 4, credits: 3, totalHours: 45 }
    ];

    // 3. Profiles (Admin, Teachers, Students)
    this.profiles = [
      {
        id: 'usr-admin-1',
        email: 'admin@college.edu',
        fullName: 'Dr. Eleanor Vance',
        role: 'admin',
        phone: '+1 (555) 234-5678',
        createdAt: '2024-01-10T08:00:00Z'
      },
      {
        id: 'usr-teacher-1',
        email: 'prof.sharma@college.edu',
        fullName: 'Prof. Rajesh Sharma',
        role: 'teacher',
        teacherId: 'tch-sharma',
        phone: '+1 (555) 345-6789',
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: 'usr-teacher-2',
        email: 'dr.patel@college.edu',
        fullName: 'Dr. Ananya Patel',
        role: 'teacher',
        teacherId: 'tch-patel',
        phone: '+1 (555) 456-7890',
        createdAt: '2024-02-01T08:00:00Z'
      },
      {
        id: 'usr-student-1',
        email: 'arjun.sharma@student.college.edu',
        fullName: 'Arjun Sharma',
        role: 'student',
        studentId: 'stu-1',
        phone: '+1 (555) 678-9012',
        createdAt: '2024-08-01T09:00:00Z'
      },
      {
        id: 'usr-student-2',
        email: 'priya.verma@student.college.edu',
        fullName: 'Priya Verma',
        role: 'student',
        studentId: 'stu-2',
        phone: '+1 (555) 789-0123',
        createdAt: '2024-08-01T09:00:00Z'
      }
    ];

    // 4. Teachers
    this.teachers = [
      {
        id: 'tch-sharma',
        userId: 'usr-teacher-1',
        fullName: 'Prof. Rajesh Sharma',
        email: 'prof.sharma@college.edu',
        employeeCode: 'EMP-IT-014',
        department: 'Information Technology',
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Computer Engineering, M.Tech',
        joiningDate: '2020-07-15',
        status: 'Active',
        assignedCourses: ['course-bscit', 'course-bca'],
        assignedSubjects: ['sub-it-web', 'sub-it-cloud', 'sub-bca-mobile'],
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: 'tch-patel',
        userId: 'usr-teacher-2',
        fullName: 'Dr. Ananya Patel',
        email: 'dr.patel@college.edu',
        employeeCode: 'EMP-CS-009',
        department: 'Computer Science',
        designation: 'Professor & Head',
        qualification: 'Ph.D. Distributed Systems, MIT Alum',
        joiningDate: '2018-08-01',
        status: 'Active',
        assignedCourses: ['course-btech-cs', 'course-bscit'],
        assignedSubjects: ['sub-cs-ai', 'sub-cs-algo', 'sub-it-dsa'],
        createdAt: '2024-02-01T08:00:00Z'
      },
      {
        id: 'tch-morrison',
        userId: 'usr-teacher-3',
        fullName: 'Dr. David Morrison',
        email: 'david.morrison@college.edu',
        employeeCode: 'EMP-CS-022',
        department: 'Computer Science',
        designation: 'Assistant Professor',
        qualification: 'M.S. Systems Security, Carnegie Mellon',
        joiningDate: '2022-01-10',
        status: 'Active',
        assignedCourses: ['course-bscit', 'course-btech-cs'],
        assignedSubjects: ['sub-it-net', 'sub-cs-os'],
        createdAt: '2024-03-01T08:00:00Z'
      },
      {
        id: 'tch-jenkins',
        userId: 'usr-teacher-4',
        fullName: 'Prof. Sarah Jenkins',
        email: 's.jenkins@college.edu',
        employeeCode: 'EMP-BBA-005',
        department: 'School of Business Management',
        designation: 'Senior Lecturer',
        qualification: 'MBA, Harvard Business School',
        joiningDate: '2021-06-15',
        status: 'Active',
        assignedCourses: ['course-bba'],
        assignedSubjects: ['sub-bba-mgt', 'sub-bba-mk'],
        createdAt: '2024-03-15T08:00:00Z'
      }
    ];

    // 5. Students
    this.students = [
      {
        id: 'stu-1',
        userId: 'usr-student-1',
        studentId: 'STU-2024-001',
        fullName: 'Arjun Sharma',
        rollNumber: '2024-IT-001',
        email: 'arjun.sharma@student.college.edu',
        phoneNumber: '+1 (555) 678-9012',
        dateOfBirth: '2004-03-15',
        gender: 'Male',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 5,
        admissionYear: 2024,
        address: '42 Academic Boulevard, Campus Town, CA 94102',
        academicStatus: 'Active',
        attendancePercentage: 0, // Calculated dynamically
        createdAt: '2024-08-01T09:00:00Z',
        updatedAt: '2024-08-01T09:00:00Z'
      },
      {
        id: 'stu-2',
        userId: 'usr-student-2',
        studentId: 'STU-2024-002',
        fullName: 'Priya Verma',
        rollNumber: '2024-IT-002',
        email: 'priya.verma@student.college.edu',
        phoneNumber: '+1 (555) 789-0123',
        dateOfBirth: '2004-07-22',
        gender: 'Female',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 5,
        admissionYear: 2024,
        address: '108 Horizon Heights, Tech District, CA 94103',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-01T09:15:00Z',
        updatedAt: '2024-08-01T09:15:00Z'
      },
      {
        id: 'stu-3',
        studentId: 'STU-2024-003',
        fullName: 'Marcus Vance',
        rollNumber: '2024-IT-003',
        email: 'marcus.vance@student.college.edu',
        phoneNumber: '+1 (555) 890-1234',
        dateOfBirth: '2003-11-05',
        gender: 'Male',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 5,
        admissionYear: 2024,
        address: '19 Pinecrest Way, Campus East, CA 94105',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-02T10:00:00Z',
        updatedAt: '2024-08-02T10:00:00Z'
      },
      {
        id: 'stu-4',
        studentId: 'STU-2024-004',
        fullName: 'Elena Rostova',
        rollNumber: '2024-CS-010',
        email: 'elena.rostova@student.college.edu',
        phoneNumber: '+1 (555) 901-2345',
        dateOfBirth: '2004-01-30',
        gender: 'Female',
        courseId: 'course-btech-cs',
        courseName: 'B.Tech Computer Science & Engineering',
        courseCode: 'BTECH-CS',
        semester: 6,
        admissionYear: 2023,
        address: '88 Oakridge Drive, Silicon Valley, CA 94025',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2023-08-10T11:00:00Z',
        updatedAt: '2023-08-10T11:00:00Z'
      },
      {
        id: 'stu-5',
        studentId: 'STU-2024-005',
        fullName: 'Liam O\'Connor',
        rollNumber: '2024-CS-011',
        email: 'liam.oconnor@student.college.edu',
        phoneNumber: '+1 (555) 012-3456',
        dateOfBirth: '2004-09-14',
        gender: 'Male',
        courseId: 'course-btech-cs',
        courseName: 'B.Tech Computer Science & Engineering',
        courseCode: 'BTECH-CS',
        semester: 6,
        admissionYear: 2023,
        address: '312 Beacon Street, Metro Hills, CA 94107',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2023-08-10T11:30:00Z',
        updatedAt: '2023-08-10T11:30:00Z'
      },
      {
        id: 'stu-6',
        studentId: 'STU-2024-006',
        fullName: 'Ananya Roy',
        rollNumber: '2024-BCA-001',
        email: 'ananya.roy@student.college.edu',
        phoneNumber: '+1 (555) 123-4567',
        dateOfBirth: '2004-05-18',
        gender: 'Female',
        courseId: 'course-bca',
        courseName: 'Bachelor of Computer Applications',
        courseCode: 'BCA',
        semester: 4,
        admissionYear: 2024,
        address: '77 West End Court, Bay Area, CA 94110',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-05T09:00:00Z',
        updatedAt: '2024-08-05T09:00:00Z'
      },
      {
        id: 'stu-7',
        studentId: 'STU-2024-007',
        fullName: 'Dev Patel',
        rollNumber: '2024-BCA-002',
        email: 'dev.patel@student.college.edu',
        phoneNumber: '+1 (555) 234-8901',
        dateOfBirth: '2003-12-01',
        gender: 'Male',
        courseId: 'course-bca',
        courseName: 'Bachelor of Computer Applications',
        courseCode: 'BCA',
        semester: 4,
        admissionYear: 2024,
        address: '500 Mission Creek, San Francisco, CA 94103',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-05T10:00:00Z',
        updatedAt: '2024-08-05T10:00:00Z'
      },
      {
        id: 'stu-8',
        studentId: 'STU-2023-018',
        fullName: 'Kavita Iyer',
        rollNumber: '2023-IT-018',
        email: 'kavita.iyer@student.college.edu',
        phoneNumber: '+1 (555) 345-9012',
        dateOfBirth: '2002-04-12',
        gender: 'Female',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 6,
        admissionYear: 2023,
        address: '14 University Crescent, CA 94112',
        academicStatus: 'Graduated',
        attendancePercentage: 0,
        createdAt: '2023-07-20T08:00:00Z',
        updatedAt: '2026-06-30T10:00:00Z'
      },
      {
        id: 'stu-9',
        studentId: 'STU-2024-009',
        fullName: 'Jordan Chen',
        rollNumber: '2024-IT-009',
        email: 'jordan.chen@student.college.edu',
        phoneNumber: '+1 (555) 456-0123',
        dateOfBirth: '2004-06-08',
        gender: 'Other',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 5,
        admissionYear: 2024,
        address: '22 Elm Street, Campus North, CA 94109',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-06T14:00:00Z',
        updatedAt: '2024-08-06T14:00:00Z'
      },
      {
        id: 'stu-10',
        studentId: 'STU-2024-010',
        fullName: 'Rohan Deshmukh',
        rollNumber: '2024-BBA-001',
        email: 'rohan.deshmukh@student.college.edu',
        phoneNumber: '+1 (555) 567-1234',
        dateOfBirth: '2004-10-10',
        gender: 'Male',
        courseId: 'course-bba',
        courseName: 'Bachelor of Business Administration',
        courseCode: 'BBA',
        semester: 3,
        admissionYear: 2024,
        address: '900 Sutter Street, San Francisco, CA 94109',
        academicStatus: 'Inactive',
        attendancePercentage: 0,
        createdAt: '2024-08-07T11:00:00Z',
        updatedAt: '2024-11-15T09:00:00Z'
      },
      {
        id: 'stu-11',
        studentId: 'STU-2024-011',
        fullName: 'Sofia Morales',
        rollNumber: '2024-IT-011',
        email: 'sofia.morales@student.college.edu',
        phoneNumber: '+1 (555) 678-2345',
        dateOfBirth: '2004-02-14',
        gender: 'Female',
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        semester: 5,
        admissionYear: 2024,
        address: '610 Sunset Boulevard, CA 94116',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2024-08-08T09:00:00Z',
        updatedAt: '2024-08-08T09:00:00Z'
      },
      {
        id: 'stu-12',
        studentId: 'STU-2024-012',
        fullName: 'Zainab Al-Hassan',
        rollNumber: '2024-CS-012',
        email: 'zainab.alhassan@student.college.edu',
        phoneNumber: '+1 (555) 789-3456',
        dateOfBirth: '2004-08-19',
        gender: 'Female',
        courseId: 'course-btech-cs',
        courseName: 'B.Tech Computer Science & Engineering',
        courseCode: 'BTECH-CS',
        semester: 6,
        admissionYear: 2023,
        address: '450 Marina Green, San Francisco, CA 94123',
        academicStatus: 'Active',
        attendancePercentage: 0,
        createdAt: '2023-08-11T10:00:00Z',
        updatedAt: '2023-08-11T10:00:00Z'
      }
    ];

    // 6. Attendance Sessions & Records
    // Generate realistic past sessions for BSCIT Sem 5 & BTech CS Sem 6
    const sessionDates = [
      '2026-10-15',
      '2026-10-17',
      '2026-10-20',
      '2026-10-22',
      '2026-10-24',
      '2026-10-26'
    ];

    let sessionCounter = 1;
    let recordCounter = 1;

    // Sessions for BSCIT Full-Stack Web Dev (sub-it-web)
    for (const date of sessionDates) {
      const sessionId = `sess-${sessionCounter++}`;
      this.attendanceSessions.push({
        id: sessionId,
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        subjectId: 'sub-it-web',
        subjectName: 'Full-Stack Web Development',
        subjectCode: 'IT501',
        teacherId: 'tch-sharma',
        teacherName: 'Prof. Rajesh Sharma',
        sessionDate: date,
        startTime: '10:00',
        endTime: '11:30',
        sessionType: 'Lecture',
        topicCovered: `Full-Stack Architecture & REST APIs Part ${sessionCounter - 1}`,
        createdAt: `${date}T10:00:00Z`
      });

      // Enroll students in BSCIT: stu-1, stu-2, stu-3, stu-9, stu-11
      const itStudentIds = ['stu-1', 'stu-2', 'stu-3', 'stu-9', 'stu-11'];
      for (const sid of itStudentIds) {
        // High attendance for stu-1 and stu-2, varying for others
        let status: 'Present' | 'Absent' | 'Late' = 'Present';
        if (sid === 'stu-1') {
          status = date === '2026-10-20' ? 'Late' : 'Present';
        } else if (sid === 'stu-3' && date === '2026-10-17') {
          status = 'Absent';
        } else if (sid === 'stu-9' && (date === '2026-10-22' || date === '2026-10-24')) {
          status = 'Absent';
        }

        const student = this.students.find(s => s.id === sid);
        this.attendanceRecords.push({
          id: `att-rec-${recordCounter++}`,
          sessionId,
          studentId: sid,
          studentName: student?.fullName,
          rollNumber: student?.rollNumber,
          status,
          sessionDate: date,
          subjectName: 'Full-Stack Web Development',
          remarks: status === 'Late' ? 'Arrived 10 mins late' : undefined,
          createdAt: `${date}T11:30:00Z`
        });
      }
    }

    // Sessions for BSCIT Cloud Computing (sub-it-cloud)
    for (const date of ['2026-10-16', '2026-10-21', '2026-10-25']) {
      const sessionId = `sess-${sessionCounter++}`;
      this.attendanceSessions.push({
        id: sessionId,
        courseId: 'course-bscit',
        courseName: 'B.Sc. Information Technology',
        courseCode: 'BSCIT',
        subjectId: 'sub-it-cloud',
        subjectName: 'Cloud Computing & DevOps',
        subjectCode: 'IT502',
        teacherId: 'tch-sharma',
        teacherName: 'Prof. Rajesh Sharma',
        sessionDate: date,
        startTime: '13:00',
        endTime: '14:30',
        sessionType: 'Lab',
        topicCovered: 'Kubernetes Pods & CI/CD Pipelines',
        createdAt: `${date}T13:00:00Z`
      });

      const itStudentIds = ['stu-1', 'stu-2', 'stu-3', 'stu-9', 'stu-11'];
      for (const sid of itStudentIds) {
        const student = this.students.find(s => s.id === sid);
        this.attendanceRecords.push({
          id: `att-rec-${recordCounter++}`,
          sessionId,
          studentId: sid,
          studentName: student?.fullName,
          rollNumber: student?.rollNumber,
          status: 'Present',
          sessionDate: date,
          subjectName: 'Cloud Computing & DevOps',
          createdAt: `${date}T14:30:00Z`
        });
      }
    }

    // Sessions for BTech CS AI (sub-cs-ai)
    for (const date of ['2026-10-18', '2026-10-23']) {
      const sessionId = `sess-${sessionCounter++}`;
      this.attendanceSessions.push({
        id: sessionId,
        courseId: 'course-btech-cs',
        courseName: 'B.Tech Computer Science & Engineering',
        courseCode: 'BTECH-CS',
        subjectId: 'sub-cs-ai',
        subjectName: 'Artificial Intelligence & Machine Learning',
        subjectCode: 'CS601',
        teacherId: 'tch-patel',
        teacherName: 'Dr. Ananya Patel',
        sessionDate: date,
        startTime: '09:00',
        endTime: '10:30',
        sessionType: 'Lecture',
        topicCovered: 'Neural Networks & Gradient Descent',
        createdAt: `${date}T09:00:00Z`
      });

      const csStudentIds = ['stu-4', 'stu-5', 'stu-12'];
      for (const sid of csStudentIds) {
        const student = this.students.find(s => s.id === sid);
        this.attendanceRecords.push({
          id: `att-rec-${recordCounter++}`,
          sessionId,
          studentId: sid,
          studentName: student?.fullName,
          rollNumber: student?.rollNumber,
          status: 'Present',
          sessionDate: date,
          subjectName: 'Artificial Intelligence & Machine Learning',
          createdAt: `${date}T10:30:00Z`
        });
      }
    }

    // Calculate attendance percentages for all students
    this.refreshAllStudentAttendanceStats();

    // 7. Marks & Assessments
    this.marks = [
      {
        id: 'mrk-1',
        studentId: 'stu-1',
        studentName: 'Arjun Sharma',
        rollNumber: '2024-IT-001',
        courseName: 'B.Sc. Information Technology',
        subjectId: 'sub-it-web',
        subjectName: 'Full-Stack Web Development',
        subjectCode: 'IT501',
        assessmentName: 'Midterm 1',
        maxMarks: 50,
        marksObtained: 46.5,
        percentage: 93,
        grade: 'A+',
        examDate: '2026-09-25',
        enteredBy: 'Prof. Rajesh Sharma',
        remarks: 'Outstanding performance in REST APIs and React component design',
        createdAt: '2026-09-26T14:00:00Z',
        updatedAt: '2026-09-26T14:00:00Z'
      },
      {
        id: 'mrk-2',
        studentId: 'stu-1',
        studentName: 'Arjun Sharma',
        rollNumber: '2024-IT-001',
        courseName: 'B.Sc. Information Technology',
        subjectId: 'sub-it-cloud',
        subjectName: 'Cloud Computing & DevOps',
        subjectCode: 'IT502',
        assessmentName: 'Midterm 1',
        maxMarks: 50,
        marksObtained: 43,
        percentage: 86,
        grade: 'A',
        examDate: '2026-09-28',
        enteredBy: 'Prof. Rajesh Sharma',
        remarks: 'Excellent practical setup of Docker containers',
        createdAt: '2026-09-29T11:00:00Z',
        updatedAt: '2026-09-29T11:00:00Z'
      },
      {
        id: 'mrk-3',
        studentId: 'stu-1',
        studentName: 'Arjun Sharma',
        rollNumber: '2024-IT-001',
        courseName: 'B.Sc. Information Technology',
        subjectId: 'sub-it-net',
        subjectName: 'Network Security & Cryptography',
        subjectCode: 'IT503',
        assessmentName: 'Midterm 1',
        maxMarks: 50,
        marksObtained: 41,
        percentage: 82,
        grade: 'A',
        examDate: '2026-10-02',
        enteredBy: 'Dr. David Morrison',
        remarks: 'Good grasp of asymmetric cipher keys',
        createdAt: '2026-10-03T16:00:00Z',
        updatedAt: '2026-10-03T16:00:00Z'
      },
      {
        id: 'mrk-4',
        studentId: 'stu-2',
        studentName: 'Priya Verma',
        rollNumber: '2024-IT-002',
        courseName: 'B.Sc. Information Technology',
        subjectId: 'sub-it-web',
        subjectName: 'Full-Stack Web Development',
        subjectCode: 'IT501',
        assessmentName: 'Midterm 1',
        maxMarks: 50,
        marksObtained: 48,
        percentage: 96,
        grade: 'A+',
        examDate: '2026-09-25',
        enteredBy: 'Prof. Rajesh Sharma',
        remarks: 'Perfect score on database normalization and Express routing',
        createdAt: '2026-09-26T14:30:00Z',
        updatedAt: '2026-09-26T14:30:00Z'
      },
      {
        id: 'mrk-5',
        studentId: 'stu-4',
        studentName: 'Elena Rostova',
        rollNumber: '2024-CS-010',
        courseName: 'B.Tech Computer Science & Engineering',
        subjectId: 'sub-cs-ai',
        subjectName: 'Artificial Intelligence & Machine Learning',
        subjectCode: 'CS601',
        assessmentName: 'Midterm 1',
        maxMarks: 50,
        marksObtained: 47,
        percentage: 94,
        grade: 'A+',
        examDate: '2026-09-30',
        enteredBy: 'Dr. Ananya Patel',
        remarks: 'Very thorough backpropagation derivation',
        createdAt: '2026-10-01T15:00:00Z',
        updatedAt: '2026-10-01T15:00:00Z'
      }
    ];

    // 8. Correction Requests
    this.correctionRequests = [
      {
        id: 'cr-1',
        studentId: 'stu-1',
        studentName: 'Arjun Sharma',
        rollNumber: '2024-IT-001',
        fieldName: 'phone_number',
        currentValue: '+1 (555) 678-9012',
        requestedValue: '+1 (555) 678-9999',
        reason: 'Updated primary carrier phone number due to device change.',
        status: 'Pending',
        createdAt: '2026-10-25T11:00:00Z',
        updatedAt: '2026-10-25T11:00:00Z'
      }
    ];

    // 9. Activity Logs
    this.activityLogs = [
      {
        id: 'act-1',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin',
        action: 'System Initialized',
        entityType: 'system',
        details: 'CampusCore Academic Management System started with College Semester 2026-2027 curriculum.',
        createdAt: '2026-10-15T08:00:00Z'
      },
      {
        id: 'act-2',
        actorName: 'Prof. Rajesh Sharma',
        actorRole: 'teacher',
        action: 'Recorded Attendance',
        entityType: 'attendance',
        details: 'Marked 5 students for IT501 Full-Stack Web Development session.',
        createdAt: '2026-10-26T11:30:00Z'
      },
      {
        id: 'act-3',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin',
        action: 'Student Added',
        entityType: 'student',
        entityId: 'stu-11',
        details: 'Enrolled Sofia Morales into B.Sc. IT Semester 5 (Roll: 2024-IT-011).',
        createdAt: '2026-10-24T14:20:00Z'
      }
    ];
  }

  // Refresh attendance stats for a student
  public refreshStudentAttendanceStats(studentId: string) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    const studentRecords = this.attendanceRecords.filter(r => r.studentId === studentId);
    const totalSessions = studentRecords.length;
    const attendedSessions = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;

    student.totalSessionsCount = totalSessions;
    student.totalSessionsAttended = attendedSessions;
    student.attendancePercentage = totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;
  }

  public refreshAllStudentAttendanceStats() {
    for (const student of this.students) {
      this.refreshStudentAttendanceStats(student.id);
    }
  }

  // Add an activity log
  public logAction(actorName: string, actorRole: any, action: string, entityType: any, details: string, entityId?: string) {
    this.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    });
    // Keep max 100 logs
    if (this.activityLogs.length > 100) {
      this.activityLogs = this.activityLogs.slice(0, 100);
    }
  }

  // Get paginated and filtered students
  public getStudents(filters: StudentFilters) {
    let result = [...this.students];

    // Search query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.courseName && s.courseName.toLowerCase().includes(q))
      );
    }

    // Filter by Course
    if (filters.courseId) {
      result = result.filter(s => s.courseId === filters.courseId);
    }

    // Filter by Semester
    if (filters.semester) {
      const semNum = Number(filters.semester);
      if (!isNaN(semNum)) {
        result = result.filter(s => s.semester === semNum);
      }
    }

    // Filter by Academic Status
    if (filters.academicStatus && filters.academicStatus !== 'All') {
      result = result.filter(s => s.academicStatus === filters.academicStatus);
    }

    // Sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName) * sortOrder;
      }
      if (sortBy === 'rollNumber') {
        return a.rollNumber.localeCompare(b.rollNumber) * sortOrder;
      }
      if (sortBy === 'admissionYear') {
        return (a.admissionYear - b.admissionYear) * sortOrder;
      }
      if (sortBy === 'attendance') {
        return (a.attendancePercentage - b.attendancePercentage) * sortOrder;
      }
      if (sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder;
      }
      return 0;
    });

    const total = result.length;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Calculate dashboard stats
  public getDashboardStats(): DashboardStats {
    const totalStudents = this.students.length;
    const activeStudents = this.students.filter(s => s.academicStatus === 'Active').length;
    const totalTeachers = this.teachers.length;
    const totalCourses = this.courses.length;

    // Average attendance
    const studentsWithAttendance = this.students.filter(s => (s.totalSessionsCount || 0) > 0);
    const averageAttendance = studentsWithAttendance.length > 0
      ? Math.round(
          studentsWithAttendance.reduce((acc, s) => acc + s.attendancePercentage, 0) /
          studentsWithAttendance.length
        )
      : 84;

    // Group by course
    const courseMap: Record<string, { count: number; name: string; code: string }> = {};
    for (const c of this.courses) {
      courseMap[c.id] = { count: 0, name: c.courseName, code: c.courseCode };
    }
    for (const s of this.students) {
      if (courseMap[s.courseId]) {
        courseMap[s.courseId].count++;
      }
    }
    const studentsByCourse = Object.values(courseMap).map(item => ({
      courseName: item.code,
      count: item.count,
      code: item.code
    }));

    // Group by semester
    const semMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const s of this.students) {
      if (semMap[s.semester] !== undefined) {
        semMap[s.semester]++;
      } else {
        semMap[s.semester] = 1;
      }
    }
    const studentsBySemester = Object.entries(semMap)
      .map(([sem, count]) => ({ semester: `Sem ${sem}`, count }))
      .filter(item => item.count > 0);

    // Attendance trend
    const attendanceTrend = [
      { date: 'Oct 15', presentRate: 91, totalSessions: 4 },
      { date: 'Oct 17', presentRate: 88, totalSessions: 5 },
      { date: 'Oct 20', presentRate: 94, totalSessions: 6 },
      { date: 'Oct 22', presentRate: 85, totalSessions: 4 },
      { date: 'Oct 24', presentRate: 92, totalSessions: 7 },
      { date: 'Oct 26', presentRate: 96, totalSessions: 5 }
    ];

    // Status distribution
    const statusMap: Record<string, number> = {};
    for (const s of this.students) {
      statusMap[s.academicStatus] = (statusMap[s.academicStatus] || 0) + 1;
    }
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count
    }));

    // Recent students (last 5 added)
    const recentStudents = [...this.students]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalCourses,
      averageAttendance,
      studentsByCourse,
      studentsBySemester,
      attendanceTrend,
      statusDistribution,
      recentStudents,
      recentActivities: this.activityLogs.slice(0, 8)
    };
  }
}

export const db = new DatabaseStore();
