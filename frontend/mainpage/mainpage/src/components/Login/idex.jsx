import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const success = await login(credentials.username, credentials.password);
            if (success) {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        if (err.response.data.detail.includes('locked')) {
                            setError('Account is locked. Please try again in 15 minutes.');
                        } else {
                            setError('Invalid credentials');
                        }
                        break;
                    case 403:
                        setError('Please verify your account');
                        break;
                    default:
                        setError('An error occurred during login');
                }
            } else {
                setError('Network error occurred');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <FaSignInAlt className="login-icon" />
                    <h2>Login to UPSOS</h2>
                </div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="User ID"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-icon-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : (
                            <>
                                <FaSignInAlt className="btn-icon" /> Log In
                            </>
                        )}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;