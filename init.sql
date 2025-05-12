-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS degrees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    semester INTEGER NOT NULL,
    year INTEGER NOT NULL,
    degree_id INTEGER REFERENCES degrees(id),
    age INTEGER,
    hashed_password VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ects INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    room_number VARCHAR(20),
    teacher_id INTEGER REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    group_number INTEGER NOT NULL,
    UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    due_date TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    assignment_id INTEGER REFERENCES assignments(id),
    grade DECIMAL(3,1) NOT NULL,
    UNIQUE(student_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    classes_missed INTEGER DEFAULT 0,
    UNIQUE(student_id, course_id)
);

-- Create test degrees
INSERT INTO degrees (name) VALUES
('Computer Science'),
('Electrical Engineering'),
('Mechanical Engineering');

-- Create test teachers
INSERT INTO teachers (name, title, email, hashed_password, is_active) VALUES
('John Smith', 'Professor', 'john.smith@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3JxGqJQHy', true),
('Mary Johnson', 'Associate Professor', 'mary.johnson@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3JxGqJQHy', true);

-- Create test students
INSERT INTO students (name, email, semester, year, degree_id, age, hashed_password, is_active, failed_login_attempts) VALUES
('Alice Brown', 'alice.brown@student.edu', 3, 2023, 1, 20, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3JxGqJQHy', true, 0),
('Bob Wilson', 'bob.wilson@student.edu', 2, 2023, 2, 19, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3JxGqJQHy', true, 0),
('Test Student', 'test@student.edu', 1, 2024, 1, 19, '$2b$12$K4OEohDpwj8.v8P.xz97X.UWkXxTxKaB.EZF/wBjpWOYjdfKSNnX6', true, 0);

-- Create test courses
INSERT INTO courses (name, ects, semester, room_number, teacher_id) VALUES
('Introduction to Programming', 6, 1, 'A101', 1),
('Database Systems', 5, 2, 'B203', 1),
('Circuit Theory', 7, 1, 'C305', 2);

-- Create test enrollments
INSERT INTO enrollments (student_id, course_id, group_number) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 1, 2),
(2, 3, 1);

-- Create test assignments
INSERT INTO assignments (course_id, due_date, type, description) VALUES
(1, '2024-03-15 23:59:59', 'Homework', 'Basic Programming Exercises'),
(1, '2024-03-20 23:59:59', 'Project', 'Simple Calculator Application'),
(2, '2024-03-18 23:59:59', 'Quiz', 'SQL Basics');

-- Create test grades
INSERT INTO grades (student_id, assignment_id, grade) VALUES
(1, 1, 4.5),
(1, 2, 5.0),
(2, 1, 4.0);

-- Create test attendance records
INSERT INTO attendance (student_id, course_id, classes_missed) VALUES
(1, 1, 1),
(1, 2, 0),
(2, 1, 2),
(2, 3, 1); 