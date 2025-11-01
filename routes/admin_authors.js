const express = require('express');
const router = express.Router();
const { readData, readDataById, insertData, updateData, deleteData } = require('../utils/dbOperations');
const { getNextSequenceValue } = require('../db');
const authorSchema = require('../models/authorSchema');
const collectionName = 'authors';
const resourceName = 'Author';

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Middleware for validation (re-using the Joi schema from models)
const validateAuthor = (req, res, next) => {
  // Convert comma-separated strings to arrays
  if (req.body.genre && typeof req.body.genre === 'string') {
    req.body.genre = req.body.genre.split(',').map(item => item.trim()).filter(item => item);
  }
  if (req.body.books && typeof req.body.books === 'string') {
    req.body.books = req.body.books.split(',').map(item => item.trim()).filter(item => item);
  }

  const { error } = authorSchema.validate(req.body);
  if (error) {
    return res.status(400).render('admin/error', { message: error.details.map(d => d.message).join(', ') });
  }
  next();
};

// GET all authors
router.get('/', async (req, res) => {
  const authors = await readData(collectionName);
  res.render('admin/authors/index', { authors });
});

// GET form to add new author
router.get('/new', (req, res) => {
  res.render('admin/authors/new', { author: {} });
});

// POST new author
router.post('/', validateAuthor, async (req, res) => {
  try {
    const newAuthor = { 
      ...req.body,
      slug: generateSlug(req.body.name)
    };
    await insertData(collectionName, newAuthor);
    res.redirect('/admin/authors');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// GET form to edit author
router.get('/edit/:id', async (req, res) => {
  const author = await readDataById(collectionName, req.params.id);
  if (!author) {
    return res.render('admin/error', { message: `${resourceName} not found` });
  }
  res.render('admin/authors/edit', { author });
});

// POST update author
router.post('/edit/:id', validateAuthor, async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.name)
    };
    const result = await updateData(collectionName, req.params.id, updatedData);
    if (result.matchedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/authors');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// POST delete author
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/authors');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

module.exports = router;