const express = require('express');
const router = express.Router();
const { readData, readDataById, insertData, updateData, deleteData } = require('../utils/dbOperations');
const bookSchema = require('../models/bookSchema');
const config = require('../config');
const collectionName = 'books';
const resourceName = 'Book';

// Middleware for validation (re-using the Joi schema from models)
const validateBook = (req, res, next) => {
  // Convert comma-separated strings to arrays
  if (req.body.genre && typeof req.body.genre === 'string') {
    req.body.genre = req.body.genre.split(',').map(item => item.trim());
  }
  if (req.body.literaryAwards && typeof req.body.literaryAwards === 'string') {
    req.body.literaryAwards = req.body.literaryAwards.split(',').map(item => item.trim());
  }
  if (req.body.setting && typeof req.body.setting === 'string') {
    req.body.setting = req.body.setting.split(',').map(item => item.trim());
  }
  if (req.body.characters && typeof req.body.characters === 'string') {
    req.body.characters = req.body.characters.split(',').map(item => item.trim());
  }

  const { error } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).render('admin/error', { message: error.details.map(d => d.message).join(', ') });
  }
  next();
};

// GET all books
router.get('/', async (req, res) => {
  const books = await readData(collectionName);
  res.render('admin/books/index', { books });
});

// GET form to add new book
router.get('/new', async (req, res) => {
  const authors = await readData(config.mongo.collections.authors);
  const editions = await readData(config.mongo.collections.editions);
  const publishers = await readData(config.mongo.collections.publishers);
  res.render('admin/books/new', { book: {}, authors, editions, publishers });
});

// POST new book
router.post('/', validateBook, async (req, res) => {
  try {
    const newBook = { ...req.body };
    // Find the author name based on authorid
    const author = await readDataById(config.mongo.collections.authors, newBook.authorid);
    if (author) {
      newBook.author = author.name;
    }
    // Find the edition details based on editionid
    const edition = await readDataById(config.mongo.collections.editions, newBook.editionid);
    if (edition) {
      newBook.edition = edition; // Store the entire edition object or relevant details
    }
    // Find the publisher name based on publisherid
    const publisher = await readDataById(config.mongo.collections.publishers, newBook.publisherid);
    if (publisher) {
      newBook.publisher = publisher.name;
    }
    await insertData(collectionName, newBook);
    res.redirect('/admin/books');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// GET form to edit book
router.get('/edit/:id', async (req, res) => {
  const book = await readDataById(collectionName, req.params.id);
  if (!book) {
    return res.render('admin/error', { message: `${resourceName} not found` });
  }
  const authors = await readData(config.mongo.collections.authors);
  const editions = await readData(config.mongo.collections.editions);
  const publishers = await readData(config.mongo.collections.publishers);
  res.render('admin/books/edit', { book, authors, editions, publishers });
});

// POST update book
router.post('/edit/:id', validateBook, async (req, res) => {
  try {
    const updatedBook = { ...req.body };
    // Find the author name based on authorid
    const author = await readDataById(config.mongo.collections.authors, updatedBook.authorid);
    if (author) {
      updatedBook.author = author.name;
    }
    // Find the edition details based on editionid
    const edition = await readDataById(config.mongo.collections.editions, updatedBook.editionid);
    if (edition) {
      updatedBook.edition = edition; // Store the entire edition object or relevant details
    }
    // Find the publisher name based on publisherid
    const publisher = await readDataById(config.mongo.collections.publishers, updatedBook.publisherid);
    if (publisher) {
      updatedBook.publisher = publisher.name;
    }
    const result = await updateData(collectionName, req.params.id, updatedBook);
    if (result.matchedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/books');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// POST delete book
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/books');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

module.exports = router;
