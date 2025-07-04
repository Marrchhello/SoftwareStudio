import React, { useState, useEffect, useRef } from 'react';
import {
  FaBell, FaCalendarAlt, FaBook, FaUserTie, FaUserCircle,
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUsers, FaBuilding, FaGraduationCap,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaChalkboardTeacher,
  FaTimes, FaPlus
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDarkMode } from '../DarkModeContext';
import './ProfView.css';
import Courses from './courses';
import api, {
  getUserRole,
  getUserRoleId,
  getUserName,
  getCombinedScheduleDay,
  getCombineScheduleDayByDate,
  getCombineScheduleWeek,
  getCombineScheduleWeekByDate,
  getCombineScheduleMonth,
  getCombineScheduleMonthByDate,
  getTeacherCourses,
  getUniversityEvents,
  getChats,
  getChatMessages,
  postChatMessage,
  createChat,
  getUserNameUserID
} from '../api';
import ProfileView from './ProfileView.jsx';

const ProfDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly');
  const { darkMode, toggleDarkMode } = useDarkMode();
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
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChatRole, setNewChatRole] = useState('STUDENT');
  const [newChatRoleId, setNewChatRoleId] = useState('');
  const [userNames, setUserNames] = useState({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const chatMessagesRef = useRef(null);
  const [universityEvents, setUniversityEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weeklyScheduleData, setWeeklyScheduleData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

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

  function getClassesForDay(dayDate) {
    if (!weeklyScheduleData || !weeklyScheduleData.Courses) return [];
    
    return weeklyScheduleData.Courses.flatMap(course =>
      course.ClassSchedule.ClassTime
        .filter(classTime => {
          const classDate = new Date(classTime.StartDateTime);
          return classDate.toDateString() === dayDate.toDateString();
        })
        .map(classTime => ({
          id: Math.random().toString(36).substr(2, 9),
          course: course.ClassSchedule.CourseName,
          type: "Class",
          time: `${new Date(classTime.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(classTime.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
          group: "Group",
          lecturer: "Professor",
          roomLink: `/map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`,
          startDateTime: new Date(classTime.StartDateTime),
          endDateTime: new Date(classTime.EndDateTime)
        }))
    );
  }

  function getEventsForDay(dayDate) {
    if (!weeklyScheduleData || !weeklyScheduleData.Events) return [];
    
    return weeklyScheduleData.Events.filter(event => {
      const eventDate = new Date(event.EventTime?.StartDateTime || event.StartDateTime);
      return eventDate.toDateString() === dayDate.toDateString();
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

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [darkMode]);

  const fetchUserInfo = async () => {
    try {
      const userData = await getUserRole(token);
      const roleIdData = await getUserRoleId(token);
      
      if (userData && roleIdData) {
        // Get user's name
        const nameResponse = await getUserName(token);
        
        setUserInfo(prev => ({
          ...prev,
          teacherId: roleIdData.role_id,
          name: nameResponse?.name || "Professor",
          role: userData.role
        }));
        return roleIdData.role_id;
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
      const todaySchedule = await getCombineScheduleDayByDate(token);

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
        scheduleData = await getCombineScheduleWeekByDate(weekStartDate, token);
      } else {
        scheduleData = await getCombineScheduleWeek(token);
      }

      if (scheduleData) {
        setWeeklyScheduleData(scheduleData);
        
        // Extract events from the weekly schedule for the weekly schedule view
        if (scheduleData.Events) {
          const weeklyEvents = scheduleData.Events.map(event => ({
            "Event ID": Math.random().toString(36).substr(2, 9),
            "Event Name": event.EventName,
            "Date and Start Time": new Date(event.EventTime.StartDateTime),
            "Date and End Time": new Date(event.EventTime.EndDateTime),
            "Holiday": event.IsHoliday,
            // Keep both formats for compatibility
            EventName: event.EventName,
            EventTime: event.EventTime,
            IsHoliday: event.IsHoliday
          }));
          setUniversityEvents(weeklyEvents);
        } else {
          setUniversityEvents([]);
        }
        
        // Extract and parse classes for backward compatibility
        const parsedClasses = parseScheduleData(scheduleData);
        setAllClasses(parsedClasses);
        setWeeklySchedule(parsedClasses);
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Fetch university events from today onwards (for Events tab only)
  const fetchUniversityEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const eventsData = await getUniversityEvents(token);
      
      if (eventsData && eventsData.Events) {        
        if (eventsData.Events.length > 0) {
          const events = eventsData.Events.map(event => {
            return {
              "Event ID": Math.random().toString(36).substr(2, 9),
              "Event Name": event.EventName,  
              "Date and Start Time": new Date(event.EventTime.StartDateTime),
              "Date and End Time": new Date(event.EventTime.EndDateTime),
              "Holiday": event.IsHoliday
            };
          });
          setUpcomingEvents(events);
        } else {
          setUpcomingEvents([]);
        }
      } else {
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setUpcomingEvents([]);
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

      // Fetch teacher's courses
      const teacherCoursesResponse = await getTeacherCourses(token);
      
      // The getTeacherCourses function already returns the CourseList array
      setCourses(teacherCoursesResponse);
      setQuickStats(prev => ({ ...prev, courses: teacherCoursesResponse.length }));

      // Fetch today's schedule
      await fetchTodaySchedule(teacherId);

      // Fetch weekly schedule
      await fetchWeeklySchedule(teacherId);

      // Fetch chats if we're on the messages view
      if (activeView === 'messages') {
        await fetchChats();
      }

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
    if (currentWeekStart) {
      fetchWeeklySchedule(userInfo.teacherId, currentWeekStart);
    }
  }, [currentWeekStart]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('teacher_id');
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfile(true);
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

  const fetchUserName = async (userId) => {
    try {
      if (userNames[userId]) {
        return userNames[userId];
      }

      const nameData = await getUserNameUserID(userId, token);
      const name = nameData?.name;

      if (!name && name !== 0) {
        setUserNames(prev => ({
          ...prev,
          [userId]: 'Unknown User'
        }));
        return 'Unknown User';
      }

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
      const chatsData = await getChats(token);
      if (chatsData && chatsData.ChatList) {
        setChats(chatsData.ChatList);
        
        const uniqueUserIds = new Set(
          chatsData.ChatList.flatMap(chat => [chat.user1Id, chat.user2Id])
        );
        
        const namePromises = Array.from(uniqueUserIds)
          .filter(userId => !userNames[userId])
          .map(fetchUserName);
        
        await Promise.all(namePromises);

        // Update unread messages count for quick stats
        setQuickStats(prev => ({
          ...prev,
          unreadMessages: chatsData.ChatList.length
        }));
      } else {
        setChats([]);
        console.warn('No chats found in response:', chatsData);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      setIsLoadingMessages(true);
      // Clear messages immediately when switching chats to prevent old messages from showing
      setChatMessages([]);
      const messagesData = await getChatMessages(chatId, token);
      setChatMessages(messagesData?.ChatMessageList || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Always clear messages on error, regardless of initial load state
      setChatMessages([]);
    } finally {
      setIsLoadingMessages(false);
      setIsInitialLoad(false);
    }
  };

  const sendMessage = async (chatId, message) => {
    try {
      const messageData = await postChatMessage(chatId, message, token);
      setChatMessages(messageData.ChatMessageList || []);
      setNewMessage('');
      scrollToBottom();
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
      const chatData = await createChat(newChatRole, parseInt(newChatRoleId), token);
      setNewChatRole('STUDENT');
      setNewChatRoleId('');
      await fetchChats(); // Refresh chats list
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  // Effect for fetching chats when switching to messages view
  useEffect(() => {
    if (activeView === 'messages' && token) {
      fetchChats();
    }
  }, [activeView]);

  // Effect for fetching messages when selecting a chat
  useEffect(() => {
    if (activeChat) {
      setIsInitialLoad(true);
      fetchChatMessages(activeChat);
    } else {
      setChatMessages([]);
      setIsInitialLoad(true);
    }
  }, [activeChat]);

  // Effect for auto-refreshing messages
  useEffect(() => {
    let intervalId;

    if (activeView === 'messages' && activeChat && !isInitialLoad) {
      intervalId = setInterval(() => {
        fetchChatMessages(activeChat);
      }, 10000); // 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeView, activeChat, isInitialLoad]);

  // Refresh events when Events tab is opened
  useEffect(() => {
    if (activeView === 'events') {
      fetchUniversityEvents();
    }
  }, [activeView]);

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
              const events = getEventsForDay(date);
              return (
                <div key={date.toString()} className="day-column">
                  {/* Show university events */}
                  {events.map((event, idx) => (
                    <div key={`event-${idx}`} className={`event-card ${event.Holiday || event.IsHoliday ? 'holiday' : ''}`}>
                      <h4>{event.EventName}</h4>
                      <p><FaClock /> {new Date(event.EventTime?.StartDateTime || event.StartDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                      {(event.Holiday || event.IsHoliday) && <span className="holiday-badge">Holiday</span>}
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
                  
                  {/* Show "No classes" message if both classes and events are empty */}
                  {classes.length === 0 && events.length === 0 && (
                    <div className="no-classes">
                      <p>No classes</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMessagesView = () => {
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
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
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
                const currentUserId = parseInt(userInfo.teacherId);
                const otherUserId = parseInt(chat.user1Id) === currentUserId ? 
                  parseInt(chat.user2Id) : parseInt(chat.user1Id);
                const otherUserName = userNames[otherUserId];
                
                return (
                  <div
                    key={chat.chatId}
                    className={`chat-item ${activeChat === chat.chatId ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat.chatId)}
                  >
                    <FaUserCircle className="chat-avatar"/>
                    <div className="chat-info">
                      <span>{(otherUserName || 'Loading...').trim()}</span>
                      <small>Click to open chat</small>
                    </div>
                  </div>
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
                        const currentMsgDate = new Date(msg.timestamp);
                        const previousMsgDate = idx > 0 ? new Date(chatMessages[idx - 1].timestamp) : null;
                        
                        // Check if we need to show a date separator
                        const showDateSeparator = !previousMsgDate || 
                          currentMsgDate.toDateString() !== previousMsgDate.toDateString();
                        
                        return (
                          <React.Fragment key={idx}>
                            {showDateSeparator && (
                              <div className="date-separator">
                                <span className="date-separator-text">
                                  {currentMsgDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}
                            <div className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                              <div className="message-content">
                                <div className="message-header">
                                  <span className="sender-name">{msg.senderName}</span>
                                </div>
                                <p>{msg.message}</p>
                              </div>
                              <div className="message-time">
                                {currentMsgDate.toLocaleDateString() === new Date().toLocaleDateString() 
                                  ? currentMsgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : `${currentMsgDate.toLocaleDateString()} ${currentMsgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                }
                              </div>
                            </div>
                          </React.Fragment>
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
                        scrollToBottom();
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
              {courses && courses.length > 0 ? courses.map((course, index) => {
                return (
                  <div key={course.ID || index} className="course-card">
                    <h3>{course.Course || 'Unknown Course'}</h3>
                    <div className="course-details">
                      <p><FaBook /> Course ID: {course.ID || 'N/A'}</p>
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
                );
              }) : (
                <div className="no-courses">
                  <p>No courses found. Loading...</p>
                </div>
              )}
            </div>
          </div>
        );

              case 'events':          
          return (
            <div className="view-content">
              <h2>University Events</h2>
              {loading ? (
                <div className="loading-spinner">Loading events...</div>
              ) : (
                <div className="events-container">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => {
                    return (
                      <div key={event["Event ID"]} className={`event-card ${event.Holiday ? 'holiday' : ''}`}>
                        <h3>{event["Event Name"]}</h3>
                        <p><FaCalendarAlt /> {event["Date and Start Time"].toLocaleDateString()}</p>
                        <p><FaClock /> {event["Date and Start Time"].toLocaleTimeString()} - {event["Date and End Time"].toLocaleTimeString()}</p>
                        {event.Holiday && <span className="holiday-badge">Holiday</span>}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-events">
                    <p>No university events scheduled from today onwards.</p>
                    <button onClick={fetchUniversityEvents} className="refresh-events-btn">
                      <FaCalendarAlt /> Refresh Events
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'messages':
        return renderMessagesView();

      case 'course-detail':
        if (!selectedCourse) {
          setActiveView('courses');
          return null;
        }
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
              <h1>Welcome back, Professor {userInfo.name}!</h1>
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
                  <h3>Schedule</h3>
                  <p>{quickStats.upcomingClasses} classes</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveView('events')}>
                <div className="stat-icon">
                  <FaCalendarDay />
                </div>
                <div className="stat-info">
                  <h3>Upcoming Events</h3>
                  <p>{upcomingEvents.filter(event => 
                    event["Date and Start Time"] >= new Date()
                  ).length} events</p>
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
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <FaUserCircle className="user-icon" />
          <div className="user-info">
            <span className="user-name">Prof. {userInfo.name}</span>
            <span className="user-title">{userInfo.title}</span>
            <span className="user-id">Teacher ID: {userInfo.teacherId}</span>
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
            <div className="user-profile" onClick={handleProfileClick}>
              <FaUserCircle className="profile-icon" />
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          {showProfile ? (
            <ProfileView 
              onBack={() => setShowProfile(false)} 
              userType="teacher" 
            />
          ) : (
            renderView()
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfDashboard;