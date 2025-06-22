import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaBook, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa';
import './GradesStudent.css';
import api from '../api';

const GradesStudent = ({ courseId, courseName, onBackToCourses }) => {
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch grades and assignments for the course
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch grades for this course
        const gradesResponse = await api.get(`/student/courses/${courseId}/grades`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch assignments for this course
        const assignmentsResponse = await api.get(`/student/courses/${courseId}/assignments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setGrades(gradesResponse.data.GradeList || []);
        setAssignments(assignmentsResponse.data.Assignments || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching grades data:', err);
        setError('Failed to load grades data');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Helper function to convert percentage to AGH scale
  const percentageToScale = (percentage) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    if (percentage < 50.0) return '2.0';
    else if (percentage < 60.0) return '3.0';
    else if (percentage < 70.0) return '3.5';
    else if (percentage < 80.0) return '4.0';
    else if (percentage < 90.0) return '4.5';
    else return '5.0';
  };

  // Get grade class for styling
  const getGradeClass = (grade) => {
    if (grade >= 4.5) return 'grade-excellent';
    if (grade >= 4.0) return 'grade-good';
    if (grade >= 3.5) return 'grade-average';
    if (grade >= 3.0) return 'grade-poor';
    return 'grade-fail';
  };

  // Check if assignment is overdue
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return 'no-due-date';
    const now = new Date();
    const due = new Date(dueDate);
    if (now > due) return 'overdue';
    return 'on-time';
  };

  // Calculate course average
  const calculateCourseAverage = () => {
    const validGrades = grades.filter(grade => grade.Grade !== null);
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + grade.Grade, 0);
    return sum / validGrades.length;
  };

  // Create a combined list of assignments with grades
  const getCombinedAssignments = () => {
    const combined = [];
    
    // Add assignments with grades
    grades.forEach(grade => {
      // Find corresponding assignment to get due_date_time
      const assignment = assignments.find(a => a.assignment_name === grade.Assignment);
      combined.push({
        assignment_id: assignment?.assignment_id || null,
        assignment_name: grade.Assignment,
        due_date_time: assignment?.due_date_time || null,
        needs_submission: assignment?.needs_submission || true,
        grade: grade.Grade,
        agh_grade: grade.AGH_Grade,
        status: 'graded',
        submitted: true
      });
    });
    
    // Add assignments without grades (not submitted or not graded yet)
    assignments.forEach(assignment => {
      const existingGrade = grades.find(g => g.Assignment === assignment.assignment_name);
      if (!existingGrade) {
        combined.push({
          assignment_id: assignment.assignment_id,
          assignment_name: assignment.assignment_name,
          due_date_time: assignment.due_date_time,
          needs_submission: assignment.needs_submission,
          grade: null,
          agh_grade: null,
          status: assignment.submission_status || 'not_submitted',
          submitted: assignment.submission_status === 'Submitted'
        });
      }
    });
    
    return combined.sort((a, b) => {
      // Sort by due date if available, otherwise by name
      if (a.due_date_time && b.due_date_time) {
        return new Date(a.due_date_time) - new Date(b.due_date_time);
      }
      return a.assignment_name.localeCompare(b.assignment_name);
    });
  };

  const combinedAssignments = getCombinedAssignments();
  const courseAverage = calculateCourseAverage();

  if (loading) {
    return (
      <div className="grades-student-view">
        <div className="grades-header">
          <button className="back-button" onClick={onBackToCourses}>
            <FaArrowLeft /> Back to Courses
          </button>
          <h2>Loading Grades...</h2>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grades-student-view">
        <div className="grades-header">
          <button className="back-button" onClick={onBackToCourses}>
            <FaArrowLeft /> Back to Courses
          </button>
          <h2>Error</h2>
        </div>
        <div className="error-message">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grades-student-view">
      <div className="grades-header">
        <button className="back-button" onClick={onBackToCourses}>
          <FaArrowLeft /> Back to Courses
        </button>
        <h2>Grades - {courseName}</h2>
      </div>

      <div className="course-overview">
        <div className="course-stats">
          <div className="stat-card">
            <FaBook className="stat-icon" />
            <div className="stat-info">
              <h3>Total Assignments</h3>
              <p>{combinedAssignments.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <FaGraduationCap className="stat-icon" />
            <div className="stat-info">
              <h3>Course Average</h3>
              <p className={getGradeClass(percentageToScale(courseAverage))}>
                {courseAverage.toFixed(1)}% ({percentageToScale(courseAverage)})
              </p>
            </div>
          </div>
          <div className="stat-card">
            <FaCheck className="stat-icon" />
            <div className="stat-info">
              <h3>Submitted</h3>
              <p>{combinedAssignments.filter(a => a.submitted).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <FaTimes className="stat-icon" />
            <div className="stat-info">
              <h3>Not Submitted</h3>
              <p>{combinedAssignments.filter(a => !a.submitted).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="assignments-grades-list">
        <h3>Assignments & Grades</h3>
        {combinedAssignments.length > 0 ? (
          <div className="assignments-grid">
            {combinedAssignments.map((assignment, index) => (
              <div key={index} className={`assignment-grade-card ${assignment.status}`}>
                <div className="assignment-header">
                  <h4>{assignment.assignment_name}</h4>
                  <div className={`status-badge ${assignment.status}`}>
                    {assignment.status === 'graded' && <FaGraduationCap />}
                    {assignment.status === 'Submitted' && <FaCheck />}
                    {assignment.status === 'not_submitted' && <FaTimes />}
                    {assignment.status === 'Not Submitted' && <FaTimes />}
                    <span>
                      {assignment.status === 'graded' && 'Graded'}
                      {assignment.status === 'Submitted' && 'Submitted'}
                      {assignment.status === 'not_submitted' && 'Not Submitted'}
                      {assignment.status === 'Not Submitted' && 'Not Submitted'}
                    </span>
                  </div>
                </div>
                
                <div className="assignment-details">
                  {assignment.due_date_time && (
                    <p className={`due-date ${getDueDateStatus(assignment.due_date_time)}`}>
                      <FaClock /> Due: {new Date(assignment.due_date_time).toLocaleDateString()} at {new Date(assignment.due_date_time).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="grade-section">
                  {assignment.grade !== null ? (
                    <div className="grade-display">
                      <div className="grade-percentage">
                        <span className={getGradeClass(assignment.grade)}>
                          {assignment.grade.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grade-agh">
                        AGH: <span className={getGradeClass(parseFloat(assignment.agh_grade))}>
                          {assignment.agh_grade}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-grade">
                      <span className="grade-no-grade">No Grade</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-assignments">
            <p>No assignments found for this course.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesStudent; 