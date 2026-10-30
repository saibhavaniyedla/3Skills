const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const storagePath = process.env.DB_STORAGE || './data/event_management.sqlite';
const resolvedPath = path.resolve(storagePath);

// Make sure the folder for the .sqlite file exists
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolvedPath,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`SQLite connected: ${resolvedPath}`);
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
