const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['advance', 'partial', 'full', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'online', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled', 'refunded'],
    default: 'received'
  },
  description: {
    type: String,
    trim: true
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Auto-generate invoice number
paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
