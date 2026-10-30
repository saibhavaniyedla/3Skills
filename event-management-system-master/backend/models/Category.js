const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Category extends Model {}

Category.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, defaultValue: '' },
  },
  { sequelize, modelName: 'Category' }
);

module.exports = Category;
