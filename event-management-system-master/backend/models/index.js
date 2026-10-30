const User = require('./User');
const Category = require('./Category');
const Event = require('./Event');
const Booking = require('./Booking');

// Category <-> Event
Category.hasMany(Event, { foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Event.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Event (createdBy)
User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Event <-> Booking
Event.hasMany(Booking, { foreignKey: 'eventId', onDelete: 'CASCADE' });
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = { User, Category, Event, Booking };
