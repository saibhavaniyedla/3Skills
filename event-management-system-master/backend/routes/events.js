const express = require('express');
const { Op } = require('sequelize');
const { Event, Category, Booking } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Attaches a bookedCount (seats taken by active bookings) to each event
const withBookedCounts = async (events) => {
  const list = Array.isArray(events) ? events : [events];
  const ids = list.map((e) => e.id);
  const bookings = await Booking.findAll({
    where: { eventId: ids, status: { [Op.in]: ['pending', 'approved'] } },
    attributes: ['eventId', 'seats'],
  });
  const counts = {};
  bookings.forEach((b) => {
    counts[b.eventId] = (counts[b.eventId] || 0) + b.seats;
  });
  const enriched = list.map((e) => {
    const json = e.toJSON();
    json.bookedCount = counts[e.id] || 0;
    return json;
  });
  return Array.isArray(events) ? enriched : enriched[0];
};

// @route GET /api/events
// Public: view upcoming events, with search & filter
// Query params: q (search text), category, from, to, location, status
router.get('/', async (req, res) => {
  try {
    const { q, category, from, to, location, status } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    } else if (!status) {
      // default: only show non-cancelled events to end users
      where.status = { [Op.ne]: 'cancelled' };
    }
    // status === 'all' -> no status filter (used by admin management view)

    if (category) where.categoryId = category;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { location: { [Op.like]: `%${q}%` } },
      ];
    }

    const events = await Event.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['date', 'ASC']],
    });

    res.json(await withBookedCounts(events));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

// @route GET /api/events/:id  (Event Details Page)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(await withBookedCounts(event));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event', error: err.message });
  }
});

// @route POST /api/events  (Admin: Add New Event)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, category, date, time, location, imageUrl, capacity, price } = req.body;
    if (!title || !description || !category || !date || !location || !capacity) {
      return res.status(400).json({ message: 'Missing required event fields' });
    }
    const event = await Event.create({
      title,
      description,
      categoryId: category,
      date,
      time,
      location,
      imageUrl,
      capacity,
      price,
      createdBy: req.user.id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
});

// @route PUT /api/events/:id  (Admin: Edit Event)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const payload = { ...req.body };
    if (payload.category) {
      payload.categoryId = payload.category;
      delete payload.category;
    }
    await event.update(payload);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: err.message });
  }
});

// @route DELETE /api/events/:id  (Admin: Delete Event)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  await Booking.destroy({ where: { eventId: req.params.id } });
  await event.destroy();
  res.json({ message: 'Event deleted' });
});

module.exports = router;
