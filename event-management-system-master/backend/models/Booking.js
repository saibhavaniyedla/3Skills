const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Booking extends Model {}

Booking.init(
  {
    seats: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1 } },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'approved',
    },
  },
  { sequelize, modelName: 'Booking' }
);

module.exports = Booking;
