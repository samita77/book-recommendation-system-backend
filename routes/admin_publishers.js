const express = require('express');
const router = express.Router();
const { readData, readDataById, insertData, updateData, deleteData } = require('../utils/dbOperations');
const publisherSchema = require('../models/publisherSchema');
const collectionName = 'publishers';
const resourceName = 'Publisher';

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Remove multiple hyphens
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

// Middleware for validation (re-using the Joi schema from models)
const validatePublisher = (req, res, next) => {
  const { error } = publisherSchema.validate(req.body);
  if (error) {
    return res.status(400).render('admin/error', { message: error.details.map(d => d.message).join(', ') });
  }
  next();
};

// GET all publishers
router.get('/', async (req, res) => {
  const publishers = await readData(collectionName);
  res.render('admin/publishers/index', { publishers });
});

// GET form to add new publisher
router.get('/new', (req, res) => {
  res.render('admin/publishers/new', { publisher: {} });
});

// POST new publisher
router.post('/', validatePublisher, async (req, res) => {
  try {
    const newPublisher = { ...req.body,
      slug: generateSlug(req.body.name)
    };
    await insertData(collectionName, newPublisher);
    res.redirect('/admin/publishers');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// GET form to edit publisher
router.get('/edit/:id', async (req, res) => {
  const publisher = await readDataById(collectionName, req.params.id);
  if (!publisher) {
    return res.render('admin/error', { message: `${resourceName} not found` });
  }
  res.render('admin/publishers/edit', { publisher });
});

// POST update publisher
router.post('/edit/:id', validatePublisher, async (req, res) => {
  try {
    const updatedData = { ...req.body,
      slug: generateSlug(req.body.name)
    };
    const result = await updateData(collectionName, req.params.id, updatedData);
    if (result.matchedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/publishers');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// POST delete publisher
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/publishers');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

module.exports = router;