const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route  POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, password, phone });
    const token = signToken(user.id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// @route  POST /api/auth/login  (used by both user and admin login screens)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: (email || '').toLowerCase() } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.status === 'blocked') return res.status(403).json({ message: 'This account has been blocked' });

    const match = await user.comparePassword(password || '');
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @route  PUT /api/auth/profile  (User Profile Management)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
});

module.exports = router;
