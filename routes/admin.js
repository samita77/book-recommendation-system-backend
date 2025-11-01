const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { getDb } = require('../db'); // Import getDb
const config = require('../config'); // Import config

// Import admin sub-routes
const adminAuthorsRoutes = require('./admin_authors');
const adminBooksRoutes = require('./admin_books');
const adminEditionsRoutes = require('./admin_editions');
const adminUsersRoutes = require('./admin_users');
const adminPublishersRoutes = require('./admin_publishers');

// Middleware to check if admin is authenticated
const requireAdminAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Admin login page
router.get('/login', (req, res) => {
  res.render('admin/login', { message: req.session.message });
  req.session.message = null; // Clear message after displaying
});

// Admin login POST handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const usersCollection = db.collection(config.mongo.collections.users);

  const user = await usersCollection.findOne({ username: username });

  if (user && user.is_admin && await bcrypt.compare(password, user.password)) {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    req.session.message = 'Invalid credentials';
    res.redirect('/admin/login');
  }
});

// Admin dashboard
router.get('/dashboard', requireAdminAuth, (req, res) => {
  res.render('admin/dashboard');
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/admin/login');
  });
});

// Mount admin sub-routes
router.use('/authors', requireAdminAuth, adminAuthorsRoutes);
router.use('/books', requireAdminAuth, adminBooksRoutes);
router.use('/editions', requireAdminAuth, adminEditionsRoutes);
router.use('/users', requireAdminAuth, adminUsersRoutes);
router.use('/publishers', requireAdminAuth, adminPublishersRoutes);

module.exports = router;
