import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (clearError) {
      clearError();
    }
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const QuesAILogo = ({ color = "white" }) => (
    <div className={`logo ${color}`}>
      <img 
        src={color === "white" ? "/assets/QuesAi_white.png" : "/assets/QuesLogo.png"}
        alt="Ques.AI Logo" 
        className="logo-image"
        style={{ height: '32px', width: 'auto' }}
      />
    </div>
  );

  return (
    <div className="login-container">
      {/* Left Side - Purple Gradient */}
      <div className="login-left">
        <div className="left-content">
          <QuesAILogo color="white" />
          <div className="left-text">
            <h1>Your podcast will no longer be just a hobby.</h1>
            <p>Supercharge Your Distribution using our AI assistant!</p>
          </div>
        </div>
        <div className="wave-pattern"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-right">
        <div className="right-content">
          <div className="right-header">
            <QuesAILogo color="purple" />
          </div>

          <div className="form-container">
            <div className="form-header">
              <h2>Welcome to</h2>
              <h2 className="brand-name">Ques.AI</h2>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  autoComplete="username"
                  required
                />
                {validationErrors.username && (
                  <span className="field-error">{validationErrors.username}</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                />
                {validationErrors.email && (
                  <span className="field-error">{validationErrors.email}</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                />
                {validationErrors.password && (
                  <span className="field-error">{validationErrors.password}</span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                />
                {validationErrors.confirmPassword && (
                  <span className="field-error">{validationErrors.confirmPassword}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button className="google-button" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="signup-link">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 