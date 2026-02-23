const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'status_change', 'assignment', 'call', 'email', 'meeting', 'follow_up', 'system'],
    default: 'note'
  },
  content: {
    type: String,
    required: [true, 'Activity content is required'],
    trim: true
  },
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

activitySchema.index({ lead: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
