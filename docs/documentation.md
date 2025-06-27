# **Upsos Project** 
## **Team Members** 
- **Bartosz Wołek** (bwolek@student.agh.edu.pl) 
- **Markiian Voloshyn** (mvoloshyn@student.agh.edu.pl) 
- **Szymon Wąs** (szymonwas@student.agh.edu.pl) 
- **Qingyang Zhu** (qingyang@student.agh.edu.pl) 
## **Project Overview** 
A web-based app merging USOS and UPEL for AGH students and staff. 
### **Features:** 
- Automatic class grade calculation with weighted categories 
- Per-group course file and grade visibility 
- MyUSOSweb and student section consolidation 
- Auto-create UPEL equivalent class with teacher assignment 
- Custom event scheduling integrated with class timetables 
## **Technology Stack** 
- **Database:** PostgreSQL 
- **Backend:** Python (FastAPI) 
- **Frontend:** Python React  
## **Database Tables** 
- **Assignment** - assignmentId (PK), name, desc, dueDateTime, needsSubmission, validFileTypes, group, courseId (FK) 
- **AssignmentSubmission** - assignmentSubmissionId (PK), assignmentId (FK), studentId (FK), submissionDateTime, submission 
- **Chat** - chatId (PK), user1Id (FK), user2Id (FK) 
- **ChatMessage** - chatMessageId (PK), chatId (FK), senderId (FK), message, timestamp 
- **ClassDateTime** - classDateTimeId (PK), courseId (FK), dateStartTime, endTime 
- **CourseCatalog** - courseId (PK), courseName, semester, ects, isBiWeekly 
- **CourseStudent** - courseStudentId (PK), courseId (FK), studentId (FK), group 
- **CourseTeacher** - courseTeacherId (PK), courseId (FK), teacherId (FK) 
- **Degree** - degreeId (PK), name, numSemesters 
- **FAQ** - faqId (PK), question, answer 
- **Grade** - gradeId (PK), studentId (FK), grade, assignmentId (FK) 
- **Room** - roomId (PK), courseId (FK), building, roomNumber 
- **Staff** - staffId (PK), name, email, administrator 
- **Student** - studentId (PK), semester, degreeId, name, age, email 
- **Teacher** - teacherId (PK), name, title, email 
- **UniversityEvents** - eventId (PK), eventName, dateStartTime, dateEndTime, isHoliday 
- **User** - userId (PK), username, password, role, roleId, function verify\_password ![ref1]
# **User Stories and Acceptance Criteria** 
## **Must-Have User Stories (12)** 
1. **As a student**, I want to be able to sign in and see information relevant to me so that I can use this app. 
1. **As a teacher**, I want to be able to sign in and see information relevant to teachers so that I can manage my classes. 
1. **As a teacher**, I want to be able to grade an assignment and have the grade automatically put in the grade sheet, so that inputting grades is easier. 
1. **As a student**, I want to be able to view my schedule for the week/semester because I need to know when and where my classes are. 
1. **As a student**, I want to only see assignments for my group, so that I don't accidentally upload to the wrong location. 
1. **As a student**, I want to see a quick schedule showing only today's events on my dashboard, so that I can immediately see important information regarding today. 
1. **As a student**, I want to see courses for my current semester only, so that it is easier to find relevant information. 
1. **As a teacher**, I want to see the courses that I am teaching and see a management menu, so that I can manage my course properly. 
1. **As a student**, I want to be able to see when my assignments are due in the schedule, so that I don't miss the deadlines. 
1. **As a student**, I want to have a chat so that I can easily message my teachers. 
1. **As a teacher**, I want to create assignments in my course and have students be able to upload text/links so that I can manage assignments properly. 
12. **As a teacher or student**, I want to be able to view my profile, so I can find quick information about myself. 

    **Should-be User stories (7):** 

13. **As a teacher**, I want to have a way of fast communication with a student as a chat, so I can receive questions directly in the app. 
13. **As a teacher,** I want to be able to create an account, so that I can use this app. 
13. **As a student**, I want to be able to create an account, so that I can use this app. 
13. **As any teacher**, I want to view a list of all students enrolled in my course with their group number, so that I can better manage class. 
13. **As a  student**, I want to be able to view my courses, so that I can know what I am doing this semester 
13. **As a user**, I want to be able to easily find a map of AGH so that I can find my classes. 
13. **As a student**, I want to be able to see my grades, so that I can understand how well I am doing. 

    **Could-be User stories (8):**

