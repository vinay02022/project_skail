const express = require('express');
const { body } = require('express-validator');
const episodeController = require('../controllers/episodeController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/episodes
// @desc    Create a new episode
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Episode name is required')
    .isLength({ max: 200 }).withMessage('Episode name cannot exceed 200 characters'),
  body('transcript').optional(),
  body('projectId').notEmpty().withMessage('Project ID is required')
], episodeController.createEpisode);

// @route   PUT /api/episodes/:id
// @desc    Update an episode
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().isLength({ max: 200 }).withMessage('Episode name cannot exceed 200 characters'),
  body('transcript').optional().notEmpty().withMessage('Transcript cannot be empty')
], episodeController.updateEpisode);

// @route   GET /api/episodes/:id
// @desc    Get a specific episode by ID
// @access  Private
router.get('/:id', auth, episodeController.getEpisode);

// @route   DELETE /api/episodes/:id
// @desc    Delete an episode
// @access  Private
router.delete('/:id', auth, episodeController.deleteEpisode);

module.exports = router; 