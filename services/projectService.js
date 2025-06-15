const Project = require('../models/Project');
const Episode = require('../models/Episode');

class ProjectService {
  // Get all projects for a user
  async getUserProjects(userId) {
    const projects = await Project.find({ userId })
      .sort({ createdAt: -1 });

    return {
      count: projects.length,
      projects
    };
  }

  // Get a specific project by ID
  async getProjectById(projectId, userId) {
    const project = await Project.findOne({
      _id: projectId,
      userId
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  // Create a new project
  async createProject(projectData, userId) {
    const { name } = projectData;

    // Check if project with same name exists for this user
    const existingProject = await Project.findOne({
      name,
      userId
    });

    if (existingProject) {
      throw new Error('Project with this name already exists');
    }

    const project = new Project({
      name,
      userId
    });

    await project.save();
    return project;
  }

  // Delete a project
  async deleteProject(projectId, userId) {
    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Delete all episodes associated with this project
    await Episode.deleteMany({ projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    return { message: 'Project deleted successfully' };
  }

  // Get all episodes for a specific project
  async getProjectEpisodes(projectId, userId) {
    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const episodes = await Episode.find({ projectId })
      .sort({ createdAt: -1 });

    return {
      count: episodes.length,
      episodes,
      project: {
        id: project._id,
        name: project.name
      }
    };
  }
}

module.exports = new ProjectService(); 