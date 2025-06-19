import React, { useState, useEffect, useRef } from 'react'; 
import { 
  FaBell, FaCalendarAlt, FaBook, FaGraduationCap, FaUserCircle, 
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUserTie, FaBuilding, FaUsers, FaCreditCard,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa'; 
import './StudentView.css'; 
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StudentDashboard = ({ studentData }) => { 
  const [activeView, setActiveView] = useState('dashboard'); 
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly'); 
  const [darkMode, setDarkMode] = useState(false); 
  const [activeConversation, setActiveConversation] = useState(0); 
  const [messageText, setMessageText] = useState(''); 
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date())); 
  const [showTodayButton, setShowTodayButton] = useState(false); 
  const [courses, setCourses] = useState([]); 
  const [grades, setGrades] = useState([]); 
  const [allClasses, setAllClasses] = useState([]); 
  const [universityEvents, setUniversityEvents] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [userInfo, setUserInfo] = useState({
    name: "",
    roleId: null,
    user_id: null,
    faculty: "Computer Science",
    semester: "Summer 2025"
  });
  const [studentId, setStudentId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || ''); 
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChatRole, setNewChatRole] = useState('TEACHER');
  const [newChatRoleId, setNewChatRoleId] = useState('');
  const [userNames, setUserNames] = useState({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const chatMessagesRef = useRef(null);
  
  const navigate = useNavigate(); 

  // Helper function to fetch with token
  const fetchWithToken = async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return null;
      }

      const response = await api.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        navigate('/login');
        return null;
      }
      throw error;
    }
  };

  // Fetch user info from API
  const fetchUserInfo = async () => {
    try {
      // Get user's name
      const nameData = await fetchWithToken('/name');
      // Get user's role ID
      const roleIdData = await fetchWithToken('/role_id');
      // Get user's profile
      const profileData = await fetchWithToken('/me');
      
      if (nameData && roleIdData && profileData) {
        setUserInfo(prevInfo => ({
          ...prevInfo,
          name: nameData.name,
          roleId: roleIdData.role_id,
          user_id: profileData.user_id
        }));
        setStudentId(roleIdData.role_id); // Set studentId from backend
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch student data from API
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // First fetch user info (sets studentId)
      await fetchUserInfo();
    } catch (error) {
      console.error('Error fetching student data:', error);
      setLoading(false);
    }
  };

  // Fetch student-dependent data when studentId is set
  useEffect(() => {
    const fetchStudentDependentData = async () => {
      if (!studentId) return;
      try {
        // Fetch courses
        const coursesData = await fetchWithToken(`/student/${studentId}/courses`);
        console.log('coursesData:', coursesData); // Debug log
        if (coursesData) {
          // Accept both array and object-with-CourseList
          if (Array.isArray(coursesData)) {
            setCourses({ CourseList: coursesData });
          } else if (coursesData.CourseList) {
            setCourses(coursesData);
          } else {
            setCourses({ CourseList: [] });
          }
        }

        // Fetch grades
        const gradesData = await fetchWithToken(`/student/${studentId}/grades`);
        if (gradesData) {
          setGrades(gradesData);
        }

        // Fetch schedule (for classes)
        const scheduleData = await fetchWithToken(`/student/${studentId}/schedule/semester`);
        if (scheduleData) {
          // Extract classes from schedule
          const classes = scheduleData.Courses.map(course => {
            const firstClass = course.ClassSchedule.ClassTime[0];
            return {
              id: Math.random().toString(36).substr(2, 9),
              course: course.ClassSchedule.CourseName,
              type: "Class",
              time: `${new Date(firstClass.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(firstClass.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
              room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
              lecturer: "Lecturer",
              roomLink: `/campus-map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`,
              frequency: course.isBiWeekly ? "biweekly" : "weekly",
              startDate: new Date(firstClass.StartDateTime).toISOString().split('T')[0],
              endDate: new Date(firstClass.EndDateTime).toISOString().split('T')[0]
            };
          });
          setAllClasses(classes);
        }

        // Fetch university events
        const eventsData = await fetchWithToken(`/events/`);
        if (eventsData) {
          const events = eventsData.Events.map(event => ({
            "Event ID": Math.random().toString(36).substr(2, 9),
            "Event Name": event.EventName,
            "Date and Start Time": new Date(event.EventTime.StartDateTime),
            "Date and End Time": new Date(event.EventTime.EndDateTime),
            "Holiday": event.IsHoliday
          }));
          setUniversityEvents(events);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student dependent data:', error);
        setLoading(false);
      }
    };
    fetchStudentDependentData();
  }, [studentId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchStudentData();
    } else {
      navigate('/login');
    }
  }, []);

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

  function getEventsForDay(dayDate) {
    return universityEvents.filter(event => {
      const eventDate = new Date(event["Date and Start Time"]);
      return eventDate.toDateString() === dayDate.toDateString();
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

  const getGradeClass = (grade) => {
    if (!grade || grade === null) return 'grade-pending';
    if (grade >= 4.5) return 'grade-excellent';
    if (grade >= 3.5) return 'grade-good';
    if (grade >= 3.0) return 'grade-average';
    return 'grade-poor';
  };

  const getGradesByCourse = () => {
    const gradesByCourse = {};
    grades.GradeList?.forEach(grade => {
      if (!gradesByCourse[grade.Course]) {
        gradesByCourse[grade.Course] = [];
      }
      gradesByCourse[grade.Course].push(grade);
    });
    return gradesByCourse;
  };

  const calculateCourseAverage = (courseGrades) => {
    if (!courseGrades || courseGrades.length === 0) return 0;
    const validGrades = courseGrades.filter(grade => grade.Grade !== null);
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + grade.Grade, 0);
    return sum / validGrades.length;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  const getTodayClasses = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    return allClasses.filter(cls => {
      const classDay = new Date(cls.startDate).toLocaleDateString('en-US', { weekday: 'long' });
      return classDay === dayName && shouldShowClass(cls, getStartOfWeek(today));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUserName = async (userId) => {
    try {
      // Don't fetch if we already have the name
      if (userNames[userId]) {
        return userNames[userId];
      }

      const response = await api.get(`/name/${userId}`);
      console.log('Name response for user', userId, ':', response.data); // Debug log

      // The response format is { "name": "username" }
      const name = response.data?.name;

      // Handle empty string or null/undefined name
      if (!name && name !== 0) { // Include 0 check in case name is numeric
        setUserNames(prev => ({
          ...prev,
          [userId]: 'Unknown User'
        }));
        return 'Unknown User';
      }

      // Only update state if we got a valid name
      setUserNames(prev => ({
        ...prev,
        [userId]: name || 'Unknown User'
      }));
      return name || 'Unknown User';
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserNames(prev => ({
        ...prev,
        [userId]: 'Unknown User'
      }));
      return 'Unknown User';
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data && response.data.ChatList) {
        setChats(response.data.ChatList);
        
        // Fetch names for all users in chats
        const uniqueUserIds = new Set(
          response.data.ChatList.flatMap(chat => [chat.user1Id, chat.user2Id])
        );
        
        const namePromises = Array.from(uniqueUserIds)
          .filter(userId => !userNames[userId])
          .map(fetchUserName);
        
        await Promise.all(namePromises);
      } else {
        setChats([]);
        console.warn('No chats found in response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Scroll to bottom when chat changes
  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);

  const fetchChatMessages = async (chatId) => {
    try {
      setIsLoadingMessages(true);
      const response = await api.get(`/chats/${chatId}/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Always set messages, even if empty
      setChatMessages(response.data?.ChatMessageList || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Only set empty array on initial load error
      if (isInitialLoad) {
        setChatMessages([]);
      }
    } finally {
      setIsLoadingMessages(false);
      setIsInitialLoad(false);
    }
  };

  const sendMessage = async (chatId, message) => {
    try {
      console.log('Sending message:', { chatId, message }); // Debug log
      const response = await api.post(`/chats/${chatId}/messages/`, null, {
        params: { message },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Message sent response:', response.data); // Debug log
      setChatMessages(response.data.ChatMessageList || []);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const createNewChat = async () => {
    if (!newChatRoleId.trim()) {
      return;
    }
    try {
      await api.post('/chats/', null, {
        params: {
          user2_role: newChatRole,
          user2_role_id: parseInt(newChatRoleId)
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch updated chat list
      await fetchChats();
      
      // Reset form
      setNewChatRole('TEACHER');
      setNewChatRoleId('');
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  useEffect(() => {
    if (activeView === 'messages') {
      fetchChats();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeChat) {
      setIsInitialLoad(true);
      fetchChatMessages(activeChat);
    } else {
      // Clear messages when no chat is selected
      setChatMessages([]);
      setIsInitialLoad(true);
    }
  }, [activeChat]);

  useEffect(() => {
    if (activeView === 'messages' && chats.length > 0) {
      const uniqueUserIds = new Set(
        chats.flatMap(chat => [chat.user1Id, chat.user2Id])
      );
      
      uniqueUserIds.forEach(userId => {
        if (!userNames[userId]) {
          fetchUserName(userId);
        }
      });
    }
  }, [activeView, chats, userNames]);

  // Auto-refresh chat messages
  useEffect(() => {
    let intervalId;

    if (activeView === 'messages' && activeChat && !isInitialLoad) {
      // Set up interval for subsequent fetches
      intervalId = setInterval(() => {
        fetchChatMessages(activeChat);
      }, 10000); // 10 seconds
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeView, activeChat, isInitialLoad]); // Dependencies: activeView, activeChat, and isInitialLoad

  const getCurrentUserId = async () => {
    try {
      const response = await api.get('/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.user_id;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
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
                  const events = getEventsForDay(date);
                  return (
                    <div key={date.toString()} className="day-column">
                      {/* Show university events */}
                      {events.map((event, idx) => (
                        <div key={`event-${idx}`} className={`event-card ${event.Holiday ? 'holiday' : ''}`}>
                          <h4>{event["Event Name"]}</h4>
                          <p><FaClock /> {event["Date and Start Time"].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                          {event.Holiday && <span className="holiday-badge">Holiday</span>}
                        </div>
                      ))}
                      
                      {/* Show classes */}
                      {classes.map((cls, idx) => (
                        <div key={`class-${idx}`} className="class-card">
                          <h4>{cls.course}</h4>
                          <div className="time-frequency">
                            <FaClock /> {cls.time}
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
              {courses.CourseList?.length > 0 ? courses.CourseList.map(course => (
                <div key={course.ID} className="course-card">
                  <h3>{course.Course}</h3>
                  <div className="course-details">
                    <p><FaUsers /> Group {course.Group}</p>
                    <p><FaBook /> Course ID: {course.ID}</p>
                  </div>
                  <div className="course-actions">
                    <button onClick={() => navigate('/student/materials')}>
                      <FaBook /> Materials
                    </button>
                    <button onClick={() => setActiveView('grades')}>
                      <FaGraduationCap /> Grades
                    </button>
                    <button onClick={() => setActiveView('messages')}>
                      <FaEnvelope /> Chat
                    </button>
                  </div>
                </div>
              )) : <div>No courses found.</div>}
            </div>
          </div>
        );
        
      case 'grades':
        const gradesByCourse = getGradesByCourse();
        return (
          <div className="view-content">
            <h2>Your Grades</h2>
            <div className="grades-container">
              {Object.entries(gradesByCourse).map(([courseName, courseGrades]) => (
                <div key={courseName} className="course-grades">
                  <div className="course-grades-header">
                    <h3>{courseName}</h3>
                    <div className="average-grade">
                      Average: <span className={getGradeClass(calculateCourseAverage(courseGrades))}>
                        {calculateCourseAverage(courseGrades).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseGrades.map((grade, idx) => (
                        <tr key={idx}>
                          <td>{grade.Assignment || 'Pending'}</td>
                          <td className={getGradeClass(grade.Grade)}>
                            {grade.Grade !== null ? grade.Grade.toFixed(1) : 'Pending'}
                          </td>
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
              <div className="chat-sidebar">
                <div className="new-chat-form">
                  <h3>Start New Chat</h3>
                  <select 
                    value={newChatRole}
                    onChange={(e) => setNewChatRole(e.target.value)}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Enter ID"
                    value={newChatRoleId}
                    onChange={(e) => setNewChatRoleId(e.target.value)}
                  />
                  <button onClick={createNewChat}>
                    <FaPaperPlane /> Create Chat
                  </button>
                </div>
                
                <div className="chat-list">
                  {chats.map(chat => {
                    const currentUserId = parseInt(userInfo.user_id);
                    const otherUserId = parseInt(chat.user1Id) === currentUserId ? 
                      parseInt(chat.user2Id) : parseInt(chat.user1Id);
                    const otherUserName = userNames[otherUserId];
                    
                    return (
                      <div
                        key={chat.chatId}
                        className={`chat-item ${activeChat === chat.chatId ? 'active' : ''}`}
                        onClick={() => setActiveChat(chat.chatId)}
                      ><FaUserCircle className="chat-avatar"/><div className="chat-info"><span>{(otherUserName || 'Loading...').trim()}</span><small>Click to open chat</small></div></div>
                    );
                  })}
                </div>
              </div>
              
              <div className="chat-main">
                {activeChat ? (
                  <>
                    <div className="chat-messages" ref={chatMessagesRef}>
                      {chatMessages.length > 0 ? (
                        <>
                          {chatMessages.map((msg, idx) => {
                            const isCurrentUser = msg.senderName === userInfo.name;
                            return (
                              <div 
                                key={idx} 
                                className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                              >
                                <div className="message-content">
                                  <div className="message-header">
                                    <span className="sender-name">{msg.senderName}</span>
                                  </div>
                                  <p>{msg.message}</p>
                                </div>
                                <div className="message-time">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            );
                          })}
                          {isLoadingMessages && (
                            <div className="refresh-indicator">
                              <div className="loading-spinner">Refreshing...</div>
                            </div>
                          )}
                        </>
                      ) : isInitialLoad ? (
                        <div className="loading-messages">
                          <div className="loading-spinner">Loading messages...</div>
                        </div>
                      ) : (
                        <div className="no-messages">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                            e.preventDefault();
                            sendMessage(activeChat, newMessage.trim());
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newMessage.trim()) {
                            sendMessage(activeChat, newMessage.trim());
                            scrollToBottom(); // Add scroll to bottom after sending
                          }
                        }}
                        disabled={!newMessage.trim()}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <FaComments size={48} />
                    <h3>Select a chat to start messaging</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="view-content">
            <h2>University Events</h2>
            <div className="events-container">
              {universityEvents.map(event => (
                <div key={event["Event ID"]} className={`event-card ${event.Holiday ? 'holiday' : ''}`}>
                  <h3>{event["Event Name"]}</h3>
                  <p><FaCalendarAlt /> {event["Date and Start Time"].toLocaleDateString()}</p>
                  <p><FaClock /> {event["Date and Start Time"].toLocaleTimeString()} - {event["Date and End Time"].toLocaleTimeString()}</p>
                  {event.Holiday && <span className="holiday-badge">Holiday</span>}
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        const todayClasses = getTodayClasses();
        const totalCourses = courses.CourseList?.length || 0;
        const totalGrades = grades.GradeList?.length || 0;
        const upcomingEvents = universityEvents.filter(event => 
          event["Date and Start Time"] >= new Date()
        ).length;
        
        return (
          <div className="view-content">
            <section className="welcome-section">
              <h1>Welcome back, {userInfo.name}!</h1>
              <p>Faculty: {userInfo.faculty} | Semester: {userInfo.semester}</p>
            </section>
            <section className="quick-stats">
              <div className="stat-card" onClick={() => setActiveView('courses')}>
                <div className="stat-icon">
                  <FaBook />
                </div>
                <div className="stat-info">
                  <h3>Registered Courses</h3>
                  <p>{totalCourses} courses</p>
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
                  <h3>Total Grades</h3>
                  <p>{totalGrades} grades</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('events')}>
                <div className="stat-icon">
                  <FaCalendarDay />
                </div>
                <div className="stat-info">
                  <h3>Upcoming Events</h3>
                  <p>{upcomingEvents} events</p>
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
            <span className="user-name">{userInfo.name}</span>
            <span className="user-id">{userInfo.roleId}</span>
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
            className={`nav-item ${activeView === 'events' ? 'active' : ''}`}
            onClick={() => setActiveView('events')}
          >
            <div className="nav-link">
              <FaCalendarDay className="nav-icon" />
              <span>Events</span>
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
              placeholder="Search courses, events..." 
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
