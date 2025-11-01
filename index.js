const express = require('express');
const app = express();
const config = require('./config');
const { connectToDb, getDb } = require('./db');
const errorMiddleware = require('./utils/errorMiddleware');
const session = require('express-session');
let db;

const port = config.port;

// Import routes
const bookRoutes = require('./routes/books');
const authorRoutes = require('./routes/author');
const editionRoutes = require('./routes/editions');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ratingRoutes = require('./routes/ratings');

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

connectToDb((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log(`Book Recommendation System listening on port ${port}`);
    });
    db = getDb();
  } else {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  }
});

app.use('/books', bookRoutes);
app.use('/author', authorRoutes);
app.use('/editions', editionRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Book Recommendation System!');
});

app.use(errorMiddleware);
