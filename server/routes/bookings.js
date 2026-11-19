const router = require('express').Router();
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Create booking (seats are reserved atomically so two people can't take the last seat)
router.post('/', protect, async (req, res) => {
  try {
    const { packageId, travelDate, travelers, paymentMethod } = req.body;
    const count = Number(travelers);
    if (!packageId || !travelDate || !count || count < 1 || count > 10)
      return res.status(400).json({ message: 'Choose a date and 1–10 travelers' });
    if (new Date(travelDate) < new Date(new Date().toDateString()))
      return res.status(400).json({ message: 'Travel date cannot be in the past' });

    const pkg = await Package.findOneAndUpdate(
      { _id: packageId, seats: { $gte: count } },
      { $inc: { seats: -count } },
      { new: true }
    );
    if (!pkg) return res.status(400).json({ message: 'Not enough seats left for this package' });

    try {
      const booking = await Booking.create({
        user: req.user._id,
        package: pkg._id,
        travelDate,
        travelers: count,
        totalPrice: pkg.price * count,
        paymentMethod: paymentMethod || 'card',
      });
      res.status(201).json(await booking.populate('package'));
    } catch (err) {
      await Package.findByIdAndUpdate(pkg._id, { $inc: { seats: count } }); // roll back seats
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('package').sort('-createdAt');
  res.json(bookings);
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();
    await Package.findByIdAndUpdate(booking.package, { $inc: { seats: booking.travelers } });
    res.json(await booking.populate('package'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: dashboard stats + all bookings (stats route must come before '/')
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  const [users, packages, bookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Package.countDocuments(),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);
  res.json({ users, packages, bookings, revenue: revenueAgg[0]?.total || 0 });
});

router.get('/', protect, adminOnly, async (req, res) => {
  const bookings = await Booking.find()
    .populate('package', 'title destination')
    .populate('user', 'name email')
    .sort('-createdAt');
  res.json(bookings);
});

module.exports = router;
