const express = require('express');
const { Op } = require('sequelize');
const { Booking, Event, Category, User } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Set to true to require admin approval before a booking is confirmed
const REQUIRE_APPROVAL = false;

// @route POST /api/bookings  (Book/Register for an Event)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const seatCount = Number(seats) || 1;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ message: 'This event has been cancelled' });

    const existing = await Booking.findOne({
      where: { userId: req.user.id, eventId, status: { [Op.in]: ['pending', 'approved'] } },
    });
    if (existing) return res.status(409).json({ message: 'You already have a booking for this event' });

    const activeBookings = await Booking.findAll({
      where: { eventId, status: { [Op.in]: ['pending', 'approved'] } },
    });
    const seatsTaken = activeBookings.reduce((sum, b) => sum + b.seats, 0);
    if (seatsTaken + seatCount > event.capacity) {
      return res.status(400).json({ message: 'Not enough seats available for this event' });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      seats: seatCount,
      status: REQUIRE_APPROVAL ? 'pending' : 'approved',
    });

    const populated = await Booking.findByPk(booking.id, { include: [{ model: Event, as: 'event' }] });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

// @route GET /api/bookings/my  (View My Bookings)
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          as: 'event',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// @route PUT /api/bookings/:id/cancel  (Cancel Booking)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message });
  }
});

// @route GET /api/bookings  (Admin: View All Bookings)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// @route PUT /api/bookings/:id/status  (Admin: Approve/Reject Registration)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking status', error: err.message });
  }
});

module.exports = router;
