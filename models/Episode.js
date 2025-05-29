const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Episode name is required'],
    trim: true,
    maxlength: [200, 'Episode name cannot exceed 200 characters']
  },
  transcript: {
    type: String,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
episodeSchema.index({ projectId: 1 });

module.exports = mongoose.model('Episode', episodeSchema); 