const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await authService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        ...result
      });
    } catch (error) {
      console.error('Register error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await authService.loginUser(req.body);

      res.json({
        success: true,
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout user (client-side token removal)
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }

  // Get current user
  async getMe(req, res) {
    try {
      const user = await authService.getUserProfile(req.user._id);

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new AuthController(); 