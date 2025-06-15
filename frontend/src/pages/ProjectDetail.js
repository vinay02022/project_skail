import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, episodeAPI } from '../utils/api';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [project, setProject] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modal states
  const [showRSSModal, setShowRSSModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [youtubeForm, setYoutubeForm] = useState({ name: '', transcript: '' });
  const [uploadForm, setUploadForm] = useState({ name: '', transcript: '', file: null });
  const [rssForm, setRssForm] = useState({ url: '' });
  const [editForm, setEditForm] = useState({ name: '', transcript: '' });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectResponse, episodesResponse] = await Promise.all([
        projectAPI.getById(projectId),
        projectAPI.getEpisodes(projectId)
      ]);
      
      setProject(projectResponse.data.project);
      setEpisodes(episodesResponse.data.episodes || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleYouTubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeForm.name.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await episodeAPI.create({
        name: youtubeForm.name,
        transcript: youtubeForm.transcript,
        projectId: projectId,
        source: 'youtube'
      });
      
      setEpisodes([response.data.episode, ...episodes]);
      setYoutubeForm({ name: '', transcript: '' });
      setShowYouTubeModal(false);
    } catch (error) {
      setError('Failed to create episode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await episodeAPI.create({
        name: uploadForm.name,
        transcript: uploadForm.transcript,
        projectId: projectId,
        source: 'upload'
      });
      
      setEpisodes([response.data.episode, ...episodes]);
      setUploadForm({ name: '', transcript: '', file: null });
      setShowUploadModal(false);
    } catch (error) {
      setError('Failed to upload episode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEpisode = async (episodeId) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) return;
    
    try {
      await episodeAPI.delete(episodeId);
      setEpisodes(episodes.filter(ep => ep._id !== episodeId));
    } catch (error) {
      setError('Failed to delete episode');
    }
  };

  const handleViewEpisode = (episode) => {
    setSelectedEpisode(episode);
    setEditForm({ name: episode.name, transcript: episode.transcript || '' });
    setIsEditing(false);
    setShowViewModal(true);
  };

  const handleEditEpisode = () => {
    setIsEditing(true);
  };

  const handleSaveEpisode = async () => {
    if (!selectedEpisode || !editForm.name.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await episodeAPI.update(selectedEpisode._id, {
        name: editForm.name,
        transcript: editForm.transcript
      });
      
      // Update the episode in the list
      setEpisodes(episodes.map(ep => 
        ep._id === selectedEpisode._id 
          ? { ...ep, name: editForm.name, transcript: editForm.transcript }
          : ep
      ));
      
      setSelectedEpisode({ ...selectedEpisode, name: editForm.name, transcript: editForm.transcript });
      setIsEditing(false);
    } catch (error) {
      setError('Failed to save episode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscardChanges = () => {
    setEditForm({ name: selectedEpisode.name, transcript: selectedEpisode.transcript || '' });
    setIsEditing(false);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEpisode(null);
    setIsEditing(false);
    setEditForm({ name: '', transcript: '' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHelpClick = () => {
    window.location.href = 'mailto:vinay.work25@gmail.com?subject=Ques.AI Support&body=Hello, I need help with...';
  };

  const QuesAILogo = () => (
    <div className="header-logo">
      <img 
        src="/assets/QuesLogo.png" 
        alt="Ques.AI Logo" 
        className="logo-image"
        style={{ height: '32px', width: 'auto' }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-container">
        <div className="error-message">Project not found</div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      {/* Header */}
      <header className="project-header">
        <div className="header-content">
          <QuesAILogo />
          <div className="breadcrumb">
            <span onClick={() => navigate('/dashboard')} className="breadcrumb-link">Home Page</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{project.name}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Add your podcast</span>
          </div>
          <div className="header-actions">
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="icon-button" onClick={handleLogout} title="Logout">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="project-layout">
        {/* Sidebar */}
        <aside className={`project-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d={sidebarCollapsed ? "M11 17L6 12L11 7M18 17L13 12L18 7" : "M13 17L18 12L13 7M6 17L11 12L6 7"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <span className="nav-icon">+</span>
              {!sidebarCollapsed && <span className="nav-text">Add your Podcast(s)</span>}
            </div>
            <div className="nav-item">
              <span className="nav-icon">✏️</span>
              {!sidebarCollapsed && <span className="nav-text">Create & Repurpose</span>}
            </div>
            <div className="nav-item">
              <span className="nav-icon">📊</span>
              {!sidebarCollapsed && <span className="nav-text">Podcast Widget</span>}
            </div>
            <div className="nav-item">
              <span className="nav-icon">⬆️</span>
              {!sidebarCollapsed && <span className="nav-text">Upgrade</span>}
            </div>
          </nav>

          {!sidebarCollapsed && (
            <div className="sidebar-help">
              <div className="nav-item" onClick={handleHelpClick}>
                <span className="nav-icon">❓</span>
                <span className="nav-text">Help</span>
              </div>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="sidebar-user">
              <div className="user-avatar">
                <img src="/api/placeholder/40/40" alt="User" />
              </div>
              <div className="user-info">
                <div className="user-name">{user?.username || 'Username'}</div>
                <div className="user-email">{user?.email || 'username@gmail.com'}</div>
              </div>
            </div>
          )}

          <button className="sidebar-back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </aside>

        {/* Main Content */}
        <main className="project-main">
          <h1 className="page-title">Add Podcast</h1>

          {/* Upload Options */}
          <div className="upload-options">
            <div className="upload-card" onClick={() => setShowRSSModal(true)}>
              <div className="upload-card-content">
                <h3>RSS Feed</h3>
                <p>Lorem ipsum dolor sit.</p>
                <p>Dolor lorem sit.</p>
              </div>
              <div className="upload-icon-container">
                <img src="/assets/first.png" alt="RSS Feed" className="upload-icon-image" />
              </div>
            </div>

            <div className="upload-card" onClick={() => setShowYouTubeModal(true)}>
              <div className="upload-card-content">
                <h3>Youtube Video</h3>
                <p>Lorem ipsum dolor sit.</p>
                <p>Dolor lorem sit.</p>
              </div>
              <div className="upload-icon-container">
                <img src="/assets/second.png" alt="Youtube Video" className="upload-icon-image" />
              </div>
            </div>

            <div className="upload-card" onClick={() => setShowUploadModal(true)}>
              <div className="upload-card-content">
                <h3>Upload Files</h3>
                <p>Lorem ipsum dolor sit.</p>
                <p>Dolor lorem sit.</p>
              </div>
              <div className="upload-icon-container">
                <img src="/assets/third.png" alt="Upload Files" className="upload-icon-image" />
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="file-upload-area">
            <div className="upload-cloud">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Select a file or drag and drop here (Podcast Media or Transcription Text)</h3>
            <p>MP4, MOV, MP3, WAV, PDF, DOCX or TXT file</p>
            <button className="select-file-btn" onClick={() => setShowUploadModal(true)}>
              Select File
            </button>
          </div>

          {/* Your Files Section */}
          {episodes.length > 0 && (
            <div className="files-section">
              <h2>Your Files</h2>
              <div className="files-table">
                <div className="table-header">
                  <div className="col-no">No.</div>
                  <div className="col-name">Name</div>
                  <div className="col-date">Upload Date & Time</div>
                  <div className="col-action">Action</div>
                </div>
                {episodes.map((episode, index) => (
                  <div key={episode._id} className="table-row">
                    <div className="col-no">{index + 1}</div>
                    <div className="col-name">{episode.name}</div>
                    <div className="col-date">{formatDate(episode.createdAt)}</div>
                    <div className="col-action">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewEpisode(episode)}
                      >
                        View
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteEpisode(episode._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RSS Modal */}
      {showRSSModal && (
        <div className="modal-overlay" onClick={() => setShowRSSModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon rss-icon">📡</div>
                RSS Feed
              </div>
              <button className="modal-close" onClick={() => setShowRSSModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // RSS handling would go here
              setShowRSSModal(false);
            }}>
              <div className="form-group">
                <label htmlFor="rss-url">RSS URL</label>
                <input
                  type="url"
                  id="rss-url"
                  value={rssForm.url}
                  onChange={(e) => setRssForm({ url: e.target.value })}
                  placeholder="Enter RSS feed URL"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRSSModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Modal */}
      {showYouTubeModal && (
        <div className="modal-overlay" onClick={() => setShowYouTubeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon youtube-icon">▶</div>
                Upload from Youtube
              </div>
              <button className="modal-close" onClick={() => setShowYouTubeModal(false)}>×</button>
            </div>
            <form onSubmit={handleYouTubeSubmit}>
              <div className="form-group">
                <label htmlFor="youtube-name">Name</label>
                <input
                  type="text"
                  id="youtube-name"
                  value={youtubeForm.name}
                  onChange={(e) => setYoutubeForm({ ...youtubeForm, name: e.target.value })}
                  placeholder="Enter episode name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="youtube-transcript">Transcript</label>
                <textarea
                  id="youtube-transcript"
                  value={youtubeForm.transcript}
                  onChange={(e) => setYoutubeForm({ ...youtubeForm, transcript: e.target.value })}
                  placeholder="Enter episode transcript"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowYouTubeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Files Modal */}
      {showUploadModal && (
        <div className="upload-files-modal">
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <div className="modal-icon upload-icon-red">
                    <img src="/assets/second.png" alt="Upload" className="modal-icon-image" />
                  </div>
                  Upload Media Files
                </div>
                <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
              </div>
              <form onSubmit={handleFileUpload}>
                <div className="form-group">
                  <label htmlFor="upload-name">Name</label>
                  <input
                    type="text"
                    id="upload-name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="Enter file name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="upload-transcript">Description</label>
                  <textarea
                    id="upload-transcript"
                    value={uploadForm.transcript}
                    onChange={(e) => setUploadForm({ ...uploadForm, transcript: e.target.value })}
                    placeholder="Enter file description"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Episode Modal */}
      {showViewModal && selectedEpisode && (
        <div className="view-episode-modal">
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <button className="back-btn" onClick={closeViewModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span>Edit Transcript</span>
                </div>
                <div className="modal-actions-header">
                  {!isEditing ? (
                    <button className="btn-edit" onClick={handleEditEpisode}>
                      Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-discard" onClick={handleDiscardChanges}>
                        Discard
                      </button>
                      <button 
                        className="btn-save" 
                        onClick={handleSaveEpisode}
                        disabled={submitting}
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-body">
                <div className="transcript-content">
                  <div className="speaker-label">Speaker</div>
                  {!isEditing ? (
                    <div className="transcript-text">
                      {selectedEpisode.transcript || 'No transcript available'}
                    </div>
                  ) : (
                    <textarea
                      className="transcript-editor"
                      value={editForm.transcript}
                      onChange={(e) => setEditForm({ ...editForm, transcript: e.target.value })}
                      placeholder="Enter transcript..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail; 