20. **As a teacher**, I want to be able to delete assignments, so that I can get rid of my mistakes. 
20. **As a user**, I want to access the FAQ section to find answers to common questions, so that I can quickly resolve my issues without contacting support. 
20. **As a student**, I want classes, assignments, events, and holidays to appear on my schedule with different colors, so it is easier to identify them 
20. **As a teacher**, I want to be able to enter my grades in both percentage (0-100) and grade (2-5) format, so that it is easier for me to grade the assignments. 
20. **As a teacher**, I want grades to be automatically calculated in AGH format if I entered a percentage, so that the two formats are interchangeable. 
20. **As a user**, I want to have both light and dark modes, so that I can see the website in different colors. 
20. **As a user**, I want to be able to find technical support contact information, so that I can contact support if I encounter any issues. 
27. **As a teacher**, when I'm in a course I teach, I want to be able to search for students by name and email so I can quickly and efficiently locate specific individuals within my course roster. 

**Acceptance Criteria Must Be** 
1. ### **Student Sign in:** 
- **Given** a student uses the website, 

  **When** the student tries to login, 

  **Then** they are presented with a username and password field. 

- **Given** a student tries to login, 

  **When** the login info is correct/incorrect, 

  **Then** either the student is logged in or a status message is shown indicating login failed. 

- **Given** a student logs in, 

  **When** the student views the website, 

  **Then** they see information relevant to them and no other role. 
2. ### **Teacher sign in:** 
- **Given** a teacher uses the website, 

  **When** the teacher tries to login, 

  **Then** they are presented with a username and password field. 

- **Given** a teacher tries to login, 

  **When** the login info is correct/incorrect, 

  **Then** either the teacher is logged in or a status message is shown indicating login failed. 

- **Given** a teacher logs in, 

  **When** the teacher views the website, 

  **Then** they see information relevant to them and no other role. 
3. ### **Teacher grade assignments:** 
- **Given** a teacher looks at an assignment, 

  **When** the teacher inputs a grade on the assignment, **Then** the grade automatically appears in the grade book. 
4. ### **Student schedule week/semester:** 
- **Given** a student is in Upsos, 

  **When** a student clicks the schedule button, 

  **Then** they see a schedule with the options to view by week or semester. 

- **Given** a student is in the schedule menu, 

  **When** a student looks at a course, 

  **Then** the student sees what time the course is and in what room. 
5. ### **Student assignment groups:** 
- **Given** a student is logged in, 

  **When** they are viewing their assignments, 

  **Then** they only see assignments for their group or assignments that have no group restriction. 
6. ### **Student todays schedule:** 
- **Given** a student is logged in, 

  **When** they look at their dashboard, 

  **Then** they see a quick schedule showing all of the classes, assignments due, and events happening today. 
7. ### **Student courses for current semester only:** 
- **Given** a student is in Upsos, 

  **When** they view their courses, 

  **Then** they see all of the courses they are registered in for their current semester only. 
8. ### **Teacher course management menu:** 
- **Given** that a teacher is logged in, 

  **When** they look at their courses, 

  **Then** the teacher is able to open a management menu. 

9. **Student assignments in schedule:** 
- **Given** a student is in Upsos, 

  **When** a student views an assignment in the schedule, 

  **Then** they can see only assignments that have a due date and are not yet submitted.
10. ### **Student chat:** 
- **Given** a student is in Upsos, 

  **When** they are clicking the chat button, 

  **Then** they can start a conversation with any student or teacher, as long as they know their ID. 
11. ### **Teacher create assignment:** 
- **Given** a teacher is logged in, 

  **When** they are in the course management menu, **Then** they can create an assignment. 
12. ### **Teacher/Student view profile:** 
- **Given** a teacher is logged in, 

  **When** they select the profile button, 

  **They** can see a profile with their information. 

- **Given** a student is logged in, 

  **When** they select the profile button, 

  **They** can see a profile with their information. 

**Should Be**
13. ### **Teacher chat:** 
- **Given** a teacher is logged in,  

  **When** the teacher navigates to the chat feature, 

  **Then** they can initiate a conversation with a student by entering their ID. 

- **Given** a teacher is in a chat, 

  **When** a new message is received, 

  **Then** the teacher can view the new message and the message history. 
14. ### **Teacher create account** 
- **Given** a teacher clicks "Register", 

  **When** the teacher’s id is in the database, **Then** they will be able to register. 
15. ### **Student create account** 
- **Given** a student clicks "Register", 

  **When** the student’s id is in the database, **Then** they will be able to register. 
16. ### **Teacher list of students in course** 
- **Given** a teacher is logged in,  

`            `**When** they navigate to the courses menu, 

`            `**Then** they can see the list of all the students enrolled with their group numbers.** 
17. ### **Student view courses** 
- **Given** a student is logged in, 

  **When** they navigate to their courses, 

  **Then** they can see a list of courses for their current semester.** 
18. ### **Map of AGH** 
- **Given** a user is logged in, 

`            `**When** they navigate to the Map page, 

`            `**Then** they can see and download the map of AGH university. 
19. ### **Student View Grades** 
- **Given** a student logs in, 

  **When** they navigate to the grades tab, 

  **Then** they can see their grades for each course in this semester. 

**Could Be**
20. ### **Teacher Delete Assignments** 
- **Given** a teacher is logged in and in the course menu, 

  **When** they click the delete button in an assignment, 

  **Then** the assignment will be removed from the list and deleted from the database. 

- **Given** a teacher is logged in, 

  **When** they try to delete an assignment, 

  **Then** they will see a confirmation dialog open to make sure that it is intentional.
21. ### **FAQ** 
- **Given** a user using UPSOS,  

  **When** they click the “FAQ”,  

  **Then** they see commonly asked questions. 
22. ### **Student Schedule Colors** 
- **Given** a student is logged in, 

  **When** the student accesses their schedule, 

  **Then** Classes, Assignments, Events, and Holidays will appear with different colors. 
23. ### **Teacher dual input grades** 
- **Given** a teacher is logged in and entering a grade for student, 

  **When** they select their preferred input method (either percentage or AGH format), **Then** the system presents the appropriate input field, allowing the teacher to enter a value within the 0-100% range or the 2.0-5.0 AGH range and if the teacher inputs a percentage, the system automatically calculates and displays the corresponding AGH grade** 
24. ### **Teacher auto calculate other grade input** 
- **Given** a teacher is logged in, 

  **When** they input a grade in AGH scale, 

  **Then** the percent grade is automatically calculated. 

- **Given** a teacher is logged in, 

  **When** they input a grade in percent scale, 

  **Then** the AGH scale grade is automatically calculated. 
25. ### **Dark/Light Mode** 
- **Given** a user is using UPSOS, 

  **When** they select the toggle button for themes, 

  **Then** the theme will switch between light mode and dark mode. 

- **Given** a user is using UPSOS, 

  **When** they try to reload the page, 

  **Then** the page will remember what theme they were using and automatically apply it. 
26. ### **Tech Support** 
- **Given** a user is on the homepage, 

  **When** they scroll down or click the help button, **Then** they will see contact info for support. 
27. ### **Teacher search students** 
- **Given** a teacher is logged in and viewing a course they teach, 

  **When** the teacher uses the student search functionality and enters a student's name, **Then** the system displays a filtered list of students matching the entered name. 

- **Given** a teacher is logged in and viewing a course they teach, 

  **When** the teacher uses the student search functionality and enters a student's email address, 

  **Then** the system displays a filtered list of students matching the entered email address. 

- **Given** a teacher is logged in and viewing a course they teach, 

  **When** the teacher uses the student search functionality and enters a partial value, **Then** the system displays all students whose relevant field contains the partial input. 

- **Given** a teacher is logged in and viewing a course they teach, and students are currently filtered by a search query, 

  **When** the teacher clears the search input field, 

  **Then** the system displays the full list of all students in that course again.
## **Constraints & UX Details** 
- **Password requirements:** minimum 8 characters, at least 1 char, at least 1 digit, 
- Name and Surname requirments: starts with capital char  
## **Security** 
- **Hashed passwords** using bcrypt with deprecated scheme handling 
- **JWT authentication** with HS256 algorithm and 30-minute token expiration 
- **Role-based access control** with user role verification 
- **Token validation** with signature and expiration verification 
- **Password requirements** enforced during authentication 
- **Input sanitization** and type conversion for security 
- **OAuth2 Bearer token** scheme implementation 
- **Error handling** with secure credential exception management 

[ref1]: Aspose.Words.cf863922-b3fc-4bf9-b242-84b55412636c.001.png
