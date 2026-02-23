const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  travelDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  source: {
    type: String,
    enum: ['Facebook', 'Instagram', 'Website', 'Referral', 'WhatsApp', 'Walk-in', 'Phone Call', 'Email', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Quotation Sent', 'Flight Booked', 'Hotel Booked', 'Confirmed', 'Cancelled', 'Lost'],
    default: 'New'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  followUpDate: {
    type: Date
  },
  numberOfTravelers: {
    type: Number,
    default: 1,
    min: 1
  },
  tripType: {
    type: String,
    enum: ['One-way', 'Round-trip', 'Multi-city', 'Package'],
    default: 'Package'
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  revenue: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
