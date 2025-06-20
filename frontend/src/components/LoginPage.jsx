import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getUserRole, getUserRoleId } from '../api';
import Banner from './Banner';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',  
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login(formData.username, formData.password);
      localStorage.setItem('token', data.access_token);

      const roleData = await getUserRole(data.access_token);
      localStorage.setItem('role', roleData.role.toUpperCase());

      const roleIdData = await getUserRoleId(data.access_token);
      if (roleData.role.toUpperCase() === 'STUDENT') {
        localStorage.setItem('student_id', roleIdData.role_id);
        navigate('/student');
      } else if (roleData.role.toUpperCase() === 'TEACHER') {
        localStorage.setItem('teacher_id', roleIdData.role_id);
        navigate('/teacher');
      } else {
        setError('Invalid role');
        return;
      }
    } catch (err) {
      setError('Invalid username or password');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-page">
      <Banner />
      <div className="login-container">
        <div className="login-header">
          <h2><strong>Log in now</strong></h2>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label> {/* Changed from Email */}
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          <div className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
