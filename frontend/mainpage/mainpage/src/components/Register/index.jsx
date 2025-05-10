import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('student');
    const [form, setForm] = useState({
        user_id: '',
        email: '',
        password: '',
        semester: '',
        year: '',
        degree_id: '',
        age: '',
        name: '',
        title: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        let payload = {
            user_id: form.user_id,
            email: form.email,
            password: form.password,
            role: role
        };
        if (role === 'student') {
            payload = {
                ...payload,
                semester: Number(form.semester),
                year: Number(form.year),
                degree_id: Number(form.degree_id),
                age: Number(form.age)
            };
        } else {
            payload = {
                ...payload,
                name: form.name,
                title: form.title
            };
        }
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setSuccess('Registration successful! You can now log in.');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                const data = await res.json();
                setError(data.detail || 'Registration failed');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Register</h2>
                </div>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>
                            <input type="radio" name="role" value="student" checked={role === 'student'} onChange={handleRoleChange} /> Student
                        </label>
                        <label style={{ marginLeft: '1rem' }}>
                            <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={handleRoleChange} /> Teacher
                        </label>
                    </div>
                    <div className="form-group">
                        <input type="text" name="user_id" placeholder="User ID" value={form.user_id} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    </div>
                    {role === 'student' && (
                        <>
                            <div className="form-group">
                                <input type="number" name="semester" placeholder="Semester" value={form.semester} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <input type="number" name="year" placeholder="Year" value={form.year} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <input type="number" name="degree_id" placeholder="Degree ID" value={form.degree_id} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
                            </div>
                        </>
                    )}
                    {role === 'teacher' && (
                        <>
                            <div className="form-group">
                                <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
                            </div>
                        </>
                    )}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Already have an account? <a href="/login">Log in here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register; 