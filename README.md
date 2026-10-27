# CampusCore — Full-Stack College Student Management System

[![BSc IT Portfolio Project](https://img.shields.io/badge/BSc_IT-Portfolio_Project-4F46E5.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React_19_+_Node.js_+_Supabase-0F172A.svg)](#)
[![Security](https://img.shields.io/badge/Security-PostgreSQL_RLS_+_RBAC-10B981.svg)](#)

A complete, production-grade, full-stack **Student Management System (SMS)** engineered for modern collegiate environments. Designed and built to showcase clean software architecture, database design, role-based access control (RBAC), and statistical analytics for software engineering placements and BSc IT portfolio evaluations.

---

## 1. System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────────┐
   │                     Client (Browser)                       │
   │  React 19 · Vite 8 · Tailwind CSS v4 · Recharts · Lucide  │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ HTTP / JSON REST APIs
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │                 Node.js / Express Server                   │
   │  RBAC Middleware · Input Validation · Session Management   │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ SQL / RLS Policies
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │             Supabase PostgreSQL 15+ Database              │
   │  Row Level Security (RLS) · Triggers · Audit Logging       │
   └────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS v4 (with strict typographic scale and tabular numerals)
- **Backend**: Node.js, Express.js REST API with input validation and security headers
- **Database**: Supabase PostgreSQL with complete Row Level Security (RLS) policies and constraints
- **Authentication**: Supabase Auth / Session Token RBAC
- **Analytics & Data Visualization**: Recharts (Attendance Trends, Course Distributions)
- **Icons**: Lucide React

---

## 2. User Roles and RBAC Access Control

CampusCore enforces three distinct roles on both the backend API and database RLS levels:

| Capability / Permission | Administrator (Dean) | Faculty (Teacher) | Enrolled Student |
|---|:---:|:---:|:---:|
| **View All Student Records** | ✅ Yes | 🟡 Assigned Courses Only | ❌ Own Profile Only |
| **Add / Edit / Delete Students** | ✅ Full CRUD | ❌ No | ❌ No |
| **Create Degree Courses & Syllabi** | ✅ Full CRUD | ❌ Read Only | ❌ Read Only |
| **Conduct Attendance Sessions** | ✅ Full CRUD | ✅ Assigned Subjects | ❌ Read Only |
| **Record & Grade Assessment Marks** | ✅ Full CRUD | ✅ Assigned Subjects | ❌ Read Only |
| **Request Profile Correction** | ❌ Review & Approve | ❌ No | ✅ Submit Request |
| **Export Student List to CSV** | ✅ Yes | ❌ No | ❌ No |
| **System Security Audit Trail** | ✅ Yes | ❌ No | ❌ No |

---

## 3. Database Schema & RLS Policies

The PostgreSQL migration script is available at `/supabase/migrations/20261027000000_init_schema.sql` and includes:

1. `profiles`: User account credentials, email, and roles (`admin`, `teacher`, `student`).
2. `courses`: Program code, department, duration years, and total semesters.
3. `subjects`: Curriculum subjects with credit hours and practical lecture hours.
4. `teachers`: Faculty employee code, qualification, designation, and department.
5. `students`: Unique student ID, college roll number, contact details, date of birth, semester, admission year, and status.
6. `attendance_sessions`: Course, subject, session date, session type, and topic covered.
7. `attendance_records`: Individual student attendance status (`Present`, `Absent`, `Late`) with strict `UNIQUE(session_id, student_id)` constraints to prevent duplicate entries.
8. `marks`: Evaluated scores with strict `CHECK (marks_obtained >= 0 AND marks_obtained <= max_marks)` and auto-calculated percentage and letter grades.
9. `correction_requests`: Student profile change requests with audit tracking.
10. `activity_logs`: Administrative actions with actor, role, action, and timestamp.

---

## 4. Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/campuscore-sms.git
cd campuscore-sms
npm install
```

### 2. Environment Setup
Copy the sample environment file:
```bash
cp .env.example .env
```

Configure your Supabase credentials in `.env`:
```env
PORT=3000
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Pre-Configured Demo Credentials

For quick evaluation during portfolio reviews or viva presentations, 1-click test credentials are provided on the login page:

- **Dean / Administrator**: `admin@college.edu` / `AdminPassword123!`
- **Faculty / Teacher**: `prof.sharma@college.edu` / `TeacherPassword123!`
- **Enrolled Student**: `arjun.sharma@student.college.edu` / `StudentPassword123!`

---

## 6. Automated Test Suite (Self-Contained)

CampusCore includes an in-browser automated test runner located in `/src/tests/systemTests.ts` and executable via the **System Diagnostics & Setup** page:

1. **Student Creation & Field Validation**: Confirms creation succeeds and generates proper IDs.
2. **Duplicate Roll Number Prevention**: Verifies server rejects duplicate roll numbers with HTTP 409.
3. **Duplicate Email Prevention**: Confirms uniqueness check on emails.
4. **Student Modification & Deletion**: Verifies updates persist and deletion cascades.
5. **RBAC Enforcement**: Verifies non-admins cannot delete student records.
6. **Student Data Isolation (FERPA)**: Verifies student cannot query other students' private records.
7. **Attendance & Marks Integrity**: Asserts marks obtained cannot exceed maximum marks and attendance percentages calculate accurately.

---

## 7. Key REST API Endpoints

- `POST /api/auth/login`: Authenticate with email and password
- `POST /api/auth/demo-login`: 1-click testing role switch
- `GET /api/dashboard/stats`: College-wide enrollment, attendance, and analytics
- `GET /api/students`: Filter, sort, and paginate students
- `POST /api/students`: Enroll new student (Admin only, validation enforced)
- `PUT /api/students/:id`: Update student record
- `DELETE /api/students/:id`: Delete student record (Admin only)
- `GET /api/students-export/csv`: Export filtered students to CSV format
- `GET /api/attendance/sessions`: List attendance sessions
- `POST /api/attendance/mark`: Bulk record student attendance
- `GET /api/marks`: List graded marks
- `POST /api/marks`: Submit assessment marks with validation
- `GET /api/activity-logs`: Administrative audit trail
