import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaCalendarAlt, FaBook, FaGraduationCap, FaUserCircle, 
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUserTie, FaBuilding, FaUsers, FaCreditCard,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import './StudentView.css';

const StudentDashboard = ({ studentData }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly');
  const [darkMode, setDarkMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [allClasses, setAllClasses] = useState([]);
  const [showTodayButton, setShowTodayButton] = useState(false);

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

  function getClassesForSemesterDay(dayName) {
    return allClasses.filter(cls => {
      const classDay = new Date(cls.startDate).toLocaleDateString('en-US', { weekday: 'long' });
      return classDay === dayName;
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

  const defaultData = {
    userInfo: {
      name: "Jack Smith",
      indexNumber: "123456",
      faculty: "Computer Science",
      semester: "Summer 2025"
    },
    quickStats: {
      courses: 6,
      newGrades: 3,
      unreadMessages: 2
    },
    allClasses: [
      {
        id: 1,
        course: "Advanced Programming",
        type: "Lecture",
        time: "08:00-10:00",
        room: "A1-205",
        lecturer: "Dr. Smith",
        roomLink: "/campus-map?room=A1-205",
        frequency: "weekly",
        startDate: "2025-05-19",
        endDate: "2025-08-18"
      },
      {
        id: 2,
        course: "Database Systems",
        type: "Lab",
        time: "14:00-16:00",
        room: "B2-101",
        lecturer: "Dr. Johnson",
        roomLink: "/campus-map?room=B2-101",
        frequency: "biweekly",
        startDate: "2025-05-19",
        endDate: "2025-08-18"
      },
      {
        id: 3,
        course: "Software Engineering",
        type: "Seminar",
        time: "09:00-11:00",
        room: "C3-301",
        lecturer: "Dr. Williams",
        roomLink: "/campus-map?room=C3-301",
        frequency: "weekly",
        startDate: "2025-05-20",
        endDate: "2025-08-19"
      },
      {
        id: 4,
        course: "Network Security",
        type: "Lecture",
        time: "10:00-12:00",
        room: "D4-402",
        lecturer: "Dr. Davis",
        roomLink: "/campus-map?room=D4-402",
        frequency: "biweekly",
        startDate: "2025-05-21",
        endDate: "2025-08-17"
      },
      {
        id: 5,
        course: "Cloud Computing",
        type: "Lab",
        time: "13:00-15:00",
        room: "E5-105",
        lecturer: "Dr. Wilson",
        roomLink: "/campus-map?room=E5-105",
        frequency: "weekly",
        startDate: "2025-05-22",
        endDate: "2025-08-18"
      },
      {
        id: 6,
        course: "AI Fundamentals",
        type: "Seminar",
        time: "11:00-13:00",
        room: "F6-201",
        lecturer: "Dr. Taylor",
        roomLink: "/campus-map?room=F6-201",
        frequency: "biweekly",
        startDate: "2025-05-23",
        endDate: "2025-08-16"
      }
    ],
    courses: [
      { 
        id: 1,
        name: 'Advanced Programming', 
        code: 'CS101', 
        lecturer: 'Dr. Smith',
        building: 'A1',
        room: '205',
        group: 'Group 3',
        credits: 6,
        schedule: 'Mon 8:00-10:00, Thu 14:00-16:00',
        roomLink: '/campus-map?room=A1-205'
      }
    ],
    grades: [
      {
        course: "Advanced Programming",
        average: 5,
        grades: [
          { assignment: "Project 1", date: "May 5, 2025", grade: 5.0, weight: "20%"}
        ]
      }
    ],
    messages: [
      {
        id: 1,
        recipient: "Dr. Smith",
        course: "Advanced Programming",
        lastMessage: "About the project deadline...",
        messages: [
          { text: "Hello, I have a question about your assignment.", sent: false, time: "10:30 AM" }
        ]
      }
    ]
  };

  const data = studentData || defaultData;

  useEffect(() => {
    setAllClasses(data.allClasses || []);
  }, [data]);

  const getGradeClass = (grade) => {
    if (grade >= 4.5) return 'grade-excellent';
    if (grade >= 3.5) return 'grade-good';
    if (grade >= 3.0) return 'grade-average';
    return 'grade-poor';
  };

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
    
    data.messages[activeConversation].messages.push(newMessage);
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
        <h2>Your Schedule</h2>
        
        <div className="schedule-tabs">
          <button 
            className={`schedule-tab ${activeScheduleTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveScheduleTab('weekly')}
          >
            <FaCalendarWeek /> Weekly
          </button>
          <button 
            className={`schedule-tab ${activeScheduleTab === 'semester' ? 'active' : ''}`}
            onClick={() => setActiveScheduleTab('semester')}
          >
            <FaCalendar /> Semester Plan
          </button>
        </div>
        
        {activeScheduleTab === 'weekly' ? (
          <>
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
                          <h4>{cls.course}</h4>
                          <div className="time-frequency">
                            <FaClock  /> { cls.time}
                            
                          </div>
                          <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                          <p><FaUserTie /> {cls.lecturer}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="semester-plan-grid">
            <div className="week-days">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="week-day">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="day-classes">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const classes = getClassesForSemesterDay(day);
                return (
                  <div key={day} className="day-column">
                    {classes.map((cls, idx) => (
                      <div key={`${cls.id}-${idx}`} className="class-card">
                        <h4>{cls.course}</h4>
                        <div className="time-frequency">
                          <FaClock /> {cls.time}
                          <span className="frequency-tag">{cls.frequency}</span>
                        </div>
                        <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                        <p><FaUserTie /> {cls.lecturer}</p>
                        <p className="date-range">
                          {new Date(cls.startDate).toLocaleDateString()} - {new Date(cls.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderView = () => {
    switch(activeView) {
      case 'schedule':
        return renderScheduleView();
      case 'courses':
        return (
          <div className="view-content">
            <h2>Your Courses</h2>
            <div className="courses-list">
              {data.courses.map(course => (
                <div key={course.id} className="course-card">
                  <h3>{course.name} ({course.code})</h3>
                  <div className="course-details">
                    <p><FaUserTie /> {course.lecturer}</p>
                    <p><FaBuilding /> {course.building},{course.room}</p>
                    <p><FaUsers /> {course.group}</p>
                    <p><FaCreditCard /> {course.credits} ECTS</p>
                    <p><FaCalendarAlt /> {course.schedule}</p>
                  </div>
                  <div className="course-actions">
                    <button><FaBook /> Materials</button>
                    <button onClick={() => setActiveView('grades')}>
                      <FaGraduationCap /> Grades
                    </button>
                    <button onClick={() => setActiveView('messages')}>
                      <FaEnvelope /> Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="view-content">
            <h2>Your Grades</h2>
            <div className="grades-container">
              {data.grades.map((course, index) => (
                <div key={index} className="course-grades">
                  <div className="course-grades-header">
                    <h3>{course.course}</h3>
                    <div className="average-grade">
                      Average: <span className={getGradeClass(course.average)}>{course.average.toFixed(1)}</span>
                    </div>
                  </div>
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Date</th>
                        <th>Grade</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.grades.map((grade, idx) => (
                        <tr key={idx}>
                          <td>{grade.assignment}</td>
                          <td>{grade.date}</td>
                          <td className={getGradeClass(grade.grade)}>{grade.grade.toFixed(1)}</td>
                          <td>{grade.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                {data.messages.map((conv, idx) => (
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
                  {data.messages[activeConversation]?.messages.map((msg, idx) => (
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
      default:
        const todayClasses = getCurrentWeekClasses().filter(cls => cls.isToday);
        return (
          <div className="view-content">
            <section className="welcome-section">
              <h1>Welcome back, {data.userInfo.name}!</h1>
              <p>Faculty: {data.userInfo.faculty} | Semester: {data.userInfo.semester}</p>
            </section>
            <section className="quick-stats">
              <div className="stat-card" onClick={() => setActiveView('courses')}>
                <div className="stat-icon">
                  <FaBook />
                </div>
                <div className="stat-info">
                  <h3>Registered Courses</h3>
                  <p>{data.quickStats.courses} courses</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('schedule')}>
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <h3>Today's Classes</h3>
                  <p>{todayClasses.length} classes</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('grades')}>
                <div className="stat-icon">
                  <FaGraduationCap />
                </div>
                <div className="stat-info">
                  <h3>New Grades</h3>
                  <p>{data.quickStats.newGrades} updates</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('messages')}>
                <div className="stat-icon">
                  <FaEnvelope />
                </div>
                <div className="stat-info">
                  <h3>Unread Messages</h3>
                  <p>{data.quickStats.unreadMessages} conversations</p>
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
                      <p><FaUserTie /> {cls.lecturer}</p>
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
            <span className="user-name">{data.userInfo.name}</span>
            <span className="user-id">{data.userInfo.indexNumber}</span>
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
              <span>Courses</span>
            </div>
          </li>
          <li 
            className={`nav-item ${activeView === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveView('grades')}
          >
            <div className="nav-link">
              <FaGraduationCap className="nav-icon" />
              <span>Grades</span>
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
          <button className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-nav">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search courses, announcements..." 
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

export default StudentDashboard;
