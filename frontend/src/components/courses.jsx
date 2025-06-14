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

const Courses = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedAdditional, setSelectedAdditional] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [newGrade, setNewGrade] = useState({ assignment: '', grade: '' });
  const [editingGrade, setEditingGrade] = useState(null);
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
  const { courseId } = useParams();
  const navigate = useNavigate();

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

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await fetchWithToken(`/course/${courseId}`);
      if (courseData) {
        setCourseDetails(courseData);
      }
      
      // Fetch students
      const studentsData = await fetchWithToken(`/course/${courseId}/students`);
      if (studentsData) {
        setStudents(studentsData.students || []);
      }
      
      // Fetch assignments
      const assignmentsData = await fetchWithToken(`/course/${courseId}/assignments`);
      if (assignmentsData) {
        setAssignments(assignmentsData.assignments || []);
      }
      
      // Fetch lectures
      const lecturesData = await fetchWithToken(`/course/${courseId}/lectures`);
      if (lecturesData) {
        setLectures(lecturesData.lectures || []);
      }
      
      // Fetch additional materials
      const additionalsData = await fetchWithToken(`/course/${courseId}/additional-materials`);
      if (additionalsData) {
        setAdditionals(additionalsData.materials || []);
      }
      
      // Fetch labs
      const labsData = await fetchWithToken(`/course/${courseId}/labs`);
      if (labsData) {
        setLabs(labsData.labs || []);
      }
      
      // Fetch groups
      const groupsData = await fetchWithToken(`/course/${courseId}/groups`);
      if (groupsData) {
        setGroups(groupsData.groups || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId) {
      fetchCourseData();
    } else if (!token) {
      navigate('/login');
    }
  }, [courseId, token]);

  // Grade handling functions
  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (selectedStudent && newGrade.assignment && newGrade.grade) {
      try {
        const response = await fetchWithToken(`/student/${selectedStudent}/grades`, {
          method: 'POST',
          body: JSON.stringify({
            assignmentId: newGrade.assignmentId,
            grade: parseFloat(newGrade.grade)
          })
        });
        
        if (response) {
          // Refresh grades
          fetchCourseData();
          setNewGrade({ assignment: '', grade: '' });
        }
      } catch (error) {
        console.error('Error adding grade:', error);
      }
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await fetchWithToken(`/grade/${gradeId}`, {
        method: 'DELETE'
      });
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
    return groups.map((group, index) => (
      <div key={index} className="schedule-group">
        <h3>{group.name}</h3>
        <p><strong>Building:</strong> {group.building}</p>
        <p><strong>Room:</strong> {group.room}</p>
        <p><strong>Time:</strong> {group.schedule}</p>
      </div>
    ));
  };

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
        <button 
          className="back-button"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft /> Back to Courses
        </button>
        <h1>{courseDetails?.name || 'Course'} ({courseDetails?.code || 'Code'})</h1>
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
          <button 
            className={`tab-btn ${activeTab === 'lectures' ? 'active' : ''}`}
            onClick={() => setActiveTab('lectures')}
          >
            <FaChalkboardTeacher /> Lectures
          </button>
          <button 
            className={`tab-btn ${activeTab === 'additionals' ? 'active' : ''}`}
            onClick={() => setActiveTab('additionals')}
          >
            <FaBook /> Additionals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
          >
            <FaFlask /> Labs
          </button>
        </div>
      </div>

      {activeTab === 'students' && (
        <div className="students-section">
          <h2>Enrolled Students</h2>
          <div className="search-bar">
            <input type="text" placeholder="Search students..." />
            <button><FaSearch /></button>
          </div>
          <div className="students-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Index Number</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.indexNumber}</td>
                    <td>{student.group}</td>
                    <td className="student-actions">
                      <button 
                        className="view-grades-btn"
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        View Grades
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="schedule-section">
          <h2>Course Schedule</h2>
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
          <div className="assignments-list">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Deadline</th>
                  <th>Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.title}</td>
                    <td>{assignment.description}</td>
                    <td>{new Date(assignment.dueDate).toLocaleString()}</td>
                    <td>
                      {assignment.links && renderLinkList(assignment.links)}
                    </td>
                    <td>
                      <button 
                        className="view-submissions-btn"
                        onClick={() => setViewSubmissions(assignment.id)}
                      >
                        View Submissions
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem('assignment', assignment.id)}
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

      {activeTab === 'lectures' && (
        <div className="lectures-section">
          <div className="lectures-header">
            <h2>Course Lectures</h2>
            <button 
              className="new-lecture-btn"
              onClick={() => setSelectedLecture('new')}
            >
              <FaPlus /> New Lecture
            </button>
          </div>
          <div className="lectures-list">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map(lecture => (
                  <tr key={lecture.id}>
                    <td>{lecture.title}</td>
                    <td>{new Date(lecture.date).toLocaleDateString()}</td>
                    <td>
                      {lecture.links && renderLinkList(lecture.links)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem('lecture', lecture.id)}
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

      {activeTab === 'additionals' && (
        <div className="additionals-section">
          <div className="additionals-header">
            <h2>Additional Materials</h2>
            <button 
              className="new-additional-btn"
              onClick={() => setSelectedAdditional('new')}
            >
              <FaPlus /> New Material
            </button>
          </div>
          <div className="additionals-list">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {additionals.map(material => (
                  <tr key={material.id}>
                    <td>{material.title}</td>
                    <td>{material.description}</td>
                    <td>{new Date(material.date).toLocaleDateString()}</td>
                    <td>
                      {material.links && renderLinkList(material.links)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem('additional', material.id)}
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

      {activeTab === 'labs' && (
        <div className="labs-section">
          <div className="labs-header">
            <h2>Course Labs</h2>
            <button 
              className="new-lab-btn"
              onClick={() => setSelectedLab('new')}
            >
              <FaPlus /> New Lab
            </button>
          </div>
          <div className="labs-list">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Deadline</th>
                  <th>Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labs.map(lab => (
                  <tr key={lab.id}>
                    <td>{lab.title}</td>
                    <td>{lab.description}</td>
                    <td>{new Date(lab.deadline).toLocaleString()}</td>
                    <td>
                      {lab.links && renderLinkList(lab.links)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem('lab', lab.id)}
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
