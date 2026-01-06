import express, { Request, Response, NextFunction } from 'express';
import { readData, readDataByQuery, insertData, updateData } from '../utils/dbOperations';
import ratingSchema from '../models/ratingSchema';
import auth from '../utils/authMiddleware';

const router = express.Router();
const collectionName = 'ratings';

// Middleware for validation
const validateRating = (req: Request, res: Response, next: NextFunction) => {
  const { error } = ratingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((d: any) => d.message) });
  }
  next();
};

// POST a new rating
router.post('/', auth, validateRating, async (req: any, res: Response) => {
  try {
    const { bookId, score } = req.body;
    const userId = req.user.userId; // Assuming userId is available from auth middleware
    const parsedBookId = parseInt(bookId);

    const newRating = { userId, bookId: parsedBookId, score: parseInt(score) };
    const result = await insertData(collectionName, newRating);

    // Calculate and update average rating for the book
    const bookRatings = await readDataByQuery(collectionName, { bookId: parsedBookId });
    const totalScore = bookRatings.reduce((sum: number, rating: any) => sum + rating.score, 0);
    const averageRating = totalScore / bookRatings.length;

    await updateData('books', bookId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingsCount: bookRatings.length
    });

    res.status(201).json({ message: 'Rating submitted successfully', ratingId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all ratings for a specific book
router.get('/book/:bookId', async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const bookRatings = await readDataByQuery(collectionName, { bookId });
    res.json(bookRatings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET the average rating for a specific book
router.get('/average/:bookId', async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const bookRatings = await readDataByQuery(collectionName, { bookId });

    if (bookRatings.length === 0) {
      return res.json({ bookId, averageRating: 0, totalRatings: 0 });
    }

    const totalScore = bookRatings.reduce((sum: number, rating: any) => sum + rating.score, 0);
    const averageRating = totalScore / bookRatings.length;

    res.json({ bookId, averageRating: parseFloat(averageRating.toFixed(2)), totalRatings: bookRatings.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
