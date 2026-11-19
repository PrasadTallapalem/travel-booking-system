const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // per person, INR
    days: { type: Number, required: true, min: 1 },
    seats: { type: Number, required: true, min: 0 }, // seats still available
    category: {
      type: String,
      enum: ['Beach', 'Mountain', 'City', 'Heritage', 'Adventure', 'Wildlife'],
      default: 'City',
    },
    highlights: [String],
    startDates: [Date],
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
