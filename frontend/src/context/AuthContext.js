import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// API base URL - use environment variable or here also fallback to localhost safety error
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  networkError: false
};

const authReducer = (state, action) => {
  // console.log('AuthReducer called with action:', action.type, action.payload ? 'with payload' : 'no payload');
  switch (action.type) {
    case 'SET_LOADING':
      if (state.loading === action.payload) return state;
      return {
        ...state,
        loading: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        networkError: false
      };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload || null,
        networkError: false
      };
    case 'CLEAR_ERROR':
      if (!state.error) return state;
      return {
        ...state,
        error: null
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        networkError: false,
        error: null
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.payload,
        loading: true,
        networkError: false
      };
    case 'NETWORK_ERROR':
      return {
        ...state,
        loading: false,
        networkError: true,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initialized = useRef(false);
  const retryTimeoutRef = useRef(null);
  const initializingRef = useRef(false);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      dispatch({ type: 'LOAD_USER', payload: response.data.user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Failed to load user' });
    }
  };

  const loadUserFromToken = useCallback(async (token) => {
    try {
      // console.log('loadUserFromToken called with token:', token ? 'present' : 'missing');
      // First restore the token to state
      dispatch({ type: 'RESTORE_TOKEN', payload: token });
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      console.log('I am reached Till now, Token validation successful:', response.data);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: response.data.user, 
          token: token 
        } 
      });
    } catch (error) {
      console.error('-----------here Token validation error is coming---------------------', error);
      
      // Only remove token if it's actually invalid (401/403), not for network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        // Network error - keep the token but show as not authenticated temporarily
        console.log('Network error during token validation, keeping token for retry');
        dispatch({ type: 'NETWORK_ERROR' });
        
        // Retry after 3 seconds
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          console.log('Retrying token validation...');
          loadUserFromToken(token);
        }, 3000);
      } else {
        // Other errors - remove token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: 'AUTH_ERROR', payload: 'Authentication failed' });
      }
    }
  }, []);

  // Set auth token in axios headers
  useEffect(() => {
    console.log('Token effect triggered. Current token:', state.token ? `${state.token.substring(0, 20)}...` : 'null', 'initialized:', initialized.current, 'loading:', state.loading);
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
      console.log('Token set in localStorage and axios headers');
    } else if (initialized.current && !state.loading) {
      // Only remove token if we have initialized and are not loading
      // This prevents removing the token during the initial load
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      console.log('Token removed from localStorage and axios headers');
    } else {
      console.log('Skipping token removal - not initialized or still loading');
    }
  }, [state.token, state.loading]);

  // Load user on app start
  useEffect(() => {
    if (initialized.current || initializingRef.current || state.isAuthenticated) {
      console.log('Auth already initialized, initializing, or user already authenticated, skipping...');
      return;
    }
    
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      initializingRef.current = true;
      initialized.current = true;
      
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (token) {
        console.log('Found token in localStorage, validating...');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await loadUserFromToken(token);
      } else {
        console.log('No token found in localStorage');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
      initializingRef.current = false;
    };
    
    initializeAuth();
  }, [loadUserFromToken]);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.success) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
        return { success: true };
      } else {
        const message = response.data.message || 'Registration failed';
        dispatch({ type: 'AUTH_ERROR', payload: message });
        return { success: false, message };
      }
    } catch (error) {
      let message = 'Registration failed';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Network error. Please check if the server is running.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  }, []);

  const login = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, userData);
      
      if (response.data.success) {
        console.log('Login successful, dispatching LOGIN_SUCCESS with token:', response.data.token ? `${response.data.token.substring(0, 20)}...` : 'null');
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
        return { success: true };
      } else {
        const message = response.data.message || 'Login failed';
        dispatch({ type: 'AUTH_ERROR', payload: message });
        return { success: false, message };
      }
    } catch (error) {
      let message = 'Login failed';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Network error. Please check if the server is running.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearError,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 