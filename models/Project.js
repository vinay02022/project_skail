const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  episodeCount: {
    type: Number,
    default: 0,
    min: [0, 'Episode count cannot be negative']
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ userId: 1 });

module.exports = mongoose.model('Project', projectSchema); 