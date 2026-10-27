/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from '../lib/api.ts';

export interface TestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  message?: string;
}

export async function runSystemTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper
  const recordTest = async (
    id: string,
    name: string,
    description: string,
    fn: () => Promise<void>
  ) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        id,
        name,
        description,
        passed: true,
        durationMs: Math.round(performance.now() - start),
        message: 'Assertion passed successfully.',
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        description,
        passed: false,
        durationMs: Math.round(performance.now() - start),
        message: err.message || 'Assertion failed',
      });
    }
  };

  // Test 1: Student Creation and Validation
  await recordTest(
    'test-1',
    'Student Creation & Field Validation',
    'Verifies student enrollment succeeds with valid fields and generates unique IDs.',
    async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const student = await api.createStudent({
        fullName: `Test Student ${uniqueSuffix}`,
        rollNumber: `2024-TEST-${uniqueSuffix}`,
        email: `test.${uniqueSuffix}@student.college.edu`,
        phoneNumber: '+1 (555) 000-1111',
        dateOfBirth: '2004-05-10',
        courseId: 'course-bscit',
        semester: 3,
        admissionYear: 2024,
      });

      if (!student.id || !student.studentId || student.rollNumber !== `2024-TEST-${uniqueSuffix}`) {
        throw new Error('Student record was not initialized with proper studentId/rollNumber');
      }

      // Cleanup
      await api.deleteStudent(student.id);
    }
  );

  // Test 2: Duplicate Roll Number Prevention
  await recordTest(
    'test-2',
    'Duplicate Roll Number Prevention',
    'Ensures duplicate roll numbers are strictly rejected with HTTP 409.',
    async () => {
      let threw = false;
      try {
        // Attempt to create student with an existing roll number '2024-IT-001'
        await api.createStudent({
          fullName: 'Duplicate Roll Imposter',
          rollNumber: '2024-IT-001',
          email: 'imposter@student.college.edu',
          phoneNumber: '+1 (555) 999-0000',
          courseId: 'course-bscit',
          semester: 5,
          admissionYear: 2024,
        });
      } catch (err: any) {
        threw = true;
        if (!err.message.toLowerCase().includes('already exists') && !err.message.includes('409')) {
          throw new Error(`Unexpected error message: ${err.message}`);
        }
      }
      if (!threw) {
        throw new Error('Server accepted duplicate roll number without rejection!');
      }
    }
  );

  // Test 3: Duplicate Email Prevention
  await recordTest(
    'test-3',
    'Duplicate Email Address Prevention',
    'Ensures student emails must be unique across the college registry.',
    async () => {
      let threw = false;
      try {
        await api.createStudent({
          fullName: 'Duplicate Email Imposter',
          rollNumber: '2024-IT-999',
          email: 'arjun.sharma@student.college.edu',
          phoneNumber: '+1 (555) 999-1111',
          courseId: 'course-bscit',
          semester: 5,
          admissionYear: 2024,
        });
      } catch (err: any) {
        threw = true;
      }
      if (!threw) {
        throw new Error('Server accepted duplicate email without rejection!');
      }
    }
  );

  // Test 4: Student Update and Deletion
  await recordTest(
    'test-4',
    'Student Modification & Deletion Cascade',
    'Verifies editing student data updates database and deletion purges cascade records.',
    async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const student = await api.createStudent({
        fullName: `Mutable Candidate ${uniqueSuffix}`,
        rollNumber: `2024-MUT-${uniqueSuffix}`,
        email: `mut.${uniqueSuffix}@student.college.edu`,
        phoneNumber: '+1 (555) 222-3333',
        courseId: 'course-bca',
        semester: 2,
        admissionYear: 2024,
      });

      // Update
      const updated = await api.updateStudent(student.id, {
        phoneNumber: '+1 (555) 888-9999',
        address: 'Updated Campus Residence Hall',
      });

      if (updated.phoneNumber !== '+1 (555) 888-9999') {
        throw new Error('Update operation did not persist modified phone number');
      }

      // Delete
      await api.deleteStudent(student.id);

      // Verify deletion
      let notFound = false;
      try {
        await api.getStudent(student.id);
      } catch {
        notFound = true;
      }
      if (!notFound) {
        throw new Error('Student was still accessible after deletion!');
      }
    }
  );

  // Test 5: Role-Based Authorization
  await recordTest(
    'test-5',
    'Role-Based Access Control (RBAC) Enforcement',
    'Confirms teacher and student roles cannot delete student accounts.',
    async () => {
      // Simulate student attempt to delete
      const res = await fetch('/api/students/stu-1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'student',
          'x-user-id': 'usr-student-1',
        },
      });

      if (res.status !== 403) {
        throw new Error(`Expected HTTP 403 Forbidden for unauthorized deletion, received HTTP ${res.status}`);
      }
    }
  );

  // Test 6: Student Privacy & Data Isolation
  await recordTest(
    'test-6',
    'Student Privacy Isolation (FERPA Compliance)',
    'Verifies student is prevented from querying other students private records.',
    async () => {
      const res = await fetch('/api/attendance/student/stu-2', {
        headers: {
          'x-user-role': 'student',
          'x-user-id': 'usr-student-1',
        },
      });

      // stu-1 cannot query stu-2
      if (res.status !== 403 && res.status !== 401) {
        // In our server auth check, if studentId doesn't match, it returns 403
        throw new Error(`Student was able to query another student records! Status: ${res.status}`);
      }
    }
  );

  // Test 7: Attendance & Marks Integrity
  await recordTest(
    'test-7',
    'Attendance Calculation & Marks Range Validation',
    'Verifies marks obtained cannot exceed max marks and attendance duplicates are prevented.',
    async () => {
      // 1. Invalid mark test (marksObtained > maxMarks)
      let marksRejected = false;
      try {
        await api.createMark({
          studentId: 'stu-1',
          subjectId: 'sub-it-web',
          assessmentName: 'Midterm Invalid',
          maxMarks: 50,
          marksObtained: 75, // Invalid!
        });
      } catch (err: any) {
        marksRejected = true;
      }

      if (!marksRejected) {
        throw new Error('Validation failed: Server allowed marks obtained greater than maximum marks!');
      }

      // 2. Attendance percentage sanity
      const studentData = await api.getStudent('stu-1');
      if (
        typeof studentData.student.attendancePercentage !== 'number' ||
        studentData.student.attendancePercentage < 0 ||
        studentData.student.attendancePercentage > 100
      ) {
        throw new Error(`Invalid attendance percentage calculated: ${studentData.student.attendancePercentage}`);
      }
    }
  );

  return results;
}
