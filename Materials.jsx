import React, { useState, useEffect } from 'react'; 
import { 
  FaLink,
  FaChalkboardTeacher, FaFlask, FaTasks, FaBookOpen,
  FaTimes, FaCopy
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom'; 
import './Materials.css';

const Materials = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); 
  const [activeTab, setActiveTab] = useState('lectures');
  const [submissionModal, setSubmissionModal] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    link: '',
    comment: ''
  });
  const [copiedLink, setCopiedLink] = useState(null);
  const [materials, setMaterials] = useState(null); s
  const [courseInfo, setCourseInfo] = useState({
    name: 'Loading...',
    lecturer: 'Loading...',
    group: 'Loading...'
  });

  // Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/course/${courseId}/materials`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        
        const data = await response.json();
        setMaterials(data.materials);
        setCourseInfo({
          name: data.courseName,
          lecturer: data.lecturer,
          group: data.group
        });
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    
    fetchMaterials();
  }, [courseId]);

  const handleSubmissionClick = (assignmentId) => {
    setSubmissionModal(assignmentId);
    const assignment = courseMaterials.assignments.find(a => a.id === assignmentId);
    setSubmissionData({
      link: assignment.submittedLink || '',
      comment: assignment.submittedComment || ''
    });
  };

  const closeModal = () => {
    setSubmissionModal(null);
    setSubmissionData({ link: '', comment: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData(prev => ({ ...prev, [name]: value }));
  };

  const submitSolution = () => {
    if (!submissionData.link.trim()) return;
    
    setCourseMaterials(prev => ({
      ...prev,
      assignments: prev.assignments.map(assignment => 
        assignment.id === submissionModal 
          ? { 
              ...assignment, 
              status: 'Submitted',
              submittedLink: submissionData.link,
              submittedComment: submissionData.comment
            } 
          : assignment
      )
    }));
    
    closeModal();
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="materials-view">
      <div className="materials-header">
        <button className="back-button" onClick={() => navigate('/student')}>
          &larr; Back to Dashboard
        </button>
        <h2>Course Materials</h2>
        <div className="course-info">
          <h3>{courseInfo.name}</h3>
          <p>Lecturer: {courseInfo.lecturer} | Group: {courseInfo.group}</p>
        </div>
      </div>

      <div className="materials-tabs">
        <button 
          className={`material-tab ${activeTab === 'lectures' ? 'active' : ''}`}
          onClick={() => setActiveTab('lectures')}
        >
          <FaChalkboardTeacher /> Lectures
        </button>
        <button 
          className={`material-tab ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          <FaFlask /> Labs
        </button>
        <button 
          className={`material-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FaTasks /> Assignments
        </button>
        <button 
          className={`material-tab ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional')}
        >
          <FaBookOpen /> Additional
        </button>
      </div>

      <div className="materials-grid">
        {courseMaterials[activeTab].map(material => (
          <div key={material.id} className="material-card">
            <div className="material-header">
              <FaLink className="file-icon link" />
              <h4>{material.name}</h4>
            </div>
            <div className="material-details">
              <p><span>Date:</span> {material.date}</p>
              
              {activeTab === 'assignments' ? (
                <>
                  <p><span>Status:</span> {material.status}</p>
                  {material.status === 'Submitted' && (
                    <>
                      <p><span>Link:</span> 
                        <a href={material.submittedLink} target="_blank" rel="noopener noreferrer">
                          View Submission
                        </a>
                      </p>
                      {material.submittedComment && (
                        <p><span>Comment:</span> {material.submittedComment}</p>
                      )}
                    </>
                  )}
                </>
              ) : material.link && (
                <p>
                  <span>Link:</span> 
                  <a href={material.link} target="_blank" rel="noopener noreferrer">
                    Open Resource
                  </a>
                  <button 
                    className="copy-link-btn"
                    onClick={() => copyToClipboard(material.link)}
                    title="Copy link"
                  >
                    <FaCopy />
                    {copiedLink === material.link && <span className="copied-tooltip">Copied!</span>}
                  </button>
                </p>
              )}
            </div>
            {activeTab === 'assignments' && (
              <div className="material-actions">
                <button 
                  className="submit-btn"
                  onClick={() => handleSubmissionClick(material.id)}
                >
                  <FaLink /> {material.status === 'Submitted' ? 'Edit Submission' : 'Submit Solution'}
                </button>
              </div>
            )}
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
            <p>For: {courseMaterials.assignments.find(a => a.id === submissionModal)?.name}</p>
            
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
                onClick={submitSolution} 
                className="submit-btn"
                disabled={!submissionData.link.trim()}
              >
                {courseMaterials.assignments.find(a => a.id === submissionModal)?.status === 'Submitted' 
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
