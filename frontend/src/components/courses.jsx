import React, { useState, useEffect } from 'react';
import { 
  FaUserGraduate, FaCalendarAlt, FaFileAlt, 
  FaArrowLeft, FaEdit, FaTrash, FaDownload,
  FaPlus, FaTimes, FaCheck, FaLink,
  FaFilePdf, FaFileWord, FaFilePowerpoint,
  FaFileImage, FaFileArchive, FaSearch,
  FaChalkboardTeacher, FaFlask, FaBook,
  FaClock, FaCopy, FaUsers, FaUserTie
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import './courses.css';
import {
  getCourseStudents,
  getCourseAssignmentsTeacher,
  getStudentGradesForCourse,
  getStudentsGradesAsTeacher,
  postGrade,
  postAssignment,
  getCourseScheduleView
} from '../api';

const Courses = ({ courseId: propCourseId }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedAdditional, setSelectedAdditional] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [newGrade, setNewGrade] = useState({
    assignmentId: '',
    grade: '',
    gradeFormat: 'percentage' // 'percentage' or 'scale'
  });
  const [editingGrade, setEditingGrade] = useState({
    assignmentId: null,
    grade: '',
    gradeFormat: 'percentage' // 'percentage' or 'scale'
  });
  const [copiedLink, setCopiedLink] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [courseDetails, setCourseDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [additionals, setAdditionals] = useState([]);
  const [labs, setLabs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const navigate = useNavigate();
  const [courseSchedule, setCourseSchedule] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    links: [''],
    group: ''
  });
  const [studentGrades, setStudentGrades] = useState([]);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use prop courseId if provided, otherwise use route param
  const courseId = propCourseId || params.courseId;

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch course data for courseId:', courseId);
      
      // Fetch course schedule view
      try {
        console.log('Fetching course schedule view...');
        const scheduleData = await getCourseScheduleView(courseId, token);
        console.log('Course schedule response:', scheduleData);
        if (scheduleData) {
          setCourseSchedule(scheduleData);
          setCourseDetails({
            name: scheduleData.CourseName,
            building: scheduleData.Building,
            roomNumber: scheduleData.RoomNumber,
            isBiWeekly: scheduleData.isBiWeekly
          });
        }
      } catch (error) {
        console.error('Error fetching course schedule:', error);
      }
      
      // Fetch students
      try {
        console.log('Fetching students...');
        const studentsData = await getCourseStudents(courseId, token);
        console.log('Raw students response:', studentsData);
        if (studentsData) {
          console.log('Setting students state with:', studentsData.Students);
          setStudents(studentsData.Students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
      
      // Fetch assignments
      try {
        const assignmentsData = await getCourseAssignmentsTeacher(courseId, token);
        console.log('Assignments response:', assignmentsData);
        if (assignmentsData) {
          setAssignments(assignmentsData.Assignments || []);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
      
      setLoading(false);
      console.log('Finished fetching all course data');
    } catch (error) {
      console.error('Error in fetchCourseData:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Courses component mounted with courseId:', courseId);
    if (token && courseId) {
      fetchCourseData();
    } else if (!token) {
      navigate('/login');
    }
  }, [courseId, token]);

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data
    };
    setDebugLogs(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`, data);
  };

  const fetchStudentGrades = async (studentId) => {
    try {
      addDebugLog(`Fetching grades for student ${studentId}`);
      
      // Decode JWT token to get user role
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const userRole = payload.role;
        
        addDebugLog(`User role: ${userRole}`);
        
        let gradesData;
        if (userRole === 'teacher') {
          // Use teacher endpoint
          gradesData = await getStudentsGradesAsTeacher(courseId, studentId, token);
        } else {
          // Use student endpoint (fallback)
          gradesData = await getStudentGradesForCourse(studentId, courseId, token);
        }
        
        addDebugLog('Received grades data:', gradesData);
        if (gradesData) {
          setStudentGrades(gradesData.GradeList || []);
          addDebugLog(`Updated grades list with ${gradesData.GradeList?.length || 0} grades`);
        }
      } else {
        addDebugLog('Invalid token format');
      }
    } catch (error) {
      addDebugLog('Error fetching student grades:', error);
      console.error('Error fetching student grades:', error);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    addDebugLog('Starting to add new grade', newGrade);
    
    if (selectedStudent && newGrade.assignmentId && newGrade.grade) {
      try {
        let gradeValue;
        if (newGrade.gradeFormat === 'percentage') {
          gradeValue = parseFloat(newGrade.grade);
          addDebugLog(`Using percentage grade: ${gradeValue}`);
        } else {
          // Convert AGH scale to percentage using the reverse of backend logic
          const aghGrade = parseFloat(newGrade.grade);
          const aghToPercentage = {
            2.0: 25.0,  // Below 50% average
            3.0: 55.0,  // 50-60% average  
            3.5: 65.0,  // 60-70% average
            4.0: 75.0,  // 70-80% average
            4.5: 85.0,  // 80-90% average
            5.0: 95.0   // 90%+ average
          };
          
          if (aghToPercentage.hasOwnProperty(aghGrade)) {
            gradeValue = aghToPercentage[aghGrade];
            addDebugLog(`Converted AGH grade ${aghGrade} to percentage: ${gradeValue}`);
          } else {
            throw new Error('Invalid AGH grade value');
          }
        }

        const requestBody = {
          student_id: selectedStudent,
          assignment_id: parseInt(newGrade.assignmentId),
          grade: gradeValue
        };
        addDebugLog('Sending grade request:', requestBody);

        const response = await postGrade(requestBody, token);
        
        addDebugLog('Received response from server:', response);
        
        if (response) {
          addDebugLog('Grade added successfully, refreshing grades list');
          await fetchStudentGrades(selectedStudent);
          setNewGrade({ assignmentId: '', grade: '', gradeFormat: 'percentage' });
        }
      } catch (error) {
        addDebugLog('Error adding grade:', error);
        console.error('Error adding grade:', error);
      }
    } else {
      addDebugLog('Cannot add grade - missing required fields', {
        selectedStudent,
        assignmentId: newGrade.assignmentId,
        grade: newGrade.grade
      });
    }
  };

  const handleEditGrade = async (e) => {
    e.preventDefault();
    console.log('handleEditGrade called with editingGrade:', editingGrade);
    console.log('selectedStudent:', selectedStudent);
    
    if (!selectedStudent) {
      console.log('No student selected');
      return;
    }
    
    if (!editingGrade.assignmentId) {
      console.log('No assignment ID in editingGrade');
      return;
    }
    
    if (!editingGrade.grade) {
      console.log('No grade value in editingGrade');
      return;
    }
    
    try {
      let gradeValue;
      
      if (editingGrade.gradeFormat === 'percentage') {
        gradeValue = parseFloat(editingGrade.grade);
        console.log('Using percentage grade:', gradeValue);
      } else {
        // Convert AGH scale to percentage using the reverse of backend logic
        const aghGrade = parseFloat(editingGrade.grade);
        const aghToPercentage = {
          2.0: 25.0,  // Below 50% average
          3.0: 55.0,  // 50-60% average  
          3.5: 65.0,  // 60-70% average
          4.0: 75.0,  // 70-80% average
          4.5: 85.0,  // 80-90% average
          5.0: 95.0   // 90%+ average
        };
        
        if (aghToPercentage.hasOwnProperty(aghGrade)) {
          gradeValue = aghToPercentage[aghGrade];
          console.log('Converted AGH grade to percentage:', gradeValue);
        } else {
          throw new Error('Invalid AGH grade value');
        }
      }

      // Find the assignment ID by name
      const assignment = assignments.find(a => a.assignment_name === editingGrade.assignmentId);
      if (!assignment) {
        console.log('Assignment not found:', editingGrade.assignmentId);
        return;
      }

      console.log('Sending grade update request:', {
        student_id: selectedStudent,
        assignment_id: assignment.assignment_id,
        grade: gradeValue
      });

      const response = await postGrade({
        student_id: selectedStudent,
        assignment_id: assignment.assignment_id,
        grade: gradeValue
      }, token);
      
      console.log('Grade update response:', response);
      
      if (response) {
        // Refresh grades
        await fetchStudentGrades(selectedStudent);
        // Exit edit mode
        setEditingGrade({
          assignmentId: null,
          grade: '',
          gradeFormat: 'percentage'
        });
        console.log('Grade updated successfully, exited edit mode');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      // Note: Delete grade endpoint not implemented in backend yet
      console.log('Delete grade functionality not implemented yet');
      fetchCourseData();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  // Link handling - only one link shown
  const renderLinkList = (links) => {
    return links.map((link, index) => (
      <div key={index} className="link-item">
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="single-link"
        >
          <FaLink className="link-icon" /> {link.title}
        </a>
        <button 
          className="copy-link-btn"
          onClick={() => copyToClipboard(link.url)}
          title="Copy link"
        >
          <FaCopy />
          {copiedLink === link.url && <span className="copied-tooltip">Copied!</span>}
        </button>
      </div>
    ));
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Assignment submission handling
  const handleDownloadSubmission = (submissionId) => {
    // Implement download logic
    console.log('Downloading submission:', submissionId);
  };

  // Group schedule rendering
  const renderGroupSchedule = () => {
    if (!courseSchedule || !courseSchedule.Groups) return null;
    
    return courseSchedule.Groups.map((group, index) => (
      <div key={index} className="schedule-group">
        <h3>Group {group.GroupNumber}</h3>
        <p><strong>Day:</strong> {group.DayOfWeek}</p>
        <p><strong>Time:</strong> {group.StartTime} - {group.EndTime}</p>
        <p><strong>Location:</strong> {courseSchedule.Building || 'N/A'} {courseSchedule.RoomNumber || ''}</p>
      </div>
    ));
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const response = await postAssignment({
        assignment_name: newAssignment.title,
        desc: newAssignment.description,
        due_date_time: new Date(newAssignment.dueDate).toISOString(),
        needs_submission: false,
        valid_file_types: null,
        group: newAssignment.group ? parseInt(newAssignment.group) : null,
        course_id: parseInt(courseId)
      }, token);
      
      if (response) {
        // Refresh assignments
        fetchCourseData();
        setNewAssignment({
          title: '',
          description: '',
          dueDate: '',
          links: [''],
          group: ''
        });
        setSelectedAssignment(null);
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const addLinkField = () => {
    setNewAssignment({
      ...newAssignment,
      links: [...newAssignment.links, '']
    });
  };

  const removeLinkField = (index) => {
    const newLinks = newAssignment.links.filter((_, i) => i !== index);
    setNewAssignment({
      ...newAssignment,
      links: newLinks.length ? newLinks : ['']
    });
  };

  const updateLink = (index, value) => {
    const newLinks = [...newAssignment.links];
    newLinks[index] = value;
    setNewAssignment({
      ...newAssignment,
      links: newLinks
    });
  };

  // Helper function to convert percentage to scale grade (AGH scale)
  const percentageToScale = (percentage) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    
    // Use the same logic as backend
    if (percentage < 50.0) return '2.0';
    else if (percentage < 60.0) return '3.0';
    else if (percentage < 70.0) return '3.5';
    else if (percentage < 80.0) return '4.0';
    else if (percentage < 90.0) return '4.5';
    else return '5.0';
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_name?.toLowerCase().includes(searchLower) ||
      student.student_id?.toString().includes(searchLower) ||
      student.group?.toString().includes(searchLower) ||
      student.student_email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="teacher-courses-container">
        <div className="loading-spinner">Loading course data...</div>
      </div>
    );
  }

  return (
    <div className="teacher-courses-container">
      <div className="course-header">
        
        <h1>{courseDetails?.name || 'Course'} ({courseId})</h1>
        <div className="course-tabs">
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <FaUserGraduate /> Students
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <FaCalendarAlt /> Schedule
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <FaFileAlt /> Assignments
          </button>
        </div>
      </div>

      {activeTab === 'students' && (
        <div className="students-section">
          <h2>Enrolled Students</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setSearchTerm('')} title="Clear search">
              <FaTimes />
            </button>
          </div>
          <div className="students-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Index Number</th>
                  <th>Group</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.student_name}</td>
                    <td>{student.student_id}</td>
                    <td>{student.group || 'N/A'}</td>
                    <td>{student.student_email || 'N/A'}</td>
                    <td className="student-actions">
                      <button 
                        className="view-grades-btn"
                        onClick={() => {
                          setSelectedStudent(student.student_id);
                          fetchStudentGrades(student.student_id);
                        }}
                      >
                        View Grades
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedStudent && (
            <div className="grades-modal">
              <div className="grades-content">
                

                {showDebug && (
                  <div className="debug-panel">
                    <h4>Debug Logs</h4>
                    <div className="debug-logs">
                      {debugLogs.map((log, index) => (
                        <div key={index} className="debug-log-entry">
                          <span className="debug-timestamp">{log.timestamp}</span>
                          <span className="debug-message">{log.message}</span>
                          {log.data && (
                            <pre className="debug-data">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3>Student Grades</h3>
                
                <button 
                  className="back-arrow-btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentGrades([]);
                    setNewGrade({ assignmentId: '', grade: '', gradeFormat: 'percentage' });
                    setEditingGrade({
                      assignmentId: null,
                      grade: '',
                      gradeFormat: 'percentage'
                    });
                  }}
                >
                  <FaArrowLeft />
                </button>

                <div className="grades-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Grade (%)</th>
                        <th>Grade (2-5)</th>
                        <th>AGH Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.map((grade, index) => {
                        console.log('Rendering grade:', grade, 'index:', index);
                        return (
                          <tr key={index}>
                            <td>{grade.Assignment}</td>
                            <td>
                              {grade.Grade ? grade.Grade.toFixed(1) : 'N/A'}
                            </td>
                            <td>
                              {(() => {
                                const isEditing = editingGrade.assignmentId && grade.Assignment && editingGrade.assignmentId === grade.Assignment;
                                console.log('Checking edit mode for grade:', grade.Assignment, 'editingGrade:', editingGrade.assignmentId, 'isEditing:', isEditing);
                                return isEditing ? (
                                  <div className="edit-grade-inputs">
                                    <select
                                      value={editingGrade.gradeFormat}
                                      onChange={(e) => setEditingGrade({
                                        ...editingGrade,
                                        gradeFormat: e.target.value,
                                        grade: '' // Reset grade when format changes
                                      })}
                                      className="grade-format-select"
                                    >
                                      <option value="percentage">Percentage</option>
                                      <option value="scale">AGH Scale</option>
                                    </select>
                                    {editingGrade.gradeFormat === 'percentage' ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={editingGrade.grade}
                                        onChange={(e) => setEditingGrade({
                                          ...editingGrade,
                                          grade: e.target.value
                                        })}
                                        className="grade-input"
                                        placeholder="0-100"
                                      />
                                    ) : (
                                      <select
                                        value={editingGrade.grade}
                                        onChange={(e) => setEditingGrade({
                                          ...editingGrade,
                                          grade: e.target.value
                                        })}
                                        className="grade-input"
                                      >
                                        <option value="">Select Grade</option>
                                        <option value="2.0">2.0</option>
                                        <option value="3.0">3.0</option>
                                        <option value="3.5">3.5</option>
                                        <option value="4.0">4.0</option>
                                        <option value="4.5">4.5</option>
                                        <option value="5.0">5.0</option>
                                      </select>
                                    )}
                                  </div>
                                ) : (
                                  grade.Grade ? percentageToScale(grade.Grade) : 'N/A'
                                );
                              })()}
                            </td>
                            <td>{grade.AGH_Grade ? grade.AGH_Grade.toFixed(1) : 'N/A'}</td>
                            <td className="grade-actions">
                              {(() => {
                                const isEditing = editingGrade.assignmentId && grade.Assignment && editingGrade.assignmentId === grade.Assignment;
                                console.log('Checking actions for grade:', grade.Assignment, 'isEditing:', isEditing);
                                return isEditing ? (
                                  <>
                                    <button 
                                      className="save-btn"
                                      onClick={(e) => {
                                        console.log('Save button clicked for grade:', grade.Assignment);
                                        handleEditGrade(e);
                                      }}
                                      disabled={!editingGrade.grade}
                                    >
                                      <FaCheck /> Save
                                    </button>
                                    <button 
                                      className="cancel-btn"
                                      onClick={() => {
                                        console.log('Cancel button clicked, resetting editingGrade');
                                        setEditingGrade({
                                          assignmentId: null,
                                          grade: '',
                                          gradeFormat: 'percentage'
                                        });
                                      }}
                                    >
                                      <FaTimes /> Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    className="edit-btn"
                                    onClick={() => {
                                      console.log('Edit button clicked for grade:', grade);
                                      console.log('Setting editingGrade to:', {
                                        assignmentId: grade.Assignment,
                                        grade: grade.Grade ? grade.Grade.toString() : '',
                                        gradeFormat: 'percentage'
                                      });
                                      setEditingGrade({
                                        assignmentId: grade.Assignment,
                                        grade: grade.Grade ? grade.Grade.toString() : '',
                                        gradeFormat: 'percentage'
                                      });
                                    }}
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="add-grade-form">
                  <h4>Add New Grade</h4>
                  <form onSubmit={handleAddGrade}>
                    <div className="form-group">
                      <label>Assignment:</label>
                      <select
                        value={newGrade.assignmentId}
                        onChange={(e) => setNewGrade({...newGrade, assignmentId: e.target.value})}
                        required
                      >
                        <option value="">Select Assignment</option>
                        {assignments.map(assignment => (
                          <option key={assignment.assignment_id} value={assignment.assignment_name}>
                            {assignment.assignment_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Grade Format:</label>
                      <select
                        value={newGrade.gradeFormat}
                        onChange={(e) => setNewGrade({...newGrade, gradeFormat: e.target.value})}
                      >
                        <option value="percentage">Percentage (0-100)</option>
                        <option value="scale">AGH Scale (2.0, 3.0, 3.5, 4.0, 4.5, 5.0)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        {newGrade.gradeFormat === 'percentage' ? 'Grade (0-100):' : 'AGH Grade:'}
                      </label>
                      {newGrade.gradeFormat === 'percentage' ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={newGrade.grade}
                          onChange={(e) => setNewGrade({...newGrade, grade: e.target.value})}
                          required
                        />
                      ) : (
                        <select
                          value={newGrade.grade}
                          onChange={(e) => setNewGrade({...newGrade, grade: e.target.value})}
                          required
                        >
                          <option value="">Select Grade</option>
                          <option value="2.0">2.0</option>
                          <option value="3.0">3.0</option>
                          <option value="3.5">3.5</option>
                          <option value="4.0">4.0</option>
                          <option value="4.5">4.5</option>
                          <option value="5.0">5.0</option>
                        </select>
                      )}
                    </div>
                    <button type="submit" className="submit-btn">Add Grade</button>
                  </form>
                </div>

                <button 
                  className="close-btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentGrades([]);
                    setNewGrade({ assignmentId: '', grade: '', gradeFormat: 'percentage' });
                    setEditingGrade({
                      assignmentId: null,
                      grade: '',
                      gradeFormat: 'percentage'
                    });
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="schedule-section">
          <h2>Course Schedule</h2>
          {courseDetails?.isBiWeekly !== undefined && (
            <div className="course-frequency-info">
              <p><strong>Course Frequency:</strong> {courseDetails.isBiWeekly ? 'Bi-weekly' : 'Weekly'}</p>
            </div>
          )}
          <div className="schedule-groups">
            {renderGroupSchedule()}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="assignments-section">
          <div className="assignments-header">
            <h2>Course Assignments</h2>
            <button 
              className="new-assignment-btn"
              onClick={() => setSelectedAssignment('new')}
            >
              <FaPlus /> New Assignment
            </button>
          </div>

          {selectedAssignment === 'new' && (
            <div className="new-assignment-form">
              <h3>Create New Assignment</h3>
              <form onSubmit={handleAddAssignment}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date:</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Group (optional):</label>
                  <input
                    type="number"
                    value={newAssignment.group}
                    onChange={(e) => setNewAssignment({...newAssignment, group: e.target.value})}
                    placeholder="Leave empty for all groups"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Create Assignment</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setSelectedAssignment(null);
                      setNewAssignment({
                        title: '',
                        description: '',
                        dueDate: '',
                        links: [''],
                        group: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="assignments-list">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Deadline</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.assignment_id}>
                    <td>{assignment.assignment_name}</td>
                    <td>{assignment.desc}</td>
                    <td>{new Date(assignment.due_date_time).toLocaleString()}</td>
                    <td>{assignment.group || 'All'}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => console.log('Delete assignment:', assignment.assignment_id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
