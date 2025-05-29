const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Episode = require('../models/Episode');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a specific project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    // Check if project with same name exists for this user
    const existingProject = await Project.findOne({
      name,
      userId: req.user._id
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project with this name already exists'
      });
    }

    const project = new Project({
      name,
      userId: req.user._id
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all episodes associated with this project
    await Episode.deleteMany({ projectId: id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
});

// @route   GET /api/projects/:id/episodes
// @desc    Get all episodes for a specific project
// @access  Private
router.get('/:id/episodes', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const episodes = await Episode.find({ projectId: id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: episodes.length,
      episodes,
      project: {
        id: project._id,
        name: project.name
      }
    });
  } catch (error) {
    console.error('Get episodes error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching episodes'
    });
  }
});

module.exports = router; 