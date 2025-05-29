const express = require('express');
const { body, validationResult } = require('express-validator');
const Episode = require('../models/Episode');
const Project = require('../models/Project');
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

    const { name, transcript, projectId, source } = req.body;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Create new episode
    const episode = new Episode({
      name,
      transcript: transcript || '',
      projectId,
      source: source || 'upload'
    });

    await episode.save();

    // Update project episode count
    await Project.findByIdAndUpdate(
      projectId,
      { $inc: { episodeCount: 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Episode created successfully',
      episode
    });
  } catch (error) {
    console.error('Create episode error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating episode'
    });
  }
});

// @route   PUT /api/episodes/:id
// @desc    Update an episode
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().isLength({ max: 200 }).withMessage('Episode name cannot exceed 200 characters'),
  body('transcript').optional().notEmpty().withMessage('Transcript cannot be empty')
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

    const { id } = req.params;
    const { name, transcript } = req.body;

    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(id).populate('projectId');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this episode'
      });
    }

    // Update episode
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (transcript !== undefined) updateData.transcript = transcript;

    const updatedEpisode = await Episode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Episode updated successfully',
      episode: updatedEpisode
    });
  } catch (error) {
    console.error('Update episode error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating episode'
    });
  }
});

// @route   GET /api/episodes/:id
// @desc    Get a specific episode by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(id).populate('projectId');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this episode'
      });
    }

    res.json({
      success: true,
      episode
    });
  } catch (error) {
    console.error('Get episode error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching episode'
    });
  }
});

// @route   DELETE /api/episodes/:id
// @desc    Delete an episode
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(id).populate('projectId');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this episode'
      });
    }

    // Delete the episode
    await Episode.findByIdAndDelete(id);

    // Update project episode count
    await Project.findByIdAndUpdate(
      episode.projectId._id,
      { $inc: { episodeCount: -1 } }
    );

    res.json({
      success: true,
      message: 'Episode deleted successfully'
    });
  } catch (error) {
    console.error('Delete episode error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting episode'
    });
  }
});

module.exports = router; 