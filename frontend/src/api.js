import axios from 'axios';

// Show axios where backend is
const api = axios.create({
    baseURL: "http://localhost:8000"
});

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

// Get teacher courses function
export const getTeacherCourses = async (teacherId, token) => {
    const response = await api.get(`/teacher/${teacherId}/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.TeacherCourseList || [];
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


export const getTeacherScheduleDay = async (teacherId, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/day/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher schedule for specific day
export const getTeacherScheduleDayByDate = async (teacherId, date, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/day/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher schedule for current week
export const getTeacherScheduleWeek = async (teacherId, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/week/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher schedule for specific week
export const getTeacherScheduleWeekByDate = async (teacherId, date, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/week/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher schedule for current month
export const getTeacherScheduleMonth = async (teacherId, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/month/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get teacher schedule for specific month
export const getTeacherScheduleMonthByDate = async (teacherId, date, token) => {
    const response = await api.get(`/teacher/${teacherId}/schedule/month/${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get course students
export const getCourseStudents = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/students`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get course assignments
export const getCourseAssignments = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/assignments`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student grades for course (student endpoint)
export const getStudentGradesForCourse = async (studentId, courseId, token) => {
    const response = await api.get(`/student/${studentId}/courses/${courseId}/grades`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get student grades for course (teacher endpoint)
export const getTeacherStudentGradesForCourse = async (courseId, studentId, token) => {
    const response = await api.get(`/course/${courseId}/student/${studentId}/grades`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Post grade
export const postGrade = async (gradeData, token) => {
    const response = await api.post('/grade/', gradeData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// Post assignment
export const postAssignment = async (assignmentData, token) => {
    const response = await api.post('/assignment/', assignmentData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// Get course schedule view
export const getCourseScheduleView = async (courseId, token) => {
    const response = await api.get(`/course/${courseId}/schedule-view`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const faq = async () => {
    return api.get('/faq/');
}

// export api connection to be used in other files
export default api;