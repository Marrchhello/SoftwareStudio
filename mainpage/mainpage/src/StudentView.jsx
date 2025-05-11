import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaCalendarAlt, FaBook, FaGraduationCap, FaUserCircle, 
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUserTie, FaBuilding, FaUsers, FaCreditCard,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './StudentView.css';

const StudentDashboard = ({ studentData }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly');
  const [darkMode, setDarkMode] = useState(false);
  const [activeConversation, setActiveConversation] = useState(0);
  const [messageText, setMessageText] = useState('');

  // Default data structure if no provided
  const defaultData = {
    userInfo: {
      name: "John Doe",
      indexNumber: "123456",
      faculty: "Computer Science",
      semester: "Winter 2023/2024"
    },
    quickStats: {
      courses: 5,
      classesToday: 2,
      newGrades: 3,
      unreadMessages: 2
    },
    todaysClasses: [
      {
        course: "Advanced Programming",
        type: "Lecture",
        time: "10:00-12:00",
        room: "A1-205",
        lecturer: "Dr. Smith",
        roomLink: "/campus-map?room=A1-205"
      }
    ],
    weeklySchedule: {
      Monday: [
        { 
          time: "08:00-10:00", 
          course: "Advanced Programming", 
          type: "Lecture", 
          room: "A1-205", 
          lecturer: "Dr. Smith",
          roomLink: "/campus-map?room=A1-205"
        }
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    },
    semesterPlan: [
      {
        week: "Week 1 (Oct 2-8)",
        classes: [
          { 
            day: "Monday", 
            time: "08:00-10:00", 
            course: "Advanced Programming", 
            type: "Lecture", 
            room: "A1-205", 
            lecturer: "Dr. Smith",
            frequency: "Every week",
            roomLink: "/campus-map?room=A1-205"
          }
        ]
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
          { assignment: "Project 1", date: "Oct 5, 2023", grade: 5.0, weight: "20%"}
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
          { text: "Hello, I have a question about the project deadline.", sent: false, time: "10:30 AM" }
        ]
      }
    ]
  };

  // Use provided data or default data
  const data = studentData || defaultData;

  // Helper functions
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

  const countNewGrades = () => {
    return data.grades.reduce((count, course) => {
      return count + course.grades.filter(grade => grade.isNew).length;
    }, 0);
  };

  // Render views
  const renderView = () => {
    switch(activeView) {
      case 'schedule':
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
              <div className="weekly-schedule">
                <div className="week-days">
                  {Object.keys(data.weeklySchedule).map(day => (
                    <div 
                      key={day} 
                      className={`week-day ${day === new Date().toLocaleString('en-us', { weekday: 'long'}) ? 'current-day' : ''}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="day-classes">
                  {Object.entries(data.weeklySchedule).map(([day, classes]) => (
                    <div key={day} className="day-column">
                      {classes.map((cls, idx) => (
                        <div key={idx} className="class-card">
                          <h4>{cls.course}</h4>
                          <p><FaClock /> {cls.time}</p>
                          <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                          <p><FaUserTie /> {cls.lecturer}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="semester-plan">
                {data.semesterPlan.map((week, index) => (
                  <div key={index} className="semester-week">
                    <h3>{week.week}</h3>
                    {week.classes.length > 0 ? (
                      week.classes.map((cls, idx) => (
                        <div key={idx} className="class-card">
                          <h4>{cls.course}</h4>
                          <p><FaCalendarDay /> {cls.day} {cls.time} {cls.frequency && `(${cls.frequency})`}</p>
                          <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                          <p><FaUserTie /> {cls.lecturer}</p>
                        </div>
                      ))
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
      default: // Dashboard
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
                  <p>{data.quickStats.classesToday} classes</p>
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
              {data.todaysClasses.length > 0 ? (
                <div className="upcoming-classes-list">
                  {data.todaysClasses.map((cls, index) => (
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
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navigation Bar */}
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

        {/* Content */}
        <div className="content-wrapper">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
