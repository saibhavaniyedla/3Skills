const express = require('express');
const { Op } = require('sequelize');
const { User, Event, Booking } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

// @route GET /api/admin/dashboard  (Total Events, Users, Bookings)
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [totalEvents, totalUsers, totalBookings, upcomingEvents, activeBookings] = await Promise.all([
      Event.count(),
      User.count({ where: { role: 'user' } }),
      Booking.count(),
      Event.count({ where: { status: 'upcoming', date: { [Op.gte]: today } } }),
      Booking.count({ where: { status: 'approved' } }),
    ]);

    const recentBookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      totalEvents,
      totalUsers,
      totalBookings,
      upcomingEvents,
      activeBookings,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
});

// @route GET /api/admin/users  (Manage Users)
router.get('/users', async (req, res) => {
  const users = await User.findAll({ where: { role: 'user' }, order: [['createdAt', 'DESC']] });
  res.json(users.map((u) => u.toSafeObject()));
});

// @route PUT /api/admin/users/:id/status  (block / unblock)
router.put('/users/:id/status', async (req, res) => {
  const { status } = req.body; // 'active' | 'blocked'
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Status must be active or blocked' });
  }
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = status;
  await user.save();
  res.json(user.toSafeObject());
});

// @route DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.id, role: 'user' } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  await Booking.destroy({ where: { userId: req.params.id } });
  await user.destroy();
  res.json({ message: 'User deleted' });
});

module.exports = router;
