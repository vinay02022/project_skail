const { validationResult } = require('express-validator');
const projectService = require('../services/projectService');

class ProjectController {
  // Get all projects for the authenticated user
  async getProjects(req, res) {
    try {
      const result = await projectService.getUserProjects(req.user._id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get projects error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching projects'
      });
    }
  }

  // Get a specific project by ID
  async getProject(req, res) {
    try {
      const project = await projectService.getProjectById(req.params.id, req.user._id);

      res.json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Get project error:', error.message);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create a new project
  async createProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const project = await projectService.createProject(req.body, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project
      });
    } catch (error) {
      console.error('Create project error:', error.message);
      const statusCode = error.message === 'Project with this name already exists' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete a project
  async deleteProject(req, res) {
    try {
      const result = await projectService.deleteProject(req.params.id, req.user._id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete project error:', error.message);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all episodes for a specific project
  async getProjectEpisodes(req, res) {
    try {
      const result = await projectService.getProjectEpisodes(req.params.id, req.user._id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get episodes error:', error.message);
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProjectController(); 