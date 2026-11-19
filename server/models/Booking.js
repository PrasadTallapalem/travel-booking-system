const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    travelDate: { type: Date, required: true },
    travelers: { type: Number, required: true, min: 1, max: 10 },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking'], default: 'card' },
    paymentStatus: { type: String, enum: ['paid', 'refunded'], default: 'paid' },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    reference: { type: String, unique: true },
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function (next) {
  if (!this.reference) {
    this.reference = 'TRV' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
