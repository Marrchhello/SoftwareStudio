import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { postGrade } from '../api';
import './AssignmentSubmissions.css';

const aghScaleOptions = ["2.0", "3.0", "3.5", "4.0", "4.5", "5.0"];

const AssignmentSubmissions = () => {
  const { courseId, assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState({});
  const [gradingFormat, setGradingFormat] = useState({});
  const [saving, setSaving] = useState({});
  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/course/${courseId}/assignment/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubmissions(response.data.submissions || []);
    } catch (err) {
      setError('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, [courseId, assignmentId]);

  // Konwersja AGH scale na procenty (zgodnie z logiką AGH)
  const aghToPercentage = (agh) => {
    const map = {
      "2.0": 25.0,
      "3.0": 55.0,
      "3.5": 65.0,
      "4.0": 75.0,
      "4.5": 85.0,
      "5.0": 95.0
    };
    return map[agh] || null;
  };

  const handleGrade = async (studentId) => {
    setSaving(s => ({ ...s, [studentId]: true }));
    try {
      const token = localStorage.getItem('token');
      let gradeValue;
      if (gradingFormat[studentId] === 'scale') {
        gradeValue = aghToPercentage(grading[studentId]);
      } else {
        gradeValue = grading[studentId];
      }
      await postGrade({ student_id: studentId, assignment_id: assignmentId, grade: gradeValue }, token);
      fetchSubmissions();
      setGrading(g => ({ ...g, [studentId]: '' }));
    } catch (err) {
      alert('Error saving grade');
    } finally {
      setSaving(s => ({ ...s, [studentId]: false }));
    }
  };

  // Powrót do listy assignments kursu (nie dashboard)
  const handleBack = () => {
    navigate(`/teacher?tab=assignments&courseId=${courseId}`);
  };

  return (
    <div className="assignment-submissions-container">
      <button className="back-btn" onClick={handleBack}>&larr; Back to Assignments</button>
      <h2>Assignment Submissions</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Comment</th>
              <th>Link</th>
              <th>Grade</th>
              <th>Grade (AGH)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.student_id}>
                <td>{sub.student_name}</td>
                <td>{sub.student_id}</td>
                <td>{sub.student_email}</td>
                <td>{sub.submission_link ? 'Yes' : 'No'}</td>
                <td>{sub.submission_comment || '-'}</td>
                <td>
                  {sub.submission_link ? (
                    <a href={sub.submission_link} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    <span style={{ color: '#aaa' }}>No link</span>
                  )}
                </td>
                <td>{sub.grade !== null && sub.grade !== undefined ? sub.grade : '-'}</td>
                <td>{sub.grade !== null && sub.grade !== undefined ? (
                  (() => {
                    if (sub.grade < 50) return '2.0';
                    if (sub.grade < 60) return '3.0';
                    if (sub.grade < 70) return '3.5';
                    if (sub.grade < 80) return '4.0';
                    if (sub.grade < 90) return '4.5';
                    return '5.0';
                  })()
                ) : '-'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <select
                      value={gradingFormat[sub.student_id] || 'percentage'}
                      onChange={e => setGradingFormat(f => ({ ...f, [sub.student_id]: e.target.value }))}
                      style={{ marginBottom: 4 }}
                    >
                      <option value="percentage">%</option>
                      <option value="scale">AGH scale</option>
                    </select>
                    {gradingFormat[sub.student_id] === 'scale' ? (
                      <select
                        value={grading[sub.student_id] || ''}
                        onChange={e => setGrading(g => ({ ...g, [sub.student_id]: e.target.value }))}
                        style={{ width: 70 }}
                      >
                        <option value="">Select</option>
                        {aghScaleOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={grading[sub.student_id] !== undefined ? grading[sub.student_id] : ''}
                        onChange={e => setGrading(g => ({ ...g, [sub.student_id]: e.target.value }))}
                        style={{ width: 70 }}
                        placeholder="%"
                      />
                    )}
                    <button
                      className="save-btn"
                      onClick={() => handleGrade(sub.student_id)}
                      disabled={saving[sub.student_id] || grading[sub.student_id] === '' || grading[sub.student_id] === undefined}
                    >
                      {saving[sub.student_id] ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssignmentSubmissions; 