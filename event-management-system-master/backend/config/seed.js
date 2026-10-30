// Run with: npm run seed
require('dotenv').config();
const { sequelize, connectDB } = require('./db');
const { User, Category } = require('../models');

const run = async () => {
  await connectDB();
  await sequelize.sync();

  const adminEmail = 'admin@events.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail} / Admin@123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const defaultCategories = ['Conference', 'Workshop', 'Concert', 'Sports', 'Networking', 'Webinar'];
  for (const name of defaultCategories) {
    const [category, created] = await Category.findOrCreate({ where: { name }, defaults: { name } });
    if (created) console.log(`Category created: ${name}`);
  }
  console.log('Default categories ensured.');

  await sequelize.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
