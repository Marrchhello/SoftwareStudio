import React, { useState, useCallback } from 'react';
import { 
  FaUserGraduate, FaCalendarAlt, FaFileAlt, 
  FaArrowLeft, FaEdit, FaTrash, FaDownload,
  FaPlus, FaTimes, FaCheck, FaLink,
  FaFilePdf, FaFileWord, FaFilePowerpoint,
  FaFileImage, FaFileArchive, FaSearch,
  FaChalkboardTeacher, FaFlask, FaBook,
  FaClock, FaCopy
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
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
  
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    links: [],
    deadlineDate: '',
    deadlineTime: ''
  });

  const [newLecture, setNewLecture] = useState({
    title: '',
    comment: '',
    links: [],
    date: ''
  });

  const [newAdditional, setNewAdditional] = useState({
    title: '',
    description: '',
    links: [],
    date: ''
  });

  const [newLab, setNewLab] = useState({
    title: '',
    description: '',
    links: [],
    deadlineDate: '',
    deadlineTime: ''
  });

  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [grades, setGrades] = useState({
    '1': [
      { id: '1', assignment: 'Project 1', grade: '4.5', file: 'project1_john.txt' },
      { id: '2', assignment: 'Midterm Exam', grade: '3.5', file: 'midterm_john.txt' }
    ],
    '2': [
      { id: '3', assignment: 'Project 1', grade: '5.0', file: 'project1_jane.txt' },
      { id: '4', assignment: 'Midterm Exam', grade: '4.0', file: 'midterm_jane.txt' }
    ]
  });

  const students = [
    { id: '1', name: 'John Doe', indexNumber: '123456', email: 'john@example.com', group: 'Group 1' },
    { id: '2', name: 'Jane Smith', indexNumber: '654321', email: 'jane@example.com', group: 'Group 2' }
  ];

  const [assignments, setAssignments] = useState([
    { 
      id: '1', 
      title: 'Project 1', 
      description: 'First programming project', 
      deadlineDate: '2023-10-15',
      deadlineTime: '23:59',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Project Requirements' },
        { url: 'https://www.agh.edu.pl/', title: 'Starter Code' }
      ]
    },
    { 
      id: '2', 
      title: 'Midterm Exam', 
      description: 'Theory and practical test', 
      deadlineDate: '2023-11-20',
      deadlineTime: '23:59',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Exam Guidelines' },
        { url: 'https://www.agh.edu.pl/', title: 'Sample Questions' }
      ]
    }
  ]);

  const [lectures, setLectures] = useState([
    {
      id: '1',
      title: 'Introduction to Programming',
      comment: 'Basic concepts and syntax',
      date: '2023-09-01',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Lecture Slides' },
        { url: 'https://www.agh.edu.pl/', title: 'Code Examples' }
      ]
    },
    {
      id: '2',
      title: 'Object-Oriented Programming',
      comment: 'Classes and objects',
      date: '2023-09-15',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'OOP Concepts' },
        { url: 'https://www.agh.edu.pl/', title: 'Practice Examples' }
      ]
    }
  ]);

  const [additionals, setAdditionals] = useState([
    {
      id: '1',
      title: 'Useful Resources',
      description: 'Collection of helpful links and materials',
      date: '2023-09-05',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Resource List' }
      ]
    },
    {
      id: '2',
      title: 'Coding Standards',
      description: 'Guide for writing clean code',
      date: '2023-09-10',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Coding Standards Guide' }
      ]
    }
  ]);

  const [labs, setLabs] = useState([
    {
      id: '1',
      title: 'Lab 1: Variables and Data Types',
      description: 'Practice with basic data types',
      deadlineDate: '2023-09-08',
      deadlineTime: '23:59',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Lab Instructions' }
      ]
    },
    {
      id: '2',
      title: 'Lab 2: Control Structures',
      description: 'If statements and loops',
      deadlineDate: '2023-09-22',
      deadlineTime: '23:59',
      links: [
        { url: 'https://www.agh.edu.pl/', title: 'Lab Instructions' },
        { url: 'https://www.agh.edu.pl/', title: 'Sample Code' }
      ]
    }
  ]);

  const submissions = {
    '1': [
      { studentId: '1', name: 'John Doe', file: 'project1_john.txt', date: '2023-10-14' },
      { studentId: '2', name: 'Jane Smith', file: 'project1_jane.txt', date: '2023-10-15' }
    ],
    '2': [
      { studentId: '1', name: 'John Doe', file: 'midterm_john.txt', date: '2023-11-19' },
      { studentId: '2', name: 'Jane Smith', file: 'midterm_jane.txt', date: '2023-11-20' }
    ]
  };

  // Grade handling
  const handleAddGrade = (e) => {
    e.preventDefault();
    if (selectedStudent && newGrade.assignment && newGrade.grade) {
      const newGradeObj = {
        id: Date.now().toString(),
        assignment: newGrade.assignment,
        grade: newGrade.grade,
        file: `${newGrade.assignment.toLowerCase().replace(/\s+/g, '_')}_${students.find(s => s.id === selectedStudent)?.name.toLowerCase().replace(/\s+/g, '_')}.txt`
      };
      
      setGrades(prevGrades => ({
        ...prevGrades,
        [selectedStudent]: [...(prevGrades[selectedStudent] || []), newGradeObj]
      }));
      
      setNewGrade({ assignment: '', grade: '' });
    }
  };

  const handleDeleteGrade = (studentId, gradeId) => {
    setGrades(prevGrades => {
      const updatedGrades = {...prevGrades};
      if (updatedGrades[studentId]) {
        updatedGrades[studentId] = updatedGrades[studentId].filter(
          grade => grade.id !== gradeId
        );
      }
      return updatedGrades;
    });
  };

  // Grade editing
  const handleStartEditGrade = (studentId, grade) => {
    setEditingGrade({
      studentId,
      gradeId: grade.id,
      assignment: grade.assignment,
      grade: grade.grade
    });
  };

  const handleSaveGrade = (studentId, gradeId) => {
    if (editingGrade) {
      setGrades(prevGrades => {
        const updatedGrades = {...prevGrades};
        if (updatedGrades[studentId]) {
          updatedGrades[studentId] = updatedGrades[studentId].map(grade => 
            grade.id === gradeId ? { ...grade, grade: editingGrade.grade } : grade
          );
        }
        return updatedGrades;
      });
      setEditingGrade(null);
    }
  };

  const handleCancelEditGrade = () => {
    setEditingGrade(null);
  };

  // Link handling
  const handleAddLink = (setter, currentState) => {
    if (newLink.url && newLink.title) {
      setter({
        ...currentState,
        links: [...currentState.links, { ...newLink }]
      });
      setNewLink({ url: '', title: '' });
    }
  };

  const handleDeleteLink = (index, setter, currentState) => {
    const newLinks = [...currentState.links];
    newLinks.splice(index, 1);
    setter({ ...currentState, links: newLinks });
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Assignment handling
  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignment.title && newAssignment.description) {
      const newAssignmentObj = {
        id: Date.now().toString(),
        title: newAssignment.title,
        description: newAssignment.description,
        deadlineDate: newAssignment.deadlineDate,
        deadlineTime: newAssignment.deadlineTime,
        links: newAssignment.links
      };
      
      setAssignments([...assignments, newAssignmentObj]);
      setNewAssignment({ 
        title: '', 
        description: '', 
        links: [],
        deadlineDate: '',
        deadlineTime: ''
      });
      setSelectedAssignment(null);
    }
  };

  // Lecture handling
  const handleAddLecture = (e) => {
    e.preventDefault();
    if (newLecture.title) {
      const newLectureObj = {
        id: Date.now().toString(),
        title: newLecture.title,
        comment: newLecture.comment,
        date: newLecture.date,
        links: newLecture.links
      };
      
      setLectures([...lectures, newLectureObj]);
      setNewLecture({ 
        title: '', 
        comment: '', 
        links: [],
        date: ''
      });
      setSelectedLecture(null);
    }
  };

  // Additional material handling
  const handleAddAdditional = (e) => {
    e.preventDefault();
    if (newAdditional.title) {
      const newAdditionalObj = {
        id: Date.now().toString(),
        title: newAdditional.title,
        description: newAdditional.description,
        date: newAdditional.date,
        links: newAdditional.links
      };
      
      setAdditionals([...additionals, newAdditionalObj]);
      setNewAdditional({ 
        title: '', 
        description: '', 
        links: [],
        date: ''
      });
      setSelectedAdditional(null);
    }
  };

  // Lab handling
  const handleAddLab = (e) => {
    e.preventDefault();
    if (newLab.title) {
      const newLabObj = {
        id: Date.now().toString(),
        title: newLab.title,
        description: newLab.description,
        deadlineDate: newLab.deadlineDate,
        deadlineTime: newLab.deadlineTime,
        links: newLab.links
      };
      
      setLabs([...labs, newLabObj]);
      setNewLab({ 
        title: '', 
        description: '', 
        links: [],
        deadlineDate: '',
        deadlineTime: ''
      });
      setSelectedLab(null);
    }
  };

  const handleDeleteItem = (type, id) => {
    switch(type) {
      case 'assignment':
        setAssignments(assignments.filter(item => item.id !== id));
        break;
      case 'lecture':
        setLectures(lectures.filter(item => item.id !== id));
        break;
      case 'additional':
        setAdditionals(additionals.filter(item => item.id !== id));
        break;
      case 'lab':
        setLabs(labs.filter(item => item.id !== id));
        break;
      default:
        console.log(`Unknown type: ${type}`);
    }
  };

  const handleDownloadFile = (fileName) => {
    console.log('Downloading file:', fileName);
  };

  const resetView = () => {
    setSelectedStudent(null);
    setSelectedAssignment(null);
    setSelectedLecture(null);
    setSelectedAdditional(null);
    setSelectedLab(null);
    setViewSubmissions(null);
    setEditingGrade(null);
  };

  const renderLinkList = (links) => {
    return links.map((link, index) => (
      <div key={index} className="link-item">
        <FaLink className="link-icon" />
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          {link.title}
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

  const renderItemForm = (type, state, setter, onSubmit) => {
    const isLecture = type === 'lecture';
    const isAdditional = type === 'additional';
    const isAssignment = type === 'assignment';
    const isLab = type === 'lab';
    
    return (
      <div className="new-item-view">
        <h2>Create New {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input 
              type="text" 
              value={state.title}
              onChange={(e) => setter({...state, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{isLecture ? 'Comment:' : 'Description:'}</label>
            {isLecture ? (
              <input 
                type="text" 
                value={state.comment}
                onChange={(e) => setter({...state, comment: e.target.value})}
              />
            ) : (
              <textarea 
                value={state.description}
                onChange={(e) => setter({...state, description: e.target.value})}
              />
            )}
          </div>

          {(isAssignment || isLab) && (
            <>
              <div className="form-group">
                <label>Deadline Date:</label>
                <input 
                  type="date" 
                  value={state.deadlineDate}
                  onChange={(e) => setter({...state, deadlineDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deadline Time:</label>
                <input 
                  type="time" 
                  value={state.deadlineTime}
                  onChange={(e) => setter({...state, deadlineTime: e.target.value})}
                  required
                />
              </div>
            </>
          )}

          {(isLecture || isAdditional) && (
            <div className="form-group">
              <label>Date:</label>
              <input 
                type="date" 
                value={state.date}
                onChange={(e) => setter({...state, date: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Links:</label>
            <div className="link-input-section">
              <div className="link-inputs">
                <input 
                  type="url" 
                  placeholder="URL (e.g., https://example.com)"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Link title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                />
                <button 
                  type="button"
                  className="add-link-btn"
                  onClick={() => handleAddLink(setter, state)}
                  disabled={!newLink.url || !newLink.title}
                >
                  <FaPlus /> Add Link
                </button>
              </div>
            </div>
            <div className="links-preview">
              {state.links.map((link, index) => (
                <div key={index} className="link-item">
                  <FaLink className="link-icon" />
                  <span>{link.title}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="test-link">
                    Test
                  </a>
                  <button 
                    type="button"
                    className="remove-link-btn"
                    onClick={() => handleDeleteLink(index, setter, state)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                if (type === 'assignment') setSelectedAssignment(null);
                else if (type === 'lecture') setSelectedLecture(null);
                else if (type === 'additional') setSelectedAdditional(null);
                else if (type === 'lab') setSelectedLab(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!state.title || ((isAssignment || isLab) && (!state.deadlineDate || !state.deadlineTime)) || 
                        ((isLecture || isAdditional) && !state.date)}
            >
              Create {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderItemList = (items, type) => {
    return (
      <div className="items-list">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>{type === 'lecture' ? 'Comment' : 'Description'}</th>
              {type === 'assignment' || type === 'lab' ? (
                <>
                  <th>Deadline Date</th>
                  <th>Deadline Time</th>
                </>
              ) : (
                <th>Date</th>
              )}
              <th>Links</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{type === 'lecture' ? item.comment : item.description}</td>
                {type === 'assignment' || type === 'lab' ? (
                  <>
                    <td>{item.deadlineDate}</td>
                    <td>{item.deadlineTime}</td>
                  </>
                ) : (
                  <td>{item.date}</td>
                )}
                <td>
                  {renderLinkList(item.links)}
                </td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteItem(type, item.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGradesTable = (studentId) => {
    return (
      <table className="grades-table">
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Grade</th>
            <th>Submission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grades[studentId]?.map(grade => (
            <tr key={grade.id}>
              <td>{grade.assignment}</td>
              <td>
                {editingGrade?.gradeId === grade.id ? (
                  <input
                    type="text"
                    value={editingGrade.grade}
                    onChange={(e) => setEditingGrade({
                      ...editingGrade,
                      grade: e.target.value
                    })}
                    className="grade-input"
                  />
                ) : (
                  grade.grade
                )}
              </td>
              <td>
                {grade.file && (
                  <button 
                    className="download-btn"
                    onClick={() => handleDownloadFile(grade.file)}
                  >
                    <FaDownload /> {grade.file}
                  </button>
                )}
              </td>
              <td className="grade-actions">
                {editingGrade?.gradeId === grade.id ? (
                  <>
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveGrade(studentId, grade.id)}
                    >
                      <FaCheck /> Save
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelEditGrade}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="edit-btn"
                      onClick={() => handleStartEditGrade(studentId, grade)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteGrade(studentId, grade.id)}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={`teacher-courses-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="course-header">
        <div className="header-top">
          
          
        </div>
        <h1>Programming Course (CS101)</h1>
        <div className="course-tabs">
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); resetView(); }}
          >
            <FaUserGraduate /> Students
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => { setActiveTab('schedule'); resetView(); }}
          >
            <FaCalendarAlt /> Schedule
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('assignments'); resetView(); }}
          >
            <FaFileAlt /> Assignments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lectures' ? 'active' : ''}`}
            onClick={() => { setActiveTab('lectures'); resetView(); }}
          >
            <FaChalkboardTeacher /> Lectures
          </button>
          <button 
            className={`tab-btn ${activeTab === 'additionals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('additionals'); resetView(); }}
          >
            <FaBook /> Additionals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('labs'); resetView(); }}
          >
            <FaFlask /> Labs
          </button>
        </div>
      </div>

      {activeTab === 'students' && (
        <div className="students-section">
          {!selectedStudent ? (
            <>
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
                          <button className="send-message-btn">Message</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="student-grades-view">
              <button 
                className="back-to-list"
                onClick={() => setSelectedStudent(null)}
              >
                <FaArrowLeft /> Back to Students List
              </button>
              <h2>Grades for {students.find(s => s.id === selectedStudent)?.name}</h2>
              <div className="grades-management">
                {renderGradesTable(selectedStudent)}
                <div className="add-grade-form">
                  <h3>Add New Grade</h3>
                  <form onSubmit={handleAddGrade}>
                    <div className="form-group">
                      <label>Assignment:</label>
                      <input 
                        type="text" 
                        value={newGrade.assignment}
                        onChange={(e) => setNewGrade({...newGrade, assignment: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Grade:</label>
                      <input 
                        type="text" 
                        value={newGrade.grade}
                        onChange={(e) => setNewGrade({...newGrade, grade: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="submit-btn">
                      <FaPlus /> Add Grade
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="schedule-section">
          <h2>Course Schedule</h2>
          <div className="schedule-groups">
            <div className="schedule-group">
              <h3>Group 1</h3>
              <p><strong>Building:</strong> C-7</p>
              <p><strong>Room:</strong> 214</p>
              <p><strong>Time:</strong> Mondays 08:00-09:30 (Lecture)</p>
            </div>
            <div className="schedule-group">
              <h3>Group 2</h3>
              <p><strong>Building:</strong> C-7</p>
              <p><strong>Room:</strong> 514</p>
              <p><strong>Time:</strong> Wednesdays 10:00-11:30 (Lab)</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="assignments-section">
          {!viewSubmissions && !selectedAssignment ? (
            <>
              <div className="assignments-header">
                <h2>Course Assignments</h2>
                <button 
                  className="new-assignment-btn"
                  onClick={() => {
                    setSelectedAssignment('new');
                    setNewAssignment({ 
                      title: '', 
                      description: '', 
                      links: [],
                      deadlineDate: '',
                      deadlineTime: ''
                    });
                  }}
                >
                  <FaPlus /> New Assignment
                </button>
              </div>
              {renderItemList(assignments, 'assignment')}
            </>
          ) : viewSubmissions ? (
            <div className="submissions-view">
              <button 
                className="back-to-assignments"
                onClick={() => setViewSubmissions(null)}
              >
                <FaArrowLeft /> Back to Assignments
              </button>
              <h2>Submissions for {assignments.find(a => a.id === viewSubmissions)?.title}</h2>
              <div className="submissions-list">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Index Number</th>
                      <th>Submission Date</th>
                      <th>File</th>
                      <th>Grade</th>
                      <th>Actions</th>
 			</tr>
                  </thead>
                  <tbody>
                    {submissions[viewSubmissions]?.map((submission, index) => {
                      const student = students.find(s => s.id === submission.studentId);
                      const studentGrades = grades[submission.studentId] || [];
                      const assignmentGrade = studentGrades.find(g => 
                        g.assignment === assignments.find(a => a.id === viewSubmissions)?.title
                      );
                      
                      return (
                        <tr key={index}>
                          <td>{submission.name}</td>
                          <td>{student?.indexNumber}</td>
                          <td>{submission.date}</td>
                          <td>
                            <button 
                              className="download-btn"
                              onClick={() => handleDownloadFile(submission.file)}
                            >
                              <FaDownload /> {submission.file}
                            </button>
                          </td>
                          <td>
                            {assignmentGrade ? (
                              <input 
                                type="text" 
                                value={assignmentGrade.grade}
                                onChange={(e) => console.log('Grade updated:', e.target.value)}
                              />
                            ) : (
                              <span>Not graded</span>
                            )}
                          </td>
                          <td>
                            {assignmentGrade ? (
                              <>
                                <button className="save-grade-btn">
                                  <FaEdit /> Save
                                </button>
                                <button 
                                  className="delete-grade-btn"
                                  onClick={() => handleDeleteGrade(submission.studentId, assignmentGrade.id)}
                                >
                                  <FaTrash />
                                </button>
                              </>
                            ) : (
                              <button 
                                className="add-grade-btn"
                                onClick={() => {
                                  setSelectedStudent(submission.studentId);
                                  setNewGrade({
                                    assignment: assignments.find(a => a.id === viewSubmissions)?.title || '',
                                    grade: ''
                                  });
                                }}
                              >
                                <FaPlus /> Add Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            renderItemForm('assignment', newAssignment, setNewAssignment, handleAddAssignment)
          )}
        </div>
      )}

      {activeTab === 'lectures' && (
        <div className="lectures-section">
          <div className="lectures-header">
            <h2>Course Lectures</h2>
            <button 
              className="new-lecture-btn"
              onClick={() => {
                setSelectedLecture('new');
                setNewLecture({ title: '', comment: '', links: [], date: '' });
              }}
            >
              <FaPlus /> New Lecture
            </button>
          </div>
          {!selectedLecture ? (
            renderItemList(lectures, 'lecture')
          ) : (
            renderItemForm('lecture', newLecture, setNewLecture, handleAddLecture)
          )}
        </div>
      )}

      {activeTab === 'additionals' && (
        <div className="additionals-section">
          <div className="additionals-header">
            <h2>Additional Materials</h2>
            <button 
              className="new-additional-btn"
              onClick={() => {
                setSelectedAdditional('new');
                setNewAdditional({ title: '', description: '', links: [], date: '' });
              }}
            >
              <FaPlus /> New Additional
            </button>
          </div>
          {!selectedAdditional ? (
            renderItemList(additionals, 'additional')
          ) : (
            renderItemForm('additional', newAdditional, setNewAdditional, handleAddAdditional)
          )}
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="labs-section">
          <div className="labs-header">
            <h2>Course Labs</h2>
            <button 
              className="new-lab-btn"
              onClick={() => {
                setSelectedLab('new');
                setNewLab({ title: '', description: '', links: [], deadlineDate: '', deadlineTime: '' });
              }}
            >
              <FaPlus /> New Lab
            </button>
          </div>
          {!selectedLab ? (
            renderItemList(labs, 'lab')
          ) : (
            renderItemForm('lab', newLab, setNewLab, handleAddLab)
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;
