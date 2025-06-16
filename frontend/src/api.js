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

// export api connection to be used in other files
export default api;