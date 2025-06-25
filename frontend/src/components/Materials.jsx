import React, { useState, useEffect } from 'react'; 
import { 
  FaLink,
  FaChalkboardTeacher, FaFlask, FaTasks, FaBookOpen,
  FaTimes, FaCopy
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import './Materials.css';
import api from '../api';

const Materials = ({ courseId, onBackToCourses }) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissionModal, setSubmissionModal] = useState(null);
  const [submissionData, setSubmissionData] = useState({ link: '', comment: '' });
  const [copiedLink, setCopiedLink] = useState(null);
  const [courseInfo, setCourseInfo] = useState({ name: 'Loading...', lecturer: 'Loading...', group: 'Loading...' });

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        const studentId = localStorage.getItem('student_id');
        console.log('DEBUG: studentId:', studentId, 'courseId:', courseId, 'token:', token);
        if (!studentId) {
          console.error('Brak student_id w localStorage');
          setAssignments([]);
          return;
        }
        const url = `/student/courses/${courseId}/assignments`;
        console.log('DEBUG: Fetching assignments from:', url);
        const response = await api.get(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('DEBUG: Response status:', response.status);
        const data = response.data;
        // Mapuj assignmenty na strukturę oczekiwaną przez frontend
        const rawAssignments = data.CourseAssignmentsList || data.Assignments || data.assignments || data.Assignments || [];
        const mappedAssignments = Array.isArray(rawAssignments)
          ? rawAssignments.map(a => ({
              id: a.assignment_id || a.id,
              name: a.assignment_name || a.name,
              description: a.desc || '',
              date: a.due_date_time || a.date || null,
              status: a.submission_status || a.status || (a.needs_submission ? 'Not Submitted' : 'N/A'),
              submittedLink: a.submitted_link || '',
              submittedComment: a.submitted_comment || ''
            }))
          : [];
        setAssignments(mappedAssignments);
        // Jeśli chcesz pobierać info o kursie, dodaj osobny fetch
      } catch (error) {
        setAssignments([]);
        console.error('Error fetching assignments:', error);
      }
    };
    fetchAssignments();
  }, [courseId]);

  const handleSubmissionClick = (assignmentId) => {
    console.log('Opening modal for assignment', assignmentId);
    setSubmissionModal(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId) || {};
    setSubmissionData({
      link: assignment.submittedLink || '',
      comment: assignment.submittedComment || ''
    });
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSubmissionModal(null);
    setSubmissionData({ link: '', comment: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData(prev => ({ ...prev, [name]: value }));
  };

  const submitSolution = async () => {
    console.log('submitSolution called');
    if (!submissionData.link.trim()) {
      console.log('Link is empty, not submitting');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('student_id');
      console.log('POSTING SUBMISSION:', {
        student_id: parseInt(studentId),
        assignment_id: submissionModal,
        submission_link: submissionData.link,
        comment: submissionData.comment
      });
      // Wyślij submission do backendu
      await api.post(
        `/student/${studentId}/courses/${courseId}/assignments/${submissionModal}/submission`,
        {
          student_id: parseInt(studentId),
          assignment_id: submissionModal,
          submission_link: submissionData.link,
          comment: submissionData.comment
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      // Po sukcesie odśwież assignmenty
      const response = await api.get(
        `/student/courses/${courseId}/assignments`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = response.data;
      const rawAssignments = data.CourseAssignmentsList || data.Assignments || data.assignments || data.Assignments || [];
      const mappedAssignments = Array.isArray(rawAssignments)
        ? rawAssignments.map(a => ({
            id: a.assignment_id || a.id,
            name: a.assignment_name || a.name,
            description: a.desc || '',
            date: a.due_date_time || a.date || null,
            status: a.submission_status || a.status || (a.needs_submission ? 'Not Submitted' : 'N/A'),
            submittedLink: a.submitted_link || '',
            submittedComment: a.submitted_comment || ''
          }))
        : [];
      setAssignments(mappedAssignments);
      closeModal();
    } catch (error) {
      alert('Błąd podczas wysyłania submissiona!');
      console.error('POST submission error:', error);
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="materials-view">
      <div className="materials-header">
        <button className="back-button" onClick={onBackToCourses ? onBackToCourses : () => navigate(-1)}>
          &larr; Back to Courses
        </button>
        <h2>Assignments</h2>
      </div>
      <div className="materials-grid">
        {assignments.map(assignment => (
          <div key={assignment.id} className="material-card">
            <div className="material-header">
              <FaTasks className="file-icon" />
              <h4>{assignment.name}</h4>
            </div>
            <div className="material-details">
              {assignment.description && (
                <p><span>Description:</span> {assignment.description}</p>
              )}
              <p><span>Date:</span> {assignment.date ? new Date(assignment.date).toLocaleString() : 'No due date'}</p>
              <p><span>Status:</span> {assignment.status || 'Not Submitted'}</p>
              {assignment.status === 'Submitted' && (
                <>
                  <p><span>Link:</span> 
                    <a href={assignment.submittedLink} target="_blank" rel="noopener noreferrer">
                      View Submission
                    </a>
                  </p>
                  {assignment.submittedComment && (
                    <p><span>Comment:</span> {assignment.submittedComment}</p>
                  )}
                </>
              )}
            </div>
            <div className="material-actions">
              <button 
                className="submit-btn"
                onClick={() => handleSubmissionClick(assignment.id)}
              >
                <FaLink /> {assignment.status === 'Submitted' ? 'Edit Submission' : 'Submit Solution'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {submissionModal && (
        <div className="upload-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              <FaTimes />
            </button>
            <h3>Submit Solution</h3>
            <p>For: {assignments.find(a => a.id === submissionModal)?.name}</p>
            <div className="form-group">
              <label htmlFor="solution-link">Solution Link*</label>
              <input
                type="url"
                id="solution-link"
                name="link"
                value={submissionData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="solution-comment">Comment (optional)</label>
              <textarea
                id="solution-comment"
                name="comment"
                value={submissionData.comment}
                onChange={handleInputChange}
                placeholder="Add any additional comments..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={() => { console.log('Submit button clicked'); submitSolution(); }} 
                className="submit-btn"
                disabled={!submissionData.link.trim()}
              >
                {assignments.find(a => a.id === submissionModal)?.status === 'Submitted' 
                  ? 'Update Submission' 
                  : 'Submit Solution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
