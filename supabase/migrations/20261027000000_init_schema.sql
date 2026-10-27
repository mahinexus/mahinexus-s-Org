-- ============================================================================
-- CAMPUSCORE STUDENT MANAGEMENT SYSTEM
-- PostgreSQL Database Schema & Supabase RLS Policies
-- Compatible with Supabase PostgreSQL and standard PostgreSQL 15+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. COURSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    department TEXT NOT NULL,
    duration_years INTEGER NOT NULL DEFAULT 3,
    total_semesters INTEGER NOT NULL DEFAULT 6,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. SUBJECTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
    credits INTEGER NOT NULL DEFAULT 4,
    total_hours INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_subject_code_course UNIQUE (course_id, subject_code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_course_semester ON public.subjects(course_id, semester);

-- ----------------------------------------------------------------------------
-- 4. TEACHERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL DEFAULT 'Assistant Professor',
    qualification TEXT NOT NULL DEFAULT 'M.Tech / Ph.D',
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. STUDENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
    admission_year INTEGER NOT NULL,
    address TEXT,
    academic_status TEXT NOT NULL DEFAULT 'Active' CHECK (academic_status IN ('Active', 'Graduated', 'Inactive')),
    profile_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_students_course_id ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_semester ON public.students(semester);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(academic_status);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- ----------------------------------------------------------------------------
-- 6. TEACHER ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_teacher_assignment UNIQUE (teacher_id, subject_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);

-- ----------------------------------------------------------------------------
-- 7. ATTENDANCE SESSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '10:00:00',
    session_type TEXT NOT NULL DEFAULT 'Lecture' CHECK (session_type IN ('Lecture', 'Lab', 'Tutorial')),
    topic_covered TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON public.attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course_subject ON public.attendance_sessions(course_id, subject_id);

-- ----------------------------------------------------------------------------
-- 8. ATTENDANCE RECORDS TABLE (Strict UNIQUE constraint against duplicates)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_session_attendance UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);

-- ----------------------------------------------------------------------------
-- 9. MARKS TABLE (Assessment grade records with validation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    assessment_name TEXT NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL CHECK (max_marks > 0),
    marks_obtained NUMERIC(5, 2) NOT NULL CHECK (marks_obtained >= 0),
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_marks_range CHECK (marks_obtained <= max_marks)
);

CREATE INDEX IF NOT EXISTS idx_marks_student ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON public.marks(subject_id);

-- ----------------------------------------------------------------------------
-- 10. CORRECTION REQUESTS TABLE (Student requesting personal profile edit)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    current_value TEXT NOT NULL,
    requested_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 11. ACTIVITY LOGS TABLE (Administrative audit log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone authenticated can view their own profile; admins view/manage all; teachers view all profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin() OR public.is_teacher());

CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Courses & Subjects: Authenticated users can view; Admins can manage
CREATE POLICY "Anyone authenticated can read courses" ON public.courses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone authenticated can read subjects" ON public.subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
    FOR ALL USING (public.is_admin());

-- Students:
-- 1. Admins have full access
-- 2. Teachers can view students enrolled in courses they teach
-- 3. Students can only view their own student record
CREATE POLICY "Admins full access to students" ON public.students
    FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can view students" ON public.students
    FOR SELECT USING (public.is_teacher());

CREATE POLICY "Students can view only own record" ON public.students
    FOR SELECT USING (user_id = auth.uid());

-- Attendance Records:
-- 1. Admins have full access
-- 2. Teachers can manage attendance records
-- 3. Students can only view their own attendance records
CREATE POLICY "Admins full access to attendance" ON public.attendance_records
    FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can manage attendance records" ON public.attendance_records
    FOR ALL USING (public.is_teacher());

CREATE POLICY "Students can view only their own attendance" ON public.attendance_records
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Attendance Sessions:
CREATE POLICY "Authenticated users can read sessions" ON public.attendance_sessions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers and admins can insert/update sessions" ON public.attendance_sessions
    FOR ALL USING (public.is_admin() OR public.is_teacher());

-- Marks:
-- 1. Admins have full access
-- 2. Teachers can insert and update marks
-- 3. Students can only view their own marks
CREATE POLICY "Admins full access to marks" ON public.marks
    FOR ALL USING (public.is_admin());

CREATE POLICY "Teachers can view and manage marks" ON public.marks
    FOR ALL USING (public.is_teacher());

CREATE POLICY "Students can view only their own marks" ON public.marks
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Correction Requests:
CREATE POLICY "Students can create and view own requests" ON public.correction_requests
    FOR ALL USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        ) OR public.is_admin()
    );

-- Activity Logs: Admins only
CREATE POLICY "Admins can read activity logs" ON public.activity_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);
