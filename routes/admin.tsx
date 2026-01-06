import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import config from '../config';

// Import admin sub-routes
import adminAuthorsRoutes from './admin_authors';
import adminBooksRoutes from './admin_books';
// import adminEditionsRoutes from './admin_editions';
import adminUsersRoutes from './admin_users';

const router = express.Router();

// Middleware to check if admin is authenticated
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Admin login page
router.get('/login', (req: Request, res: Response) => {
  res.render('admin/login', { message: (req.session as any).message });
  (req.session as any).message = null; // Clear message after displaying
});

// Admin login POST handler
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = getDb();
  const usersCollection = db.collection(config.mongo.collections.users);

  const user = await usersCollection.findOne({ username: username });

  if (user && user.is_admin && await bcrypt.compare(password, user.password)) {
    (req.session as any).isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    (req.session as any).message = 'Invalid credentials';
    res.redirect('/admin/login');
  }
});

// Admin dashboard
router.get('/dashboard', requireAdminAuth, (req: Request, res: Response) => {
  res.render('admin/dashboard');
});

// Admin logout
router.get('/logout', (req: Request, res: Response) => {
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
// router.use('/editions', requireAdminAuth, adminEditionsRoutes);
router.use('/users', requireAdminAuth, adminUsersRoutes);

export default router;
