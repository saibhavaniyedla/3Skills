require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/db');
require('./models'); // registers associations

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();

const start = async () => {
  await connectDB();
  await sequelize.sync(); // creates tables if they don't exist yet

  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler
  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
