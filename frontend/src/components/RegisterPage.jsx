import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import Banner from './Banner';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    role: 'student',
    roleId: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    digit: false,
    letter: false
  });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      digit: /\d/.test(password),
      letter: /[a-zA-Z]/.test(password)
    };
    setPasswordValidation(validation);
    return validation.length && validation.digit && validation.letter;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate role ID is 0 or greater
    const roleId = parseInt(formData.roleId);
    if (isNaN(roleId) || roleId < 0) {
      setError('Role ID must be 0 or greater');
      return;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements');
      return;
    }

    try {
      const data = await register(formData.role, roleId, formData.username, formData.password);
      setSuccess('Registration successful! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="register-page">
      <Banner />
      <div className="register-container">
        <div className="register-header">
          <h2><strong>Create Account</strong></h2>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roleId">ID</label>
            <input
              type="number"
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              placeholder="Enter your ID"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
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
            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={passwordValidation.length ? 'valid' : 'invalid'}>
                  At least 8 characters long
                </li>
                <li className={passwordValidation.digit ? 'valid' : 'invalid'}>
                  Contains at least 1 digit
                </li>
                <li className={passwordValidation.letter ? 'valid' : 'invalid'}>
                  Contains at least 1 letter
                </li>
              </ul>
            </div>
          </div>

          <button type="submit" className="register-button">
            Register
          </button>

          <div className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 