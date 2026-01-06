import express, { Request, Response } from 'express';
import session from 'express-session';
import config from './config';
import { connectToDb, getDb } from './db';
import errorMiddleware from './utils/errorMiddleware';

// Import routes
import bookRoutes from './routes/books';
import authorRoutes from './routes/author';
// import editionRoutes from './routes/editions';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import ratingRoutes from './routes/ratings';

import cors from 'cors';

const app = express();
const port = config.port;

app.use(cors()); // Enable CORS for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configure express-session
app.use(session({
  secret: 'supersecretadminsessionkey', // Replace with a strong, random secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

connectToDb((err?: any) => {
  if (!err) {
    app.listen(port, () => {
      console.log(`Book Recommendation System listening on port ${port}`);
    });
    // db = getDb(); // Removed unused db variable
  } else {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  }
});

app.use('/books', bookRoutes);
app.use('/author', authorRoutes);
// app.use('/editions', editionRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/ratings', ratingRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Book Recommendation System!');
});

app.use(errorMiddleware);
