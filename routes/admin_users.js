const express = require('express');
const router = express.Router();
const { readData, readDataById, insertData, updateData, deleteData } = require('../utils/dbOperations');
const userSchema = require('../models/userSchema');
const collectionName = 'users';
const resourceName = 'User';
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Middleware for validation (re-using the Joi schema from models)
const validateUser = (req, res, next) => {
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
    return res.status(400).render('admin/error', { message: error.details.map(d => d.message).join(', ') });
  }
  next();
};

// GET all users
router.get('/', async (req, res) => {
  const users = await readData(collectionName);
  res.render('admin/users/index', { users });
});

// GET form to add new user
router.get('/new', (req, res) => {
  res.render('admin/users/new', { user: {} });
});

// POST new user
router.post('/', validateUser, async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readData(collectionName);
    const maxIdUser = users.reduce((max, user) => (user.id > max ? user.id : max), -1);
    const newId = maxIdUser + 1;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: newId, username, password: hashedPassword };
    await insertData(collectionName, newUser);
    res.redirect('/admin/users');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// GET form to edit user
router.get('/edit/:id', async (req, res) => {
  const user = await readDataById(collectionName, req.params.id);
  if (!user) {
    return res.render('admin/error', { message: `${resourceName} not found` });
  }
  res.render('admin/users/edit', { user });
});

// POST update user
router.post('/edit/:id', validateUser, async (req, res) => {
  try {
    const { id, username, password } = req.body;
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = { id: parseInt(id), username, password: hashedPassword };
    const result = await updateData(collectionName, req.params.id, updatedUser);
    if (result.matchedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/users');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

// POST delete user
router.post('/delete/:id', async (req, res) => {
  try {
    // Prevent deletion of user with id: 0
    const userToDelete = await readDataById(collectionName, req.params.id);
    if (userToDelete && userToDelete.id === 0) {
      return res.render('admin/error', { message: 'Cannot delete the default admin user.' });
    }

    const result = await deleteData(collectionName, req.params.id);
    if (result.deletedCount === 0) {
      return res.render('admin/error', { message: `${resourceName} not found` });
    }
    res.redirect('/admin/users');
  } catch (error) {
    res.render('admin/error', { message: error.message });
  }
});

module.exports = router;
