const express = require('express');
const router = express.Router();
const { readData, insertData } = require('../utils/dbOperations');
const ratingSchema = require('../models/ratingSchema');
const auth = require('../utils/authMiddleware');
const Joi = require('joi');

const collectionName = 'ratings';

// Middleware for validation
const validateRating = (req, res, next) => {
  const { error } = ratingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map(d => d.message) });
  }
  next();
};

// POST a new rating
router.post('/', auth, validateRating, async (req, res) => {
  try {
    const { bookId, score } = req.body;
    const userId = req.user.userId; // Assuming userId is available from auth middleware

    const newRating = { userId, bookId: parseInt(bookId), score: parseInt(score) };
    const result = await insertData(collectionName, newRating);

    // Calculate and update average rating for the book
    const allRatingsForBook = await readData(collectionName);
    const bookRatings = allRatingsForBook.filter(rating => rating.bookId === bookId);
    const totalScore = bookRatings.reduce((sum, rating) => sum + rating.score, 0);
    const averageRating = totalScore / bookRatings.length;

    await updateData('books', bookId, { ratings: parseFloat(averageRating.toFixed(2)) });

    res.status(201).json({ message: 'Rating submitted successfully', ratingId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all ratings for a specific book
router.get('/book/:bookId', async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const allRatings = await readData(collectionName);
    const bookRatings = allRatings.filter(rating => rating.bookId === bookId);
    res.json(bookRatings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET the average rating for a specific book
router.get('/average/:bookId', async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const allRatings = await readData(collectionName);
    const bookRatings = allRatings.filter(rating => rating.bookId === bookId);

    if (bookRatings.length === 0) {
      return res.json({ bookId, averageRating: 0, totalRatings: 0 });
    }

    const totalScore = bookRatings.reduce((sum, rating) => sum + rating.score, 0);
    const averageRating = totalScore / bookRatings.length;

    res.json({ bookId, averageRating: parseFloat(averageRating.toFixed(2)), totalRatings: bookRatings.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
