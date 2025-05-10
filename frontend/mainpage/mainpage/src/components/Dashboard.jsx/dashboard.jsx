import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaCalendarAlt, FaBook, FaSignOutAlt, FaListAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('schedule');
    const [schedule, setSchedule] = useState(null);
    const [grades, setGrades] = useState(null);
    const [courses, setCourses] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        setError('');
        let url = '';
        if (activeTab === 'schedule') url = '/student/schedule';
        if (activeTab === 'grades') url = '/student/grades';
        if (activeTab === 'courses') url = '/student/courses';
        fetch(process.env.REACT_APP_API_URL + url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (activeTab === 'schedule') setSchedule(data);
                if (activeTab === 'grades') setGrades(data);
                if (activeTab === 'courses') setCourses(data);
            })
            .catch(() => setError('Failed to load data'))
            .finally(() => setLoading(false));
    }, [activeTab, token]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-brand">UPSOS</div>
                <div className="nav-user">
                    <FaUserCircle className="user-icon" />
                    <span>{user?.username || user?.email || 'User'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <aside className="dashboard-sidebar">
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
                            <FaCalendarAlt /> Schedule
                        </li>
                        <li className={activeTab === 'grades' ? 'active' : ''} onClick={() => setActiveTab('grades')}>
                            <FaListAlt /> Grades
                        </li>
                        <li className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
                            <FaBook /> Courses
                        </li>
                    </ul>
                </aside>

                <main className="dashboard-main">
                    <h1>Welcome to UPSOS</h1>
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {activeTab === 'schedule' && schedule && (
                        <div>
                            <h2>Schedule for the Week</h2>
                            {schedule.week.map(day => (
                                <div key={day.day} style={{ marginBottom: '1rem' }}>
                                    <strong>{day.day}</strong>
                                    <ul>
                                        {day.classes.map((cls, idx) => (
                                            <li key={idx}>{cls.course} ({cls.time}) - Room: {cls.room}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'grades' && grades && (
                        <div>
                            <h2>Your Grades</h2>
                            <ul>
                                {grades.grades.map((g, idx) => (
                                    <li key={idx}>{g.course}: <strong>{g.grade}</strong></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'courses' && courses && (
                        <div>
                            <h2>Courses for Semester {courses.semester}</h2>
                            <ul>
                                {courses.courses.map((c, idx) => (
                                    <li key={idx}>{c.name} (ECTS: {c.ects})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;