import express, { Request, Response, NextFunction } from 'express';
import { readData, readDataById, insertData, updateData, deleteData } from '../utils/dbOperations';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { renderError } from '../utils/adminHelper';

const router = express.Router();
const collectionName = 'users';
const resourceName = 'User';

// Middleware for validation
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const newUserSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const updateUserSchema = Joi.object({
    id: Joi.number().required().min(0),
    username: Joi.string().required(),
    password: Joi.string().allow('').optional(),
  });

  let schemaToValidate;
  if (req.method === 'POST' && req.path === '/') {
    schemaToValidate = newUserSchema;
  } else {
    schemaToValidate = updateUserSchema;
  }

  const { error } = schemaToValidate.validate(req.body);
  if (error) {
    return renderError(res, error.details.map((d: any) => d.message).join(', '));
  }
  next();
};

// GET all users
router.get('/', async (req: Request, res: Response) => {
  const users = await readData(collectionName);
  res.render('admin/users/index', { users });
});

// GET form to add new user
router.get('/new', (req: Request, res: Response) => {
  res.render('admin/users/new', { user: {} });
});

// POST new user
router.post('/', validateUser, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users: any[] = await readData(collectionName);
    const maxIdUser = users.reduce((max: number, user: any) => (user.id > max ? user.id : max), -1);
    const newId = maxIdUser + 1;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: newId, username, password: hashedPassword };
    await insertData(collectionName, newUser);
    res.redirect('/admin/users');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

// GET form to edit user
router.get('/edit/:id', async (req: Request, res: Response) => {
  const user = await readDataById(collectionName, req.params.id);
  if (!user) {
    return renderError(res, `${resourceName} not found`);
  }
  res.render('admin/users/edit', { user });
});

// POST update user
router.post('/edit/:id', validateUser, async (req: Request, res: Response) => {
  try {
    const { id, username, password } = req.body;
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = { id: parseInt(id), username, password: hashedPassword };
    const result = await updateData(collectionName, req.params.id, updatedUser);
    if (result.matchedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/users');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

// POST delete user
router.post('/delete/:id', async (req: Request, res: Response) => {
  try {
    // Prevent deletion of user with id: 0
    const userToDelete = await readDataById(collectionName, req.params.id);
    if (userToDelete && userToDelete.id === 0) {
      return renderError(res, 'Cannot delete the default admin user.');
    }

    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return renderError(res, `${resourceName} not found`);
    }
    res.redirect('/admin/users');
  } catch (error: any) {
    renderError(res, error.message);
  }
});

export default router;

