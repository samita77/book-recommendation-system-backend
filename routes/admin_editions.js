const express = require('express');
const router = express.Router();
const { readData, readDataById, insertData, updateData, deleteData } = require('../utils/dbOperations');
const editionSchema = require('../models/editionSchema');
const config = require('../config'); // Add this line
const collectionName = 'editions';
const resourceName = 'Edition';

// Middleware for validation (re-using the Joi schema from models)
const validateEdition = (req, res, next) => {
  const { error } = editionSchema.validate(req.body);
  if (error) {
    return res.status(400).render('admin/error', { message: error.details.map(d => d.message).join(', ') });
  }
  next();
};

// GET all editions
router.get('/', async (req, res) => {
  const editions = await readData(collectionName);
  res.render('admin/editions/index', { editions });
});

// GET form to add new edition
router.get('/new', async (req, res) => {
  const publishers = await readData(config.mongo.collections.publishers);
  res.render('admin/editions/new', { edition: {}, publishers });
});

// POST new edition
router.post('/', validateEdition, async (req, res) => {
  try {
    const newEdition = { ...req.body };
    await insertData(collectionName, newEdition);
    res.redirect('/admin/editions');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// GET form to edit edition
router.get('/edit/:id', async (req, res) => {
  const edition = await readDataById(collectionName, req.params.id);
  if (!edition) {
    return res.render('admin/error', { message: `${resourceName} not found` });
  }
  const publishers = await readData(config.mongo.collections.publishers);
  res.render('admin/editions/edit', { edition, publishers });
});

// POST update edition
router.post('/edit/:id', validateEdition, async (req, res) => {
  try {
    const result = await updateData(collectionName, req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/editions');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// POST delete edition
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/editions');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

module.exports = router;
