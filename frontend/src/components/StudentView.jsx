import React, { useState, useEffect, useRef } from 'react'; 
import { 
  FaBell, FaCalendarAlt, FaBook, FaGraduationCap, FaUserCircle, 
  FaSearch, FaSignOutAlt, FaHome, FaChartBar, FaComments,
  FaSun, FaMoon, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendar,
  FaEnvelope, FaPaperPlane, FaUserTie, FaBuilding, FaUsers, FaCreditCard,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaTimes, FaPlus,
  FaChalkboardTeacher
} from 'react-icons/fa'; 
import './StudentView.css'; 
import { useNavigate } from 'react-router-dom';
import api, { 
  getStudentCourses, 
  getAllStudentGrades, 
  getStudentSemesterSchedule,
  getCombineScheduleWeek,
  getCombineScheduleWeekByDate,
  getCombinedScheduleDay,
  getUniversityEvents,
  getUniversityEventsByDate,
  getUserName,
  getUserRoleId,
  getChats,
  getChatMessages,
  postChatMessage,
  createChat,
  getUserNameUserID
} from '../api';
import Materials from './Materials';
import ProfileView from './ProfileView';
import GradesStudent from './GradesStudent';
import { useDarkMode } from '../DarkModeContext';

const StudentDashboard = ({ studentData, studentId = 1 }) => { 
  const [activeView, setActiveView] = useState('dashboard'); 
  const [activeScheduleTab, setActiveScheduleTab] = useState('weekly'); 
  const { darkMode, toggleDarkMode } = useDarkMode(); // Use global dark mode context
  const [activeConversation, setActiveConversation] = useState(0); 
  const [messageText, setMessageText] = useState(''); 
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date())); 
  const [showTodayButton, setShowTodayButton] = useState(false); 
  const [courses, setCourses] = useState([]); 
  const [grades, setGrades] = useState([]); 
  const [allClasses, setAllClasses] = useState([]); 
  const [semesterClasses, setSemesterClasses] = useState([]);
  const [universityEvents, setUniversityEvents] = useState([]);
  const [weeklyScheduleData, setWeeklyScheduleData] = useState(null);
  const [todayScheduleData, setTodayScheduleData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [userInfo, setUserInfo] = useState({
    name: "",
    roleId: null,
    user_id: null,
    faculty: "Computer Science",
    semester: "Summer 2025"
  });
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
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [expandedGrades, setExpandedGrades] = useState({}); // Track expanded course grades
  
  const navigate = useNavigate(); 

  // Fetch user info from API
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user's name
      const nameData = await getUserName(token);
      // Get user's role ID
      const roleIdData = await getUserRoleId(token);
      // Get user's profile
      const profileData = await api.get('/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (nameData && roleIdData && profileData.data) {
        setUserInfo(prevInfo => ({
          ...prevInfo,
          name: nameData.name,
          roleId: roleIdData.role_id,
          user_id: profileData.data.user_id
        }));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Fetch university events from today onwards
  const fetchUniversityEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      console.log('Fetching events using getUniversityEvents...'); // Debug log
      const eventsData = await getUniversityEvents(token);
      console.log('Events data received:', eventsData); // Debug log
      
      if (eventsData && eventsData.Events) {
        console.log('Raw events from API:', eventsData.Events); // Debug log
        console.log('Number of events received:', eventsData.Events.length); // Debug log
        
        if (eventsData.Events.length > 0) {
          const events = eventsData.Events.map(event => {
            console.log('Processing event:', event); // Debug log
            return {
              "Event ID": Math.random().toString(36).substr(2, 9),
              "Event Name": event.EventName,  
              "Date and Start Time": new Date(event.EventTime.StartDateTime),
              "Date and End Time": new Date(event.EventTime.EndDateTime),
              "Holiday": event.IsHoliday
            };
          });
          console.log('Processed events:', events); // Debug log
          setUniversityEvents(events);
        } else {
          console.log('Events array is empty');
          setUniversityEvents([]);
        }
      } else {
        console.log('No events data received or eventsData.Events is undefined');
        console.log('eventsData:', eventsData);
        setUniversityEvents([]);
      }
    } catch (error) {
      console.error('Error fetching university events:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setUniversityEvents([]);
    }
  };

  // Fetch student data from API
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // First fetch user info
      await fetchUserInfo();
      
      // Fetch courses using the proper API function
      console.log('About to fetch student courses...');
      const coursesData = await getStudentCourses(token);
      console.log('Raw courses response:', coursesData); // Debug log
      console.log('Type of coursesData:', typeof coursesData); // Debug log
      console.log('coursesData.CourseList:', coursesData?.CourseList); // Debug log
      
      if (coursesData) {
        const coursesList = coursesData.CourseList || coursesData || [];
        console.log('Final courses list to set:', coursesList); // Debug log
        console.log('Number of courses:', coursesList.length); // Debug log
        setCourses(coursesList);
      } else {
        console.log('No courses data received');
        setCourses([]);
      }
      
      // Fetch grades using the proper API function
      const gradesData = await getAllStudentGrades(token);
      if (gradesData) {
        setGrades(gradesData);
      }
      
      // Fetch schedule (for classes) using the proper API function
      const scheduleData = await getStudentSemesterSchedule(token);
      if (scheduleData) {
        console.log('Semester schedule data:', scheduleData); // Debug log
        // Extract classes from schedule - use all class times but deduplicate by course and day
        const allClasses = scheduleData.Courses.flatMap(course =>
          course.ClassSchedule.ClassTime.map(classTime => ({
            id: Math.random().toString(36).substr(2, 9),
            course: course.ClassSchedule.CourseName,
            type: "Class",
            time: `${new Date(classTime.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(classTime.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
            lecturer: "Lecturer",
            roomLink: `/map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`,
            frequency: course.isBiWeekly ? "biweekly" : "weekly",
            startDate: new Date(classTime.StartDateTime).toISOString().split('T')[0],
            endDate: new Date(classTime.EndDateTime).toISOString().split('T')[0],
            startDateTime: new Date(classTime.StartDateTime),
            endDateTime: new Date(classTime.EndDateTime),
            dayOfWeek: new Date(classTime.StartDateTime).getDay()
          }))
        );
        
        // Group by course and day of week, taking the first occurrence of each course on each day
        const classesMap = new Map();
        const uniqueClasses = [];
        
        allClasses.forEach(cls => {
          const dayName = cls.startDateTime.toLocaleDateString('en-US', { weekday: 'long' });
          const key = `${cls.course}-${dayName}`;
          if (!classesMap.has(key)) {
            classesMap.set(key, cls);
            uniqueClasses.push(cls);
          }
        });
        
        console.log('Processed semester classes:', uniqueClasses); // Debug log
        setSemesterClasses(uniqueClasses);
      }
      
      // Fetch university events using the new dedicated function
      await fetchUniversityEvents();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchStudentData();
      fetchWeeklySchedule(); // Fetch current week schedule
      fetchTodaySchedule(); // Fetch today's schedule
    } else {
      navigate('/login');
    }
  }, [studentId]);

  useEffect(() => {
    // Fetch weekly schedule when week changes
    if (currentWeekStart) {
      fetchWeeklySchedule(currentWeekStart);
    }
  }, [currentWeekStart]);

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
      const classDay = new Date(cls.startDateTime).toDateString();
      return classDay === dayDate.toDateString();
    });
  }

  function getEventsForDay(dayDate) {
    return universityEvents.filter(event => {
      const eventDate = new Date(event.EventTime?.StartDateTime || event["Date and Start Time"]);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  }

  function getAssignmentsForDay(dayDate) {
    return assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.AssignmentDueDateTime);
      return assignmentDate.toDateString() === dayDate.toDateString();
    });
  }

  function getClassesForSemesterDay(dayName) {
    return semesterClasses.filter(cls => {
      // For semester schedule, we need to get the day from the first class time
      const classDate = new Date(cls.startDateTime || cls.startDate);
      const classDay = classDate.toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`Comparing ${classDay} with ${dayName} for class ${cls.course}`); // Debug log
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

  const getGradeClass = (grade) => {
    if (!grade || grade === null) return 'grade-no-grade';
    if (grade >= 4.5) return 'grade-excellent';
    if (grade >= 3.5) return 'grade-good';
    if (grade >= 3.0) return 'grade-average';
    return 'grade-poor';
  };

  // Helper function to convert percentage to AGH scale (2.0-5.0)
  const percentageToScale = (percentage) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    if (percentage < 50.0) return '2.0';
    else if (percentage < 60.0) return '3.0';
    else if (percentage < 70.0) return '3.5';
    else if (percentage < 80.0) return '4.0';
    else if (percentage < 90.0) return '4.5';
    else return '5.0';
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

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  const getTodayClasses = () => {
    if (!todayScheduleData?.Courses) {
      return [];
    }

    const allTodayClasses = todayScheduleData.Courses.flatMap(course =>
      course.ClassSchedule.ClassTime.map(classTime => ({
        id: Math.random().toString(36).substr(2, 9),
        course: course.ClassSchedule.CourseName,
        type: "Class",
        time: `${new Date(classTime.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(classTime.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
        lecturer: "Lecturer",
        roomLink: `/map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`,
        startDateTime: new Date(classTime.StartDateTime),
        endDateTime: new Date(classTime.EndDateTime)
      }))
    );

    // Deduplicate today's classes the same way
    const uniqueTodayClasses = [];
    const classesMap = new Map();
    
    allTodayClasses.forEach(cls => {
      const key = `${cls.course}-${cls.startDateTime.toISOString()}-${cls.endDateTime.toISOString()}`;
      if (!classesMap.has(key)) {
        classesMap.set(key, cls);
        uniqueTodayClasses.push(cls);
      }
    });

    return uniqueTodayClasses;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('student_id');
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

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
        
        // Fetch user names for all participants
        const uniqueUserIds = new Set(
          chatsData.ChatList.flatMap(chat => [chat.user1Id, chat.user2Id])
        );
        
        // Filter out user IDs we already have names for
        const namePromises = Array.from(uniqueUserIds)
          .filter(userId => !userNames[userId])
          .map(fetchUserName);
        
        await Promise.all(namePromises);
      } else {
        setChats([]);
        console.warn('No chats found in response:', chatsData);
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
      setNewChatRole('TEACHER');
      setNewChatRoleId('');
      await fetchChats(); // Refresh chats list
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

  // Refresh events when Events tab is viewed
  useEffect(() => {
    if (activeView === 'events') {
      console.log('Events tab opened, refreshing events...');
      fetchUniversityEvents();
    }
  }, [activeView]);

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

  // Fetch weekly schedule data
  const fetchWeeklySchedule = async (weekStart = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let scheduleData;
      if (weekStart) {
        const weekStartDate = weekStart.toISOString().split('T')[0];
        scheduleData = await getCombineScheduleWeekByDate(weekStartDate, token);
      } else {
        scheduleData = await getCombineScheduleWeek(token);
      }

      console.log('Weekly schedule data:', scheduleData); // Debug log

      if (scheduleData) {
        setWeeklyScheduleData(scheduleData);
        
        // Extract assignments from the schedule
        if (scheduleData.Assignments) {
          setAssignments(scheduleData.Assignments);
        }
        
        // Note: Events for the Events tab are fetched separately by fetchUniversityEvents()
        // Schedule events are used only for the weekly schedule view
        
        // Extract classes from the schedule - TEMPORARY FIX: Backend deduplication not working
        if (scheduleData.Courses) {
          console.log('Backend returning duplicates - applying frontend deduplication');
          
          const classes = scheduleData.Courses.flatMap(course =>
            course.ClassSchedule.ClassTime.map(classTime => ({
              id: Math.random().toString(36).substr(2, 9),
              course: course.ClassSchedule.CourseName,
              type: "Class",
              time: `${new Date(classTime.StartDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}-${new Date(classTime.EndDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
              room: `${course.ClassSchedule.Building} ${course.ClassSchedule.RoomNumber}`,
              lecturer: "Lecturer",
              roomLink: `/map?room=${course.ClassSchedule.Building}-${course.ClassSchedule.RoomNumber}`,
              frequency: course.isBiWeekly ? "biweekly" : "weekly",
              startDateTime: new Date(classTime.StartDateTime),
              endDateTime: new Date(classTime.EndDateTime),
              dayOfWeek: new Date(classTime.StartDateTime).getDay()
            }))
          );
          
          // TEMPORARY: Deduplicate identical time slots until backend is fixed
          const uniqueClasses = [];
          const classesMap = new Map();
          
          classes.forEach(cls => {
            const key = `${cls.startDateTime.toISOString()}-${cls.endDateTime.toISOString()}-${cls.room}`;
            if (!classesMap.has(key)) {
              classesMap.set(key, cls);
              uniqueClasses.push(cls);
            }
          });
          
          console.log(`Deduplication: ${classes.length} → ${uniqueClasses.length} classes`);
          setAllClasses(uniqueClasses);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Fetch today's schedule data
  const fetchTodaySchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const scheduleData = await getCombinedScheduleDay(token);
      console.log('Today\'s schedule data:', scheduleData); // Debug log

      if (scheduleData) {
        setTodayScheduleData(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
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
                  const assignments = getAssignmentsForDay(date);
                  return (
                    <div key={date.toString()} className="day-column">
                      {/* Show assignments */}
                      {assignments.map((assignment, idx) => (
                        <div key={`assignment-${idx}`} className="assignment-card">
                          <h4>{assignment.AssignmentName}</h4>
                          <p><FaBook /> {assignment.CourseName}</p>
                          <p><FaClock /> Due: {new Date(assignment.AssignmentDueDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                      
                      {/* Show university events */}
                      {events.map((event, idx) => (
                        <div key={`event-${idx}`} className={`event-card ${event.Holiday || event.IsHoliday ? 'holiday' : ''}`}>
                          <h4>{event.EventName || event["Event Name"]}</h4>
                          <p><FaClock /> {new Date(event.EventTime?.StartDateTime || event["Date and Start Time"]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
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
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="weekly-schedule">
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
                    {classes.length === 0 && (
                      <div className="no-classes">
                        <p>No classes</p>
                      </div>
                    )}
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
        console.log('Current courses data:', courses); // Debug log
        return (
          <div className="view-content">
            <h2>Your Courses</h2>
            <div className="courses-list">
              {courses.map(course => (
                <div key={course.ID} className="course-card">
                  <h3>{course.Course}</h3>
                  <div className="course-details">
                    <p><FaUsers /> Group {course.Group}</p>
                    <p><FaBook /> Course ID: {course.ID}</p>
                  </div>
                  <div className="course-actions">
                    <button onClick={() => {
                      setSelectedCourseId(course.ID);
                      setSelectedCourseName(course.Course);
                      setActiveView('materials');
                    }}>
                      <FaBook /> Assignments
                    </button>
                    <button onClick={() => {
                      setSelectedCourseId(course.ID);
                      setSelectedCourseName(course.Course);
                      setActiveView('course-grades');
                    }}>
                      <FaGraduationCap /> Grades
                    </button>
                    <button onClick={() => setActiveView('messages')}>
                      <FaEnvelope /> Chat
                    </button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="no-courses">
                  <p>No courses found. Please check with your academic advisor.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'course-grades':
        return (
          <div className="view-content">
            <GradesStudent 
              courseId={selectedCourseId} 
              courseName={selectedCourseName}
              onBackToCourses={() => setActiveView('courses')} 
            />
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
                  <div 
                    className="course-grades-header"
                    onClick={() => setExpandedGrades(prev => ({
                      ...prev,
                      [courseName]: !prev[courseName]
                    }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{courseName}</h3>
                    <div className="course-grades-summary">
                      <div className="average-grade">
                        Average: <span className={getGradeClass(calculateCourseAverage(courseGrades))}>
                          {calculateCourseAverage(courseGrades).toFixed(1)}%
                          {' '}(
                            {percentageToScale(calculateCourseAverage(courseGrades))}
                          )
                        </span>
                      </div>
                      <div className="expand-icon">
                        {expandedGrades[courseName] ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>
                  
                  {expandedGrades[courseName] && (
                    <div className="course-grades-details">
                      <div className="assignments-list">
                        {courseGrades.map((grade, idx) => (
                          <div key={idx} className="assignment-grade-item">
                            <div className="assignment-name">
                              {grade.Assignment || 'No Grade'}
                            </div>
                            <div className="assignment-grade">
                              <span className={getGradeClass(grade.Grade)}>
                                {grade.Grade !== null ? grade.Grade.toFixed(1) + '%' : 'No Grade'}
                              </span>
                              {grade.Grade !== null && (
                                <span className={`agh-grade ${getGradeClass(parseFloat(percentageToScale(grade.Grade)))}`}>
                                  ({percentageToScale(grade.Grade)})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        console.log('Rendering events tab, universityEvents:', universityEvents); // Debug log
        console.log('universityEvents.length:', universityEvents.length); // Debug log
        
        return (
          <div className="view-content">
            <h2>University Events</h2>
            {loading ? (
              <div className="loading-spinner">Loading events...</div>
            ) : (
              <div className="events-container">
                {universityEvents.length > 0 ? (
                  universityEvents.map(event => {
                    console.log('Rendering event:', event); // Debug log
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
        
      case 'materials':
        return (
          <div className="view-content">
            <Materials courseId={selectedCourseId} focusTab="assignments" onBackToCourses={() => setActiveView('courses')} />
          </div>
        );
        
      case 'profile':
        return (
          <div className="view-content">
            <ProfileView 
              onBack={() => setShowProfile(false)} 
              userType="student" 
            />
          </div>
        );
        
      default:
        const todayClasses = getTodayClasses();
        const totalCourses = courses.length || 0;
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
                  <h3>Schedule</h3>
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
              <h2>Today's Schedule - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</h2>
              <div className="today-schedule-content">
                {/* Today's Classes */}
                {todayClasses.length > 0 && (
                  <div className="today-section">
                    <h3>Classes</h3>
                    <div className="upcoming-classes-list">
                      {todayClasses.map((cls, index) => (
                        <div key={index} className="upcoming-class-card">
                          <h4>{cls.course}</h4>
                          <p><FaClock /> {cls.time}</p>
                          <p>{cls.type} | <a href={cls.roomLink} className="room-link"><FaMapMarkerAlt /> {cls.room}</a></p>
                          <p><FaUserTie /> {cls.lecturer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today's Events */}
                {todayScheduleData?.Events && todayScheduleData.Events.length > 0 && (
                  <div className="today-section">
                    <h3>Events</h3>
                    <div className="today-events-list">
                      {todayScheduleData.Events.map((event, index) => (
                        <div key={index} className={`event-card ${event.IsHoliday ? 'holiday' : ''}`}>
                          <h4>{event.EventName}</h4>
                          <p><FaClock /> {new Date(event.EventTime.StartDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                          {event.IsHoliday && <span className="holiday-badge">Holiday</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today's Assignments */}
                {todayScheduleData?.Assignments && todayScheduleData.Assignments.length > 0 && (
                  <div className="today-section">
                    <h3>Assignments Due</h3>
                    <div className="today-assignments-list">
                      {todayScheduleData.Assignments.map((assignment, index) => (
                        <div key={index} className="assignment-card">
                          <h4>{assignment.AssignmentName}</h4>
                          <p><FaBook /> {assignment.CourseName}</p>
                          <p><FaClock /> Due: {new Date(assignment.AssignmentDueDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No activities today */}
                {todayClasses.length === 0 && 
                 (!todayScheduleData?.Events || todayScheduleData.Events.length === 0) && 
                 (!todayScheduleData?.Assignments || todayScheduleData.Assignments.length === 0) && (
                  <div className="no-activities">
                    <p>No classes, events, or assignments scheduled for today.</p>
                  </div>
                )}
              </div>
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
            <div className="user-profile" onClick={handleProfileClick}>
              <FaUserCircle className="profile-icon" />
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          {showProfile ? (
            <ProfileView 
              onBack={() => setShowProfile(false)} 
              userType="student" 
            />
          ) : (
            renderView()
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
