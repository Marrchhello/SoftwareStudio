import axios from 'axios';

// Show axios where backend is
const api = axios.create({
    baseURL: "http://localhost:8000"
});

// ----------------------------------------------------------------------------
// Login and Registration
// ----------------------------------------------------------------------------

// Login function
export const login = async (username, password) => {
    const response = await api.post('/token',
        new URLSearchParams({
            username: username,
            password: password
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    );
    return response.data;
};

// Register function
export const register = async (role, roleId, username, password) => {
    const response = await api.post('/register', null, {
        params: {
            role: role,
            role_id: roleId,
            username: username,
            password: password
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// User Info
// ----------------------------------------------------------------------------

// Get user role function
export const getUserRole = async (token) => {
    const response = await api.get('/role', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get user role ID function
export const getUserRoleId = async (token) => {
    const response = await api.get('/role_id', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get user name function
export const getUserName = async (token) => {
    const response = await api.get('/name', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get user name function
export const getUserNameUserID = async (user_id, token) => {
    const response = await api.get(`/name/${user_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Courses
// ----------------------------------------------------------------------------

// Get student courses function
export const getStudentCourses = async (token) => {
    const response = await api.get(`/student/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log('getStudentCourses API response:', response.data);
    return response.data; // Return the entire response which should be StudentCourseListModel
};

// Get teacher courses function
export const getTeacherCourses = async (token) => {
    const response = await api.get(`/teacher/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.CourseList || [];
};

// Get all students for course function
export const getCourseStudents = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/students`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Grades
// ----------------------------------------------------------------------------

// Get student grades for course function
export const getStudentGradesForCourse = async (courseId, token) => {
    const response = await api.get(`/student/courses/${courseId}/grades`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher access to grades for course function
export const getStudentsGradesAsTeacher = async (courseId, studentId, token) => {
    const response = await api.get(`/course/${courseId}/student/${studentId}/grades`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get all student grades function
export const getAllStudentGrades = async (token) => {
    const response = await api.get(`/student/grades`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Post grade function
export const postGrade = async (gradeData, token) => {
    const response = await api.post('/grade/', gradeData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Assignments
// ----------------------------------------------------------------------------

// Post assignment function
export const postAssignment = async (assignmentData, token) => {
    const response = await api.post('/assignment/', assignmentData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// Get all assignments for course function (student view)
export const getCourseAssignmentsStudent = async (courseId, token) => {
    const response = await api.get(`/student/courses/${courseId}/assignments`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get all assignments for course function (teacher view)
export const getCourseAssignmentsTeacher = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/assignments`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Schedule
// ----------------------------------------------------------------------------

// Get student semester schedule function
export const getStudentSemesterSchedule = async (token) => {
    const response = await api.get(`/schedule/student/semester/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for current day
export const getCombinedScheduleDay = async (token) => {
    const response = await api.get(`/schedule/day/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for specific day
export const getCombineScheduleDayByDate = async (date, token) => {
    const response = await api.get(`/schedule/day/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for current week
export const getCombineScheduleWeek = async (token) => {
    const response = await api.get(`/schedule/week/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for specific week
export const getCombineScheduleWeekByDate = async (date, token) => {
    const response = await api.get(`/schedule/week/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for current month
export const getCombineScheduleMonth = async (token) => {
    const response = await api.get(`/schedule/month/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student or teacher schedule for specific month
export const getCombineScheduleMonthByDate = async (date, token) => {
    const response = await api.get(`/schedule/month/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// University Events
// ----------------------------------------------------------------------------

// Get university events function
export const getUniversityEvents = async (token) => {
    const response = await api.get(`/events/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get university events for specific date function
export const getUniversityEventsByDate = async (date, token) => {
    const response = await api.get(`/events/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// FAQ
// ----------------------------------------------------------------------------

// Get FAQ
export const getFAQ = async () => {
    return api.get('/faq/');
}

// ----------------------------------------------------------------------------
// Chats
// ----------------------------------------------------------------------------

// Get all chats function
export const getChats = async (token) => {
    const response = await api.get(`/chats/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get chat messages function
export const getChatMessages = async (chatId, token) => {
    const response = await api.get(`/chats/${chatId}/messages/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Post chat message function
export const postChatMessage = async (chatId, message, token) => {
    const response = await api.post(`/chats/${chatId}/messages/`, message, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Create chat function
export const createChat = async (user2Role, user2RoleId, token) => {
    const response = await api.post(`/chats/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Course Schedule View
// ----------------------------------------------------------------------------

// Get course schedule view function
export const getCourseScheduleView = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/schedule-view`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ----------------------------------------------------------------------------
// Export API
// ----------------------------------------------------------------------------

// export api connection to be used in other files
export default api;