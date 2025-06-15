const { validationResult } = require('express-validator');
const episodeService = require('../services/episodeService');

class EpisodeController {
  // Create a new episode
  async createEpisode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const episode = await episodeService.createEpisode(req.body, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Episode created successfully',
        episode
      });
    } catch (error) {
      console.error('Create episode error:', error.message);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update an episode
  async updateEpisode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const episode = await episodeService.updateEpisode(req.params.id, req.body, req.user._id);

      res.json({
        success: true,
        message: 'Episode updated successfully',
        episode
      });
    } catch (error) {
      console.error('Update episode error:', error.message);
      let statusCode = 500;
      if (error.message === 'Episode not found') statusCode = 404;
      if (error.message === 'Not authorized to update this episode') statusCode = 403;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get a specific episode by ID
  async getEpisode(req, res) {
    try {
      const episode = await episodeService.getEpisodeById(req.params.id, req.user._id);

      res.json({
        success: true,
        episode
      });
    } catch (error) {
      console.error('Get episode error:', error.message);
      let statusCode = 500;
      if (error.message === 'Episode not found') statusCode = 404;
      if (error.message === 'Not authorized to access this episode') statusCode = 403;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete an episode
  async deleteEpisode(req, res) {
    try {
      const result = await episodeService.deleteEpisode(req.params.id, req.user._id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete episode error:', error.message);
      let statusCode = 500;
      if (error.message === 'Episode not found') statusCode = 404;
      if (error.message === 'Not authorized to delete this episode') statusCode = 403;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EpisodeController(); 