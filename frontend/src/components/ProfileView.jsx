import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaIdCard, FaGraduationCap, FaBuilding, FaCalendarAlt, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api.js';
import './ProfileView.css';

const ProfileView = ({ onBack, userType = 'student' }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    roleId: '',
    role: '',
    title: '',
    semester: '',
    degreeId: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get profile data from the /profile endpoint
      const profileData = await getUserProfile(token);
      
      console.log('Profile data fetched:', profileData);

      setUserInfo(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set empty values instead of leaving them undefined
      setUserInfo({
        name: '',
        email: '',
        roleId: '',
        role: '',
        title: '',
        semester: '',
        degreeId: ''
      });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('student_id');
    localStorage.removeItem('teacher_id');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-view">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          <FaTimes /> Back
        </button>
        <h1>Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <FaUser className="avatar-icon" />
          <h2>{userInfo.name || 'Unknown'}</h2>
          <p className="user-role">{userType === 'teacher' ? 'Professor' : 'Student'}</p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="detail-item">
              <FaUser className="detail-icon" />
              <div className="detail-content">
                <label>Full Name</label>
                <span>{userInfo.name || 'Not set'}</span>
              </div>
            </div>

            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <label>Email</label>
                <span>{userInfo.email || 'Not set'}</span>
              </div>
            </div>

            <div className="detail-item">
              <FaIdCard className="detail-icon" />
              <div className="detail-content">
                <label>ID Number</label>
                <span>{userInfo.roleId || 'Not set'}</span>
              </div>
            </div>
          </div>

          {userType === 'teacher' && userInfo.title && (
            <div className="detail-section">
              <h3>Professional Information</h3>
              <div className="detail-item">
                <FaGraduationCap className="detail-icon" />
                <div className="detail-content">
                  <label>Title</label>
                  <span>{userInfo.title}</span>
                </div>
              </div>
            </div>
          )}

          {userType === 'student' && userInfo.semester && (
            <div className="detail-section">
              <h3>Academic Information</h3>
              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div className="detail-content">
                  <label>Semester</label>
                  <span>{userInfo.semester}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 