const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Event extends Model {}

Event.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.STRING, defaultValue: '' },
    location: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, defaultValue: '' },
    capacity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'upcoming',
    },
  },
  { sequelize, modelName: 'Event' }
);

module.exports = Event;
