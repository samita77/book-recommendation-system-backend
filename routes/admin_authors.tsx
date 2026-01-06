import express, { Request, Response, NextFunction } from 'express';
import { readData, readDataById, insertData, updateData, deleteData } from '../utils/dbOperations';
import authorSchema from '../models/authorSchema';
import { generateSlug } from '../utils/stringUtils';
import { renderError, parseCommaSeparatedFields } from '../utils/adminHelper';

const router = express.Router();
const collectionName = 'authors';
const resourceName = 'Author';

// Middleware for validation
const validateAuthor = (req: Request, res: Response, next: NextFunction) => {
  // Convert comma-separated strings to arrays
  parseCommaSeparatedFields(req, ['genre', 'books']);

  const { error } = authorSchema.validate(req.body);
  if (error) {
    return renderError(res, error.details.map((d: any) => d.message).join(', '));
  }
  next();
};

// GET all authors
router.get('/', async (req: Request, res: Response) => {
  const authors = await readData(collectionName);
  // Sort authors by ID ascending
  authors.sort((a: any, b: any) => a.id - b.id);
  res.render('admin/authors/index', { authors });
});

// GET form to add new author
router.get('/new', (req: Request, res: Response) => {
  res.render('admin/authors/new', { author: {} });
});

// POST new author
router.post('/', validateAuthor, async (req: Request, res: Response) => {
  try {
    const newAuthor = {
      ...req.body,
      slug: generateSlug(req.body.name)
    };
    await insertData(collectionName, newAuthor);
    res.redirect('/admin/authors');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

// GET form to edit author
router.get('/edit/:id', async (req: Request, res: Response) => {
  const author = await readDataById(collectionName, req.params.id);
  if (!author) {
    return renderError(res, `${resourceName} not found`);
  }
  res.render('admin/authors/edit', { author });
});

// POST update author
router.post('/edit/:id', validateAuthor, async (req: Request, res: Response) => {
  try {
    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.name)
    };
    const result = await updateData(collectionName, req.params.id, updatedData);
    if (result.matchedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/authors');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

// POST delete author
router.post('/delete/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/authors');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

export default router;
