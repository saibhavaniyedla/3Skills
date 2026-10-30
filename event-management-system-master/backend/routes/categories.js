const express = require('express');
const { Category, Event } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public: list categories (used for filters + booking form)
router.get('/', async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(categories);
});

// Admin: create category
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Could not create category', error: err.message });
  }
});

// Admin: update category
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Could not update category', error: err.message });
  }
});

// Admin: delete category
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const inUse = await Event.count({ where: { categoryId: req.params.id } });
    if (inUse > 0) {
      return res.status(409).json({ message: 'Cannot delete a category that is still used by events' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete category', error: err.message });
  }
});

module.exports = router;
