const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  // Register a new user
  async registerUser(userData) {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }

  // Login user
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }

  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email
    };
  }
}

module.exports = new AuthService(); 