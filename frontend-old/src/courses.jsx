// courses.jsx
import React, { useState, useCallback } from 'react';
import { 
  FaUserGraduate, FaCalendarAlt, FaFileAlt, 
  FaArrowLeft, FaEdit, FaTrash, FaDownload,
  FaPlus, FaTimes, FaCheck, FaFileUpload,
  FaFilePdf, FaFileWord, FaFilePowerpoint,
  FaFileImage, FaFileArchive, FaSearch
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './courses.css';

const Courses = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [newGrade, setNewGrade] = useState({ assignment: '', grade: '' });
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    files: [] 
  });
  const [darkMode, setDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const students = [
    { id: '1', name: 'John Doe', indexNumber: '123456', email: 'john@example.com', group: 'Group 1' },
    { id: '2', name: 'Jane Smith', indexNumber: '654321', email: 'jane@example.com', group: 'Group 2' }
  ];

  const assignments = [
    { 
      id: '1', 
      title: 'Project 1', 
      description: 'First programming project', 
      date: '2023-10-15',
      files: ['project1_requirements.pdf']
    },
    { 
      id: '2', 
      title: 'Midterm Exam', 
      description: 'Theory and practical test', 
      date: '2023-11-20',
      files: ['midterm_guidelines.pdf', 'sample_questions.docx']
    }
  ];

  const grades = {
    '1': [
      { id: '1', assignment: 'Project 1', grade: '4.5', file: 'project1_john.txt' },
      { id: '2', assignment: 'Midterm Exam', grade: '3.5', file: 'midterm_john.txt' }
    ],
    '2': [
      { id: '3', assignment: 'Project 1', grade: '5.0', file: 'project1_jane.txt' },
      { id: '4', assignment: 'Midterm Exam', grade: '4.0', file: 'midterm_jane.txt' }
    ]
  };

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

  const handleAddGrade = (e) => {
    e.preventDefault();
    if (selectedStudent && newGrade.assignment && newGrade.grade) {
      console.log('Adding grade:', { studentId: selectedStudent, ...newGrade });
      setNewGrade({ assignment: '', grade: '' });
    }
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignment.title && newAssignment.description) {
      console.log('Adding assignment:', newAssignment);
      setNewAssignment({ title: '', description: '', files: [] });
      setSelectedAssignment(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewAssignment({
        ...newAssignment,
        files: [...newAssignment.files, ...filesArray]
      });
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...newAssignment.files];
    newFiles.splice(index, 1);
    setNewAssignment({ ...newAssignment, files: newFiles });
  };

  const handleDeleteGrade = (studentId, gradeId) => {
    console.log('Deleting grade:', gradeId, 'for student:', studentId);
  };

  const handleDownloadFile = (fileName) => {
    console.log('Downloading file:', fileName);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setNewAssignment({
        ...newAssignment,
        files: [...newAssignment.files, ...filesArray]
      });
    }
  }, [newAssignment]);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf': return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx': return <FaFileWord className="file-icon doc" />;
      case 'ppt':
      case 'pptx': return <FaFilePowerpoint className="file-icon ppt" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FaFileImage className="file-icon img" />;
      case 'zip':
      case 'rar': return <FaFileArchive className="file-icon zip" />;
      default: return <FaFileAlt className="file-icon generic" />;
    }
  };

  const resetView = () => {
    setSelectedStudent(null);
    setSelectedAssignment(null);
    setViewSubmissions(null);
  };

  return (
    <div className={`teacher-courses-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="course-header">
        <div className="header-top">
          <Link to="/" className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
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
                    {grades[selectedStudent]?.map(grade => (
                      <tr key={grade.id}>
                        <td>{grade.assignment}</td>
                        <td>
                          <input 
                            type="text" 
                            value={grade.grade}
                            onChange={(e) => console.log('Grade updated:', e.target.value)}
                          />
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
                          <button className="edit-btn">
                            <FaEdit /> Save
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteGrade(selectedStudent, grade.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th>Due Date</th>
                      <th>Files</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td>{assignment.title}</td>
                        <td>{assignment.description}</td>
                        <td>{assignment.date}</td>
                        <td>
                          {assignment.files.map((file, index) => (
                            <div key={index} className="file-item">
                              {getFileIcon(file)}
                              <span>{file}</span>
                            </div>
                          ))}
                        </td>
                        <td>
                          <button 
                            className="view-submissions-btn"
                            onClick={() => setViewSubmissions(assignment.id)}
                          >
                            View Submissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
            <div className="new-assignment-view">
              <button 
                className="back-to-assignments"
                onClick={() => setSelectedAssignment(null)}
              >
                <FaArrowLeft /> Back to Assignments
              </button>
              <h2>Create New Assignment</h2>
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
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Files:</label>
                  <div 
                    className={`drop-zone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FaFileUpload className="upload-icon" />
                    <p>Drag & drop files here or</p>
                    <label className="file-input-label">
                      Browse Files
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        multiple
                        className="file-input"
                      />
                    </label>
                  </div>
                  <div className="file-preview">
                    {newAssignment.files.map((file, index) => (
                      <div key={index} className="file-item">
                        {getFileIcon(file.name)}
                        <span>{file.name}</span>
                        <button 
                          className="remove-file-btn"
                          onClick={() => handleDeleteFile(index)}
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
                    onClick={() => setSelectedAssignment(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={!newAssignment.title || !newAssignment.description}
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;