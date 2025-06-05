-- Create enum type for roles
CREATE TYPE roles AS ENUM ('student', 'teacher', 'staff');

-- Insert sample degrees
INSERT INTO "Degree" (degreeId, name, numSemesters) VALUES
(1, 'Computer Science', 8),
(2, 'Software Engineering', 7),
(3, 'Data Science', 8);

-- Insert sample courses
INSERT INTO "CourseCatalog" (courseId, courseName, semester, ects, isBiWeekly) VALUES
(1, 'Introduction to Programming', 1, 6, false),
(2, 'Database Systems', 3, 5, false),
(3, 'Software Engineering', 4, 6, false),
(4, 'Artificial Intelligence', 5, 5, true),
(5, 'Web Development', 3, 4, false);

-- Insert sample students
INSERT INTO "Student" (studentId, semester, degreeId, age, email) VALUES
(1, 1, 1, 19, 'john.doe@university.com'),
(2, 3, 1, 20, 'jane.smith@university.com'),
(3, 2, 2, 19, 'bob.wilson@university.com'),
(4, 4, 3, 21, 'alice.brown@university.com');

-- Insert sample staff
INSERT INTO "Staff" (staffId, name, email, administrator) VALUES
(1, 'Dr. James Wilson', 'j.wilson@university.com', true),
(2, 'Prof. Sarah Davis', 's.davis@university.com', false),
(3, 'Dr. Michael Brown', 'm.brown@university.com', false);

-- Insert sample rooms
INSERT INTO "Room" (roomId, courseId, building, roomNumber) VALUES
(1, 1, 'Main Building', 101),
(2, 2, 'Computer Science', 205),
(3, 3, 'Engineering', 304),
(4, 4, 'Computer Science', 405),
(5, 5, 'Main Building', 102);

-- Insert sample course-student relationships
INSERT INTO "CourseStudent" (courseStudentId, courseId, studentId, group) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 2, 2, 2),
(4, 3, 3, 1),
(5, 4, 4, 1);

-- Insert sample assignments
INSERT INTO "Assignment" (assignmentId, name, desc, dueDateTime, needsSubmission, assignmentIntro, validFileTypes, group, courseId) VALUES
(1, 'Python Basics', 'Introduction to Python programming basics', '2024-06-15 23:59:59', true, 'Complete the following programming exercises', 'py,txt', 1, 1),
(2, 'Database Design', 'Create an ER diagram for a library system', '2024-06-20 23:59:59', true, 'Design a complete database schema', 'pdf,png,jpg', 2, 2),
(3, 'Software Requirements', 'Document requirements for a web application', '2024-06-25 23:59:59', true, 'Follow the IEEE template', 'pdf,doc,docx', 1, 3),
(4, 'Machine Learning Project', 'Implement a basic neural network', '2024-07-01 23:59:59', true, 'Use TensorFlow or PyTorch', 'py,ipynb', 1, 4),
(5, 'Web App Development', 'Create a responsive website', '2024-07-05 23:59:59', true, 'Use React and FastAPI', 'zip,tar.gz', 1, 5);

-- Insert sample grades
INSERT INTO "Grade" (gradeId, studentId, grade, assignmentId) VALUES
(1, 1, 85.5, 1),  -- John Doe's grade for Python Basics
(2, 2, 92.0, 1),  -- Jane Smith's grade for Python Basics
(3, 2, 88.5, 2),  -- Jane Smith's grade for Database Design
(4, 3, 78.0, 3),  -- Bob Wilson's grade for Software Requirements
(5, 4, 95.0, 4),  -- Alice Brown's grade for Machine Learning Project
(6, 1, 90.0, 2),  -- John Doe's grade for Database Design
(7, 2, 87.5, 3),  -- Jane Smith's grade for Software Requirements
(8, 3, 83.0, 1),  -- Bob Wilson's grade for Python Basics
(9, 4, 91.5, 5);  -- Alice Brown's grade for Web App Development

-- Insert sample FAQ entries
INSERT INTO "FAQ" (faqId, question, answer) VALUES
(1, 'How do I register for courses?', 'Log in to your student portal and select "Course Registration" from the menu.'),
(2, 'What is the attendance policy?', 'Students must maintain at least 80% attendance in all courses.'),
(3, 'How do I contact my professor?', 'You can find faculty contact information in the course syllabus or faculty directory.');

-- Insert sample users with bcrypt hashed passwords
-- Note: Passwords are hashed with bcrypt, these are example hashes for 'password123'
-- Create enum type for roles
CREATE TYPE roles AS ENUM ('student', 'teacher', 'staff');

-- Insert sample degrees
INSERT INTO "Degree" (degreeId, name, numSemesters) VALUES
(1, 'Computer Science', 8),
(2, 'Software Engineering', 7),
(3, 'Data Science', 8);

