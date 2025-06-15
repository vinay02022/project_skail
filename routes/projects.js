const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', auth, projectController.getProjects);

// @route   GET /api/projects/:id
// @desc    Get a specific project by ID
// @access  Private
router.get('/:id', auth, projectController.getProject);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters')
], projectController.createProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, projectController.deleteProject);

// @route   GET /api/projects/:id/episodes
// @desc    Get all episodes for a specific project
// @access  Private
router.get('/:id/episodes', auth, projectController.getProjectEpisodes);

module.exports = router; 