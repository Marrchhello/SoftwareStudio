import React, { useState, useEffect } from 'react';
import {
  FaBell, FaCalendarAlt, FaBook, FaUserTie, FaUserCircle,
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUsers, FaBuilding, FaGraduationCap,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaChalkboardTeacher
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfView.css';
import Courses from './courses';
import {
  getUserRole,
  getTeacherScheduleDay,
  getTeacherScheduleDayByDate,
  getTeacherScheduleWeek,
  getTeacherScheduleWeekByDate,
  getTeacherScheduleMonth,
  getTeacherScheduleMonthByDate
} from '../api';

const ProfDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly');
  const [darkMode, setDarkMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [allClasses, setAllClasses] = useState([]);
  const [showTodayButton, setShowTodayButton] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userInfo, setUserInfo] = useState({
    name: '',
    title: '',
    email: '',
    department: '',
    teacherId: null
  });
  const [quickStats, setQuickStats] = useState({
    courses: 0,
    upcomingClasses: 0,
    unreadMessages: 0
  });
  const [messages, setMessages] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState(null);

  const navigate = useNavigate();
  const { professorId } = useParams();

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  }

  function formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
  }

  function parseScheduleData(scheduleData) {
    if (!scheduleData || !scheduleData.Courses) return [];

    return scheduleData.Courses.flatMap(course =>
      course.ClassSchedule.ClassTime.map(classTime => ({
        id: Math.random().toString(36).substr(2, 9),
        course: course.ClassSchedule.CourseName,
        type: "Class",
        time: `${new Date(classTime.StartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-${new Date(classTime.EndDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
        group: "Group",
        startDateTime: new Date(classTime.StartDateTime),
        endDateTime: new Date(classTime.EndDateTime),
        dayOfWeek: new Date(classTime.StartDateTime).getDay(),
        roomLink: `/campus-map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`
      }))
    );
  }

  function getClassesForDay(dayDate, scheduleData) {
    if (!scheduleData) return [];

    const targetDay = dayDate.getDay();
    return scheduleData.filter(cls => cls.dayOfWeek === targetDay);
  }

  const goToToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
    setShowTodayButton(false);
  };

  useEffect(() => {
    const today = new Date();
    const currentWeek = getStartOfWeek(today);
    setShowTodayButton(currentWeekStart.getTime() !== currentWeek.getTime());
  }, [currentWeekStart]);

  const fetchUserInfo = async () => {
    try {
      const userData = await getUserRole(token);
      if (userData) {
        setUserInfo(prev => ({
          ...prev,
          teacherId: userData.user_id,
          name: userData.username || "Professor"
        }));
        return userData.user_id;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      return null;
    }
  };

  const fetchTodaySchedule = async (teacherId) => {
    try {
      const today = formatDateForAPI(new Date());
      const todaySchedule = await getTeacherScheduleDayByDate(teacherId, today, token);

      if (todaySchedule && todaySchedule.Courses) {
        const classes = todaySchedule.Courses.flatMap(course =>
          course.ClassSchedule.ClassTime.map(classTime => ({
            course: course.ClassSchedule.CourseName,
            time: new Date(classTime.StartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
            type: "Class",
            roomLink: `/campus-map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`
          }))
        );

        setTodayClasses(classes);
        setQuickStats(prev => ({ ...prev, upcomingClasses: classes.length }));
      }
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    }
  };

  const fetchWeeklySchedule = async (teacherId, weekStart = null) => {
    try {
      let scheduleData;

      if (weekStart) {
        const weekStartDate = formatDateForAPI(weekStart);
        scheduleData = await getTeacherScheduleWeekByDate(teacherId, weekStartDate, token);
      } else {
        scheduleData = await getTeacherScheduleWeek(teacherId, token);
      }

      if (scheduleData) {
        const parsedSchedule = parseScheduleData(scheduleData);
        setWeeklySchedule(parsedSchedule);
        setAllClasses(parsedSchedule);
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    }
  };

  const fetchProfessorData = async () => {
    try {
      setLoading(true);

      // Get user info and teacher ID
      const teacherId = await fetchUserInfo();
      if (!teacherId) {
        setLoading(false);
        return;
      }

      // Fetch today's schedule
      await fetchTodaySchedule(teacherId);

      // Fetch weekly schedule
      await fetchWeeklySchedule(teacherId);

      // Set placeholder data for messages and courses
      setMessages([
        {
          id: 1,
          recipient: "John Doe",
          course: "Advanced Programming",
          lastMessage: "About the project deadline...",
          messages: [
            { text: "Hello, I have a question about your assignment.", sent: false, time: "10:30 AM" }
          ]
        }
      ]);

      setQuickStats(prev => ({ ...prev, courses: 3, unreadMessages: 1 }));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching professor data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfessorData();
    } else {
      navigate('/login');
    }
  }, [professorId, token]);

  useEffect(() => {
    // Fetch weekly schedule when week changes
    if (userInfo.teacherId && currentWeekStart) {
      const today = new Date();
      const currentWeek = getStartOfWeek(today);

      if (currentWeekStart.getTime() !== currentWeek.getTime()) {
        fetchWeeklySchedule(userInfo.teacherId, currentWeekStart);
      }
    }
  }, [currentWeekStart, userInfo.teacherId]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    const newMessage = {
      text: messageText,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages];
    updatedMessages[activeConversation].messages.push(newMessage);
    setMessages(updatedMessages);
    setMessageText('');
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderScheduleView = () => {
    const weekDates = getWeekDates(currentWeekStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="view-content schedule-view">
        <h2>Teaching Schedule</h2>

        <div className="schedule-tabs">
          <button
            className={`schedule-tab ${activeScheduleTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveScheduleTab('weekly')}
          >
            <FaCalendarWeek /> Weekly
          </button>
        </div>

        <div className="week-navigation">
          <button className="nav-button" onClick={() => navigateWeek('prev')}>
            <FaChevronLeft /> Previous Week
          </button>

          {showTodayButton && (
            <button className="today-button" onClick={goToToday}>
              Today
            </button>
          )}

          <h3>
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -
            {addDays(currentWeekStart, 6).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          <button className="nav-button" onClick={() => navigateWeek('next')}>
            Next Week <FaChevronRight />
          </button>
        </div>

        <div className="weekly-schedule">
          <div className="week-days">
            {weekDates.map(date => (
              <div
                key={date.toString()}
                className={`week-day ${date.toDateString() === today.toDateString() ? 'current-day' : ''}`}
              >
                {formatDate(date)}
              </div>
            ))}
          </div>

          <div className="day-classes">
            {weekDates.map(date => {
              const classes = getClassesForDay(date, weeklySchedule);
              return (
                <div key={date.toString()} className="day-column">
                  {classes.map((cls, idx) => (
                    <div key={idx} className="class-card">
                      <h4>{cls.course} ({cls.group})</h4>
                      <div className="time-frequency">
                        <FaClock /> {cls.time}
                      </div>
                      <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="view-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      );
    }

    switch (activeView) {
      case 'schedule':
        return renderScheduleView();
      case 'courses':
        return (
          <div className="view-content">
            <h2>Your Courses</h2>
            <div className="courses-list">
              {courses.map(course => (
                <div key={course.ID} className="course-card">
                  <h3>{course.Course}</h3>
                  <div className="course-details">
                    <p><FaBook /> Course ID: {course.ID}</p>
                  </div>
                  <div className="course-actions">
                    <button onClick={() => {
                      setSelectedCourse(course.ID);
                      setActiveView('course-detail');
                    }}>
                      <FaChalkboardTeacher /> Manage Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="view-content">
            <h2>Messages</h2>
            <div className="messages-container">
              <div className="conversations-list">
                {messages.map((conv, idx) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${activeConversation === idx ? 'active' : ''}`}
                    onClick={() => setActiveConversation(idx)}
                  >
                    <h4>{conv.recipient}</h4>
                    <p>{conv.course}</p>
                    <p className="conversation-preview">{conv.lastMessage}</p>
                  </div>
                ))}
              </div>
              <div className="message-area">
                <div className="messages-list">
                  {messages[activeConversation]?.messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sent ? 'sent' : ''}`}>
                      <p>{msg.text}</p>
                      <small>{msg.time}</small>
                    </div>
                  ))}
                </div>
                <div className="message-input">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button onClick={sendMessage}><FaPaperPlane /></button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'course-detail':
        return (
          <div className="view-content">
            <button
              className="back-button"
              onClick={() => {
                setSelectedCourse(null);
                setActiveView('courses');
              }}
            >
              <FaChevronLeft /> Back to Courses
            </button>
            <Courses courseId={selectedCourse} />
          </div>
        );

      default:
        return (
          <div className="view-content">
            <section className="welcome-section">
              <h1>Welcome, Professor {userInfo.name}!</h1>
              <p>Department: {userInfo.department} | Email: {userInfo.email}</p>
            </section>
            <section className="quick-stats">
              <div className="stat-card" onClick={() => setActiveView('courses')}>
                <div className="stat-icon">
                  <FaBook />
                </div>
                <div className="stat-info">
                  <h3>Teaching Courses</h3>
                  <p>{quickStats.courses} courses</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('schedule')}>
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <h3>Today's Classes</h3>
                  <p>{quickStats.upcomingClasses} classes</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('messages')}>
                <div className="stat-icon">
                  <FaEnvelope />
                </div>
                <div className="stat-info">
                  <h3>Unread Messages</h3>
                  <p>{quickStats.unreadMessages} conversations</p>
                </div>
              </div>
            </section>
            <section className="upcoming-classes">
              <h2>Today's Classes</h2>
              {todayClasses.length > 0 ? (
                <div className="upcoming-classes-list">
                  {todayClasses.map((cls, index) => (
                    <div key={index} className="upcoming-class-card">
                      <h3>{cls.course}</h3>
                      <p><FaClock /> {cls.time}</p>
                      <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No classes today</p>
              )}
            </section>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <FaUserCircle className="user-icon" />
          <div className="user-info">
            <span className="user-name">Prof. {userInfo.name}</span>
            <span className="user-title">{userInfo.title}</span>
          </div>
        </div>
        <ul className="nav-menu">
          <li
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <div className="nav-link">
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </div>
          </li>
          <li
            className={`nav-item ${activeView === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveView('schedule')}
          >
            <div className="nav-link">
              <FaCalendarAlt className="nav-icon" />
              <span>Schedule</span>
            </div>
          </li>
          <li
            className={`nav-item ${activeView === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveView('courses')}
          >
            <div className="nav-link">
              <FaBook className="nav-icon" />
              <span>My Courses</span>
            </div>
          </li>
          <li
            className={`nav-item ${activeView === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveView('messages')}
          >
            <div className="nav-link">
              <FaEnvelope className="nav-icon" />
              <span>Messages</span>
            </div>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-nav">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search courses, students..."
            />
            <button><FaSearch /></button>
          </div>
          <div className="nav-right">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <FaUserCircle className="profile-icon" />
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default ProfDashboard;