-- Insert sample courses
INSERT INTO "CourseCatalog" (courseId, courseName, semester, ects, isBiWeekly) VALUES
(1, 'Introduction to Programming', 1, 6, false),
(2, 'Database Systems', 3, 5, false),
(3, 'Software Engineering', 4, 6, false),
(4, 'Artificial Intelligence', 5, 5, true),
(5, 'Web Development', 3, 4, false);

-- Insert sample students
INSERT INTO "Student" (studentId, semester, degreeId, age, email) VALUES
(1, 1, 1, 19, 'john.doe@university.com'),
(2, 3, 1, 20, 'jane.smith@university.com'),
(3, 2, 2, 19, 'bob.wilson@university.com'),
(4, 4, 3, 21, 'alice.brown@university.com');

-- Insert sample staff
INSERT INTO "Staff" (staffId, name, email, administrator) VALUES
(1, 'Dr. James Wilson', 'j.wilson@university.com', true),
(2, 'Prof. Sarah Davis', 's.davis@university.com', false),
(3, 'Dr. Michael Brown', 'm.brown@university.com', false);

-- Insert sample rooms
INSERT INTO "Room" (roomId, courseId, building, roomNumber) VALUES
(1, 1, 'Main Building', 101),
(2, 2, 'Computer Science', 205),
(3, 3, 'Engineering', 304),
(4, 4, 'Computer Science', 405),
(5, 5, 'Main Building', 102);

-- Insert sample course-student relationships
INSERT INTO "CourseStudent" (courseStudentId, courseId, studentId, group) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 2, 2, 2),
(4, 3, 3, 1),
(5, 4, 4, 1);

-- Insert sample assignments
INSERT INTO "Assignment" (assignmentId, name, desc, dueDateTime, needsSubmission, assignmentIntro, validFileTypes, group, courseId) VALUES
(1, 'Python Basics', 'Introduction to Python programming basics', '2024-06-15 23:59:59', true, 'Complete the following programming exercises', 'py,txt', 1, 1),
(2, 'Database Design', 'Create an ER diagram for a library system', '2024-06-20 23:59:59', true, 'Design a complete database schema', 'pdf,png,jpg', 2, 2),
(3, 'Software Requirements', 'Document requirements for a web application', '2024-06-25 23:59:59', true, 'Follow the IEEE template', 'pdf,doc,docx', 1, 3),
(4, 'Machine Learning Project', 'Implement a basic neural network', '2024-07-01 23:59:59', true, 'Use TensorFlow or PyTorch', 'py,ipynb', 1, 4),
(5, 'Web App Development', 'Create a responsive website', '2024-07-05 23:59:59', true, 'Use React and FastAPI', 'zip,tar.gz', 1, 5);

-- Insert sample grades
INSERT INTO "Grade" (gradeId, studentId, grade, assignmentId) VALUES
(1, 1, 85.5, 1),  -- John Doe's grade for Python Basics
(2, 2, 92.0, 1),  -- Jane Smith's grade for Python Basics
(3, 2, 88.5, 2),  -- Jane Smith's grade for Database Design
(4, 3, 78.0, 3),  -- Bob Wilson's grade for Software Requirements
(5, 4, 95.0, 4),  -- Alice Brown's grade for Machine Learning Project
(6, 1, 90.0, 2),  -- John Doe's grade for Database Design
(7, 2, 87.5, 3),  -- Jane Smith's grade for Software Requirements
(8, 3, 83.0, 1),  -- Bob Wilson's grade for Python Basics
(9, 4, 91.5, 5);  -- Alice Brown's grade for Web App Development

-- Insert sample FAQ entries
INSERT INTO "FAQ" (faqId, question, answer) VALUES
(1, 'How do I register for courses?', 'Log in to your student portal and select "Course Registration" from the menu.'),
(2, 'What is the attendance policy?', 'Students must maintain at least 80% attendance in all courses.'),
(3, 'How do I contact my professor?', 'You can find faculty contact information in the course syllabus or faculty directory.');

-- Insert sample users with bcrypt hashed passwords
-- Note: Passwords are hashed with bcrypt, these are example hashes for 'password123'
-- Fix the User inserts by removing the semicolon between records
INSERT INTO "User" (userId, username, password, role, roleId) VALUES
(145, 'john.doe', E'\\x243262243132244B59426E6F7A42445A39784C364B4159776F2E4F75517558627257784C4836797A796C556D69523367784E674D4C4A4F4B', 'student', 1),
(2, 'james.wilson', E'\\x243262243132244B59426E6F7A42445A39784C364B4159776F2E4F75517558627257784C4836797A796C556D69523367784E674D4C4A4F4B', 'staff', 1),
(3, 'sarah.davis', E'\\x243262243132244B59426E6F7A42445A39784C364B4159776F2E4F75517558627257784C4836797A796C556D69523367784E674D4C4A4F4B', 'staff', 2),
(4, 'john.do', E'\\x243262243132244B59426E6F7A42445A39784C364B4159776F2E4F75517558627257784C4836797A796C556D69523367784E674D4C4A4F4B', 'student', 1);

