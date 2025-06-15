import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch projects when authentication is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      console.log('Auth complete and user authenticated, fetching projects...');
      fetchProjects();
    }
  }, [authLoading, isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      const projectsData = response.data.projects || [];
      
      // Fetch episode count for each project
      const projectsWithEpisodes = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const episodesResponse = await projectAPI.getEpisodes(project._id);
            return {
              ...project,
              episodeCount: episodesResponse.data.episodes?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching episodes for project ${project._id}:`, error);
            return {
              ...project,
              episodeCount: 0
            };
          }
        })
      );
      
      setProjects(projectsWithEpisodes);
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Don't automatically logout on 401 - let AuthContext handle it
      // The 401 error will be handled by the axios interceptor or AuthContext
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    // Validate project name
    if (!newProjectName.trim()) {
      setNameError("Project Name Can't be empty");
      return;
    }

    try {
      setCreating(true);
      setError('');
      setNameError('');
      const response = await projectAPI.create({ name: newProjectName.trim() });
      setProjects([response.data.project, ...projects]);
      setNewProjectName('');
      setShowCreateModal(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Prevent card click when deleting
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId);
        setProjects(projects.filter(project => project._id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewProjectName('');
    setNameError('');
    setError('');
  };

  const getProjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (index) => {
    const colors = [
      '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', 
      '#EF4444', '#3B82F6', '#8B5A2B', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const projectDate = new Date(date);
    const diffInDays = Math.floor((now - projectDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Edited today';
    if (diffInDays === 1) return 'Edited 1 day ago';
    return `Edited ${diffInDays} days ago`;
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

  if (authLoading || loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          {authLoading ? 'Authenticating...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <QuesAILogo />
          <div className="header-actions">
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28054 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {projects.length === 0 ? (
          // Empty State
          <div className="empty-state">
            <h1 className="main-heading">Create a New Project</h1>
            
            <div className="illustration-container">
              <svg width="442" height="297" viewBox="0 0 442 297" fill="none" className="main-illustration">
                {/* Main background frame */}
                <rect x="20" y="20" width="402" height="257" rx="8" fill="#f8f9fa" stroke="#e2e8f0" strokeWidth="2"/>
                
                {/* Top bar of the frame */}
                <rect x="20" y="20" width="402" height="30" rx="8" fill="#8B5CF6"/>
                <rect x="20" y="35" width="402" height="15" fill="#8B5CF6"/>
                
                {/* Window controls */}
                <circle cx="35" cy="35" r="4" fill="white" opacity="0.8"/>
                <circle cx="50" cy="35" r="4" fill="white" opacity="0.8"/>
                <circle cx="65" cy="35" r="4" fill="white" opacity="0.8"/>
                
                {/* Main workspace area */}
                <rect x="30" y="60" width="382" height="207" rx="4" fill="white"/>
                
                {/* Desk surface */}
                <ellipse cx="221" cy="200" rx="150" ry="20" fill="#e2e8f0" opacity="0.6"/>
                
                {/* Left person */}
                <g transform="translate(80, 80)">
                  {/* Head */}
                  <circle cx="30" cy="25" r="20" fill="#8B5CF6"/>
                  {/* Hair */}
                  <path d="M 15 15 Q 30 5 45 15 Q 45 25 30 25 Q 15 25 15 15" fill="#4C1D95"/>
                  {/* Body */}
                  <rect x="10" y="45" width="40" height="50" rx="20" fill="#8B5CF6"/>
                  {/* Arms */}
                  <ellipse cx="5" cy="60" rx="8" ry="15" fill="#8B5CF6"/>
                  <ellipse cx="55" cy="60" rx="8" ry="15" fill="#8B5CF6"/>
                  {/* Shirt */}
                  <rect x="15" y="50" width="30" height="35" rx="3" fill="white"/>
                  {/* Tie */}
                  <rect x="27" y="55" width="6" height="25" rx="1" fill="#8B5CF6"/>
                  {/* Laptop */}
                  <rect x="45" y="75" width="35" height="20" rx="2" fill="#2D3748"/>
                  <rect x="47" y="77" width="31" height="16" rx="1" fill="#4A5568"/>
                  {/* Speech bubble */}
                  <ellipse cx="60" cy="35" rx="15" ry="10" fill="white" stroke="#e2e8f0"/>
                  <path d="M 50 40 L 45 45 L 55 42 Z" fill="white"/>
                  <text x="60" y="38" textAnchor="middle" fontSize="8" fill="#666">...</text>
                </g>
                
                {/* Right person */}
                <g transform="translate(280, 80)">
                  {/* Head */}
                  <circle cx="30" cy="25" r="20" fill="#EC4899"/>
                  {/* Hair */}
                  <path d="M 15 15 Q 30 5 45 15 Q 45 30 30 30 Q 15 30 15 15" fill="#BE185D"/>
                  {/* Body */}
                  <rect x="10" y="45" width="40" height="50" rx="20" fill="#EC4899"/>
                  {/* Arms */}
                  <ellipse cx="5" cy="60" rx="8" ry="15" fill="#EC4899"/>
                  <ellipse cx="55" cy="60" rx="8" ry="15" fill="#EC4899"/>
                  {/* Shirt */}
                  <rect x="15" y="50" width="30" height="35" rx="3" fill="white"/>
                  {/* Laptop */}
                  <rect x="-5" y="75" width="35" height="20" rx="2" fill="#2D3748"/>
                  <rect x="-3" y="77" width="31" height="16" rx="1" fill="#4A5568"/>
                  {/* Speech bubble */}
                  <ellipse cx="-10" cy="35" rx="15" ry="10" fill="white" stroke="#e2e8f0"/>
                  <path d="M 0 40 L 5 45 L -5 42 Z" fill="white"/>
                  <text x="-10" y="38" textAnchor="middle" fontSize="8" fill="#666">...</text>
                </g>
                
                {/* Central microphone setup */}
                <g transform="translate(200, 120)">
                  {/* Microphone stand */}
                  <rect x="20" y="0" width="3" height="60" fill="#718096"/>
                  <rect x="15" y="55" width="13" height="3" fill="#718096"/>
                  {/* Microphone */}
                  <circle cx="21.5" cy="10" r="8" fill="#4A5568"/>
                  <rect x="18" y="2" width="7" height="16" rx="3" fill="#2D3748"/>
                  {/* Audio equipment */}
                  <rect x="5" y="65" width="35" height="15" rx="2" fill="#2D3748"/>
                  <circle cx="12" cy="72" r="2" fill="#8B5CF6"/>
                  <circle cx="20" cy="72" r="2" fill="#EC4899"/>
                  <circle cx="28" cy="72" r="2" fill="#10B981"/>
                  <rect x="32" y="70" width="6" height="4" rx="1" fill="#4A5568"/>
                </g>
                
                {/* Coffee cup left */}
                <g transform="translate(120, 160)">
                  <rect x="0" y="5" width="12" height="15" rx="2" fill="white" stroke="#e2e8f0"/>
                  <rect x="2" y="7" width="8" height="11" fill="#8B5CF6" opacity="0.3"/>
                  <ellipse cx="6" cy="5" rx="6" ry="2" fill="white" stroke="#e2e8f0"/>
                  <rect x="12" y="10" width="4" height="2" rx="1" fill="#e2e8f0"/>
                </g>
                
                {/* Coffee cup right */}
                <g transform="translate(310, 160)">
                  <rect x="0" y="5" width="12" height="15" rx="2" fill="white" stroke="#e2e8f0"/>
                  <rect x="2" y="7" width="8" height="11" fill="#EC4899" opacity="0.3"/>
                  <ellipse cx="6" cy="5" rx="6" ry="2" fill="white" stroke="#e2e8f0"/>
                  <rect x="12" y="10" width="4" height="2" rx="1" fill="#e2e8f0"/>
                </g>
                
                {/* Plant */}
                <g transform="translate(360, 140)">
                  <rect x="0" y="25" width="20" height="15" rx="2" fill="#8B5CF6"/>
                  <circle cx="10" cy="20" r="12" fill="#10B981"/>
                  <circle cx="6" cy="15" r="6" fill="#059669"/>
                  <circle cx="14" cy="17" r="7" fill="#059669"/>
                  <circle cx="10" cy="10" r="4" fill="#047857"/>
                </g>
                
                {/* Sound waves */}
                <g opacity="0.6">
                  <path d="M 180 100 Q 190 95 200 100" stroke="#8B5CF6" strokeWidth="2" fill="none"/>
                  <path d="M 175 105 Q 190 98 205 105" stroke="#8B5CF6" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  <path d="M 240 100 Q 250 95 260 100" stroke="#EC4899" strokeWidth="2" fill="none"/>
                  <path d="M 235 105 Q 250 98 265 105" stroke="#EC4899" strokeWidth="1.5" fill="none" opacity="0.7"/>
                </g>
                
                {/* Floating elements */}
                <circle cx="100" cy="90" r="3" fill="#8B5CF6" opacity="0.4"/>
                <circle cx="340" cy="110" r="2" fill="#EC4899" opacity="0.4"/>
                <circle cx="380" cy="80" r="2" fill="#10B981" opacity="0.4"/>
              </svg>
            </div>

            <p className="description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            </p>

            <button 
              className="create-new-project-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="plus-icon">+</span>
              Create New Project
            </button>
          </div>
        ) : (
          // Projects List
          <div className="projects-view">
            <div className="projects-header">
              <h1>Projects</h1>
              <button 
                className="create-new-project-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <span className="plus-icon">+</span>
                Create New Project
              </button>
            </div>

            <div className="projects-grid">
              {projects.map((project, index) => (
                <div 
                  key={project._id} 
                  className="project-card"
                  onClick={() => handleProjectClick(project._id)}
                >
                  <button
                    className="project-delete-btn"
                    onClick={(e) => handleDeleteProject(e, project._id)}
                    title="Delete project"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div 
                    className="project-avatar"
                    style={{ backgroundColor: getRandomColor(index) }}
                  >
                    {getProjectInitials(project.name)}
                  </div>
                  <div className="project-info">
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-episodes">{project.episodeCount || 0} Files</p>
                    <p className="project-time">{formatTimeAgo(project.updatedAt || project.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Project</h2>
            
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Enter Project Name:</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Type here"
                  className={nameError ? 'error' : ''}
                />
                {nameError && (
                  <span className="error-text">{nameError}</span>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="create-btn"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 