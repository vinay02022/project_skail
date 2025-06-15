const Episode = require('../models/Episode');
const Project = require('../models/Project');

class EpisodeService {
  // Create a new episode
  async createEpisode(episodeData, userId) {
    const { name, transcript, projectId, source } = episodeData;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId
    });

    if (!project) {
      throw new Error('Project not found');
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

    return episode;
  }

  // Update an episode
  async updateEpisode(episodeId, updateData, userId) {
    const { name, transcript } = updateData;

    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(episodeId).populate('projectId');

    if (!episode) {
      throw new Error('Episode not found');
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this episode');
    }

    // Update episode
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (transcript !== undefined) updateFields.transcript = transcript;

    const updatedEpisode = await Episode.findByIdAndUpdate(
      episodeId,
      updateFields,
      { new: true, runValidators: true }
    );

    return updatedEpisode;
  }

  // Get a specific episode by ID
  async getEpisodeById(episodeId, userId) {
    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(episodeId).populate('projectId');

    if (!episode) {
      throw new Error('Episode not found');
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== userId.toString()) {
      throw new Error('Not authorized to access this episode');
    }

    return episode;
  }

  // Delete an episode
  async deleteEpisode(episodeId, userId) {
    // Find episode and check if it belongs to user's project
    const episode = await Episode.findById(episodeId).populate('projectId');

    if (!episode) {
      throw new Error('Episode not found');
    }

    // Check if the project belongs to the authenticated user
    if (episode.projectId.userId.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this episode');
    }

    const projectId = episode.projectId._id;

    // Delete the episode
    await Episode.findByIdAndDelete(episodeId);

    // Update project episode count
    await Project.findByIdAndUpdate(
      projectId,
      { $inc: { episodeCount: -1 } }
    );

    return { message: 'Episode deleted successfully' };
  }
}

module.exports = new EpisodeService(); 