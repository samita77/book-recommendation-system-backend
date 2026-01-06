import express, { Request, Response, NextFunction } from 'express';
import { readData, readDataById, insertData, updateData, deleteData } from '../utils/dbOperations';
import bookSchema from '../models/bookSchema';
import config from '../config';
import { renderError, parseCommaSeparatedFields } from '../utils/adminHelper';
import { generateSlug } from '../utils/stringUtils';

const router = express.Router();
const collectionName = 'books';
const resourceName = 'Book';

// Middleware for validation
const validateBook = (req: Request, res: Response, next: NextFunction) => {
  // Convert comma-separated strings to arrays
  parseCommaSeparatedFields(req, ['genre', 'literaryAwards', 'setting', 'characters']);

  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    return renderError(res, error.details.map((d: any) => d.message).join(', '));
  }
  // Use the validated and type-converted value
  req.body = value;
  next();
};

// GET all books
router.get('/', async (req: Request, res: Response) => {
  const books = await readData(collectionName);
  // Sort books by ID ascending
  books.sort((a: any, b: any) => a.id - b.id);
  res.render('admin/books/index', { books });
});

// GET form to add new book
router.get('/new', async (req: Request, res: Response) => {
  const authors = await readData(config.mongo.collections.authors);
  res.render('admin/books/new', { book: {}, authors });
});

// POST new book
router.post('/', validateBook, async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    console.log('Incoming Book Data:', data);

    // Force IDs to numbers if they exist
    if (data.authorid) data.authorid = parseInt(data.authorid.toString());

    // Handle editions from JSON string
    if (data.editionsJSON) {
      try {
        data.editions = JSON.parse(data.editionsJSON);
        delete data.editionsJSON;
      } catch (e) {
        console.error("Failed to parse editionsJSON", e);
        data.editions = [];
      }
    }

    // Find the author name based on authorid
    if (data.authorid) {
      const author = await readDataById(config.mongo.collections.authors, data.authorid);
      if (author) data.author = author.name;
    }

    data.slug = generateSlug(data.title);
    await insertData(collectionName, data);
    res.redirect('/admin/books');
  } catch (error: any) {
    console.error('Error creating book:', error);
    renderError(res, error.message);
  }
});

// GET form to edit book
router.get('/edit/:id', async (req: Request, res: Response) => {
  const book = await readDataById(collectionName, req.params.id);
  if (!book) {
    return renderError(res, `${resourceName} not found`);
  }
  const authors = await readData(config.mongo.collections.authors);
  res.render('admin/books/edit', { book, authors });
});

// POST update book
router.post('/edit/:id', validateBook, async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    console.log('Updating Book ID:', req.params.id);

    // Force IDs to numbers if they exist
    if (data.authorid) data.authorid = parseInt(data.authorid.toString());

    // Handle editions from JSON string
    if (data.editionsJSON) {
      try {
        data.editions = JSON.parse(data.editionsJSON);
        delete data.editionsJSON;
      } catch (e) {
        console.error("Failed to parse editionsJSON", e);
        data.editions = [];
      }
    }

    // Find and update author ONLY if match is found
    if (data.authorid) {
      const author = await readDataById(config.mongo.collections.authors, data.authorid);
      if (author) data.author = author.name;
    }

    // Optionally update slug if title changes
    data.slug = generateSlug(data.title);

    const result = await updateData(collectionName, req.params.id, data);
    if (result.matchedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/books');
  } catch (error: any) {
    console.error('Error updating book:', error);
    renderError(res, error.message);
  }
});

// POST delete book
router.post('/delete/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/books');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

export default router;

