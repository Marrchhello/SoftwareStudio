import React, { useState, useCallback } from 'react';
import { 
  FaDownload, FaFilePdf, FaFileWord, FaFilePowerpoint, 
  FaFileImage, FaFileAlt, FaFileArchive, FaUpload,
  FaChalkboardTeacher, FaFlask, FaTasks, FaBookOpen,
  FaTimes, FaCloudUploadAlt, FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Materials.css';

const Materials = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lectures');
  const [uploadModal, setUploadModal] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);


  const [courseMaterials, setCourseMaterials] = useState({
    lectures: [
      {
        id: 1,
        name: 'Lecture 1: Introduction',
        type: 'Lecture Slides',
        fileType: 'pdf',
        date: '2025-05-15',
        size: '2.4 MB',
        downloadLink: '#'
      }
    ],
    labs: [
      {
        id: 2,
        name: 'Lab 1: Setup Guide',
        type: 'Lab Manual',
        fileType: 'doc',
        date: '2025-05-18',
        size: '1.5 MB',
        downloadLink: '#'
      }
    ],
    assignments: [
      {
        id: 3,
        name: 'Programming Assignment 1',
        type: 'Code Submission',
        fileType: 'zip',
        date: 'Due: 2025-06-10',
        status: 'Not submitted'
      },
      {
        id: 4,
        name: 'Lab2',
        type: 'Document',
        fileType: 'doc',
        date: 'Due: 2025-06-17',
        status: 'Submitted'
      }
    ],
    additional: [
      {
        id: 5,
        name: 'Recommended Reading',
        type: 'Article',
        fileType: 'pdf',
        date: '2025-05-16',
        size: '0.8 MB',
        downloadLink: '#'
      }
    ]
  });


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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };


  const handleUploadClick = (assignmentId) => {
    setUploadModal(assignmentId);
    setUploadComplete(false);
    setUploadProgress(0);
  };

  const closeModal = () => {
    setUploadModal(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };


  const submitUpload = () => {
    if (!selectedFile) return;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          

          setCourseMaterials(prev => ({
            ...prev,
            assignments: prev.assignments.map(assignment => 
              assignment.id === uploadModal 
                ? { ...assignment, status: 'Submitted' } 
                : assignment
            )
          }));
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };


  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FaFilePdf className="file-icon pdf" />;
      case 'doc': return <FaFileWord className="file-icon doc" />;
      case 'ppt': return <FaFilePowerpoint className="file-icon ppt" />;
      case 'img': return <FaFileImage className="file-icon img" />;
      case 'zip': return <FaFileArchive className="file-icon zip" />;
      default: return <FaFileAlt className="file-icon generic" />;
    }
  };

  return (
    <div className="materials-view">
      <div className="materials-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back to Courses
        </button>
        <h2>Course Materials</h2>
        <div className="course-info">
          <h3>Advanced Programming (CS101)</h3>
          <p>Lecturer: Dr. Smith | Group: Group 3</p>
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
              {getFileIcon(material.fileType)}
              <h4>{material.name}</h4>
            </div>
            <div className="material-details">
              <p><span>Type:</span> {material.type}</p>
              <p><span>Date:</span> {material.date}</p>
              {activeTab !== 'assignments' && <p><span>Size:</span> {material.size}</p>}
              {activeTab === 'assignments' && <p><span>Status:</span> {material.status}</p>}
            </div>
            <div className="material-actions">
              {activeTab === 'assignments' ? (
                <button 
                  className="upload-btn"
                  onClick={() => handleUploadClick(material.id)}
                >
                  <FaUpload /> Upload Solution
                </button>
              ) : (
                <a href={material.downloadLink} className="download-btn">
                  <FaDownload /> Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal do uploadu */}
      {uploadModal && (
        <div className="upload-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              <FaTimes />
            </button>
            <h3>Upload Solution</h3>
            <p>For: {courseMaterials.assignments.find(a => a.id === uploadModal)?.name}</p>
            
            {!uploadComplete ? (
              <>
                <div 
                  className={`drop-zone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FaCloudUploadAlt className="upload-icon" />
                  {selectedFile ? (
                    <>
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <p>Drag & drop your file here</p>
                      <p className="small-text">or</p>
                      <label className="file-input-label">
                        Browse Files
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          className="file-input"
                        />
                      </label>
                    </>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}

                <div className="modal-actions">
                  <button onClick={closeModal} className="cancel-btn">
                    Cancel
                  </button>
                  <button 
                    onClick={submitUpload} 
                    className="submit-btn"
                    disabled={!selectedFile || uploadProgress > 0}
                  >
                    {uploadProgress > 0 ? 'Uploading...' : 'Upload Solution'}
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-complete">
                <FaCheck className="success-icon" />
                <h4>Upload Complete!</h4>
                <p>Your solution has been successfully submitted.</p>
                <button onClick={closeModal} className="done-btn">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;