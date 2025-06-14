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
  const [userInfo, setUserInfo] = useState(null);
  const [quickStats, setQuickStats] = useState({
    courses: 0,
    upcomingClasses: 0,
    unreadMessages: 0
  });
  const [messages, setMessages] = useState([]);

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

  function shouldShowClass(cls, weekStart) {
    const classDate = new Date(cls.startDate);
    const weekEnd = addDays(weekStart, 6);
    
    if (new Date(cls.endDate) < weekStart) return false;
    if (classDate > weekEnd) return false;
    
    const classDay = classDate.toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
      const dateToCheck = addDays(currentDate, i);
      const dateDay = dateToCheck.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (classDay === dateDay) {
        if (cls.frequency === 'weekly') return true;
        if (cls.frequency === 'biweekly') {
          const weeksBetween = Math.floor((dateToCheck - classDate) / (7 * 24 * 60 * 60 * 1000));
          return weeksBetween % 2 === 0;
        }
      }
    }
    
    return false;
  }

  function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  }

  function getClassesForDay(dayDate) {
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
    return allClasses.filter(cls => {
      const classDay = new Date(cls.startDate).toLocaleDateString('en-US', { weekday: 'long' });
      return classDay === dayName && shouldShowClass(cls, currentWeekStart);
    });
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

  const fetchWithToken = async (url, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  };

  const fetchProfessorData = async () => {
    try {
      setLoading(true);
      
      // Fetch user info
      const userResponse = await fetchWithToken('/me');
      if (userResponse) {
        setUserInfo({
          name: "Dr. Smith", // Tymczasowe, do wymiany na dane z backendu
          title: "Professor",
          department: "Computer Science",
          email: "smith@university.edu"
        });
      }
      
      // Fetch courses
      const coursesData = await fetchWithToken(`/teacher/${professorId}/courses`);
      if (coursesData) {
        setCourses(coursesData.CourseList || []);
        setQuickStats(prev => ({ ...prev, courses: coursesData.CourseList?.length || 0 }));
      }
      
      // Fetch schedule for representative classes
      const scheduleData = await fetchWithToken(`/teacher/${professorId}/schedule/semester`);
      if (scheduleData) {
        const classes = scheduleData.Courses.map(course => {
          const firstClass = course.ClassSchedule.ClassTime[0];
          return {
            id: Math.random().toString(36).substr(2, 9),
            course: course.ClassSchedule.CourseName,
            type: "Class",
            time: `${new Date(firstClass.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(firstClass.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
            group: "Group", // Tymczasowe, do wymiany na dane z backendu
            frequency: course.isBiWeekly ? "biweekly" : "weekly",
            startDate: new Date(firstClass.StartDateTime).toISOString().split('T')[0],
            endDate: new Date(firstClass.EndDateTime).toISOString().split('T')[0],
            roomLink: `/campus-map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`
          };
        });
        setAllClasses(classes);
      }
      
      // Fetch today's classes (for quick stats)
      const today = new Date().toISOString().split('T')[0];
      const todaySchedule = await fetchWithToken(`/teacher/${professorId}/schedule/day/${today}`);
      if (todaySchedule) {
        setQuickStats(prev => ({ ...prev, upcomingClasses: todaySchedule.Courses.length }));
      }
      
      // Fetch messages (placeholder)
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

  const getCurrentWeekClasses = () => {
    const weekDates = getWeekDates(currentWeekStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return weekDates.flatMap(date => {
      const classes = getClassesForDay(date);
      return classes.map(cls => ({
        ...cls,
        date: date,
        isToday: date.toDateString() === today.toDateString()
      }));
    });
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
              const classes = getClassesForDay(date);
              return (
                <div key={date.toString()} className="day-column">
                  {classes.map((cls, idx) => (
                    <div key={idx} className="class-card">
                      <h4>{cls.course} ({cls.group})</h4>
                      <div className="time-frequency">
                        <FaClock  /> { cls.time}
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

    switch(activeView) {
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
        const todayClasses = getCurrentWeekClasses().filter(cls => cls.isToday);
        return (
          <div className="view-content">
            <section className="welcome-section">
              <h1>Welcome, Professor {userInfo?.name}!</h1>
              <p>Department: {userInfo?.department} | Email: {userInfo?.email}</p>
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
                      <h3>{cls.course} ({cls.group})</h3>
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <FaUserCircle className="user-icon" />
          <div className="user-info">
            <span className="user-name">Prof. {userInfo?.name}</span>
            <span className="user-title">{userInfo?.title}</span>
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
