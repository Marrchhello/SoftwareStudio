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

// export api connection to be used in other files
export default api;