const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const Income = require('./models/Income'); // Assuming you have this model file created
const multer = require('multer'); // To handle file uploads

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://Mutharasan:6RFmJG8HN_dJ_PP@expensetracker.699v4.mongodb.net/', {})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err); // Log the error in case the connection fails
    process.exit(1); // Exit the process if connection fails to avoid further operations
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images from 'public/uploads'
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Authentication routes
app.use('/auth', authRoutes);

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    const filePath = (path.join(__dirname, 'public', 'views', 'dashboard.html')); // Correct path to dashboard.html
    console.log(`Serving file: ${filePath}`);
    res.sendFile(filePath);
  } else {
    res.redirect('/'); // If not logged in, redirect to index page
  }
});

// API to fetch the username for the dashboard
app.get('/api/getUsername', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.json({ username: 'Guest' });
  }
});

app.get('/views/login.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'login.html');
  console.log(`Serving file: ${filePath}`);
  res.sendFile(filePath);
});

app.get('/views/signup.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'signup.html');
  console.log(`Serving file: ${filePath}`);
  res.sendFile(filePath);
});

// Multer Configuration for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads')); // Save in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Preserve the file extension
    cb(null, `${Date.now()}${ext}`); // Use timestamp to ensure unique filenames
  },
});
const upload = multer({ storage });
// API to add income
app.post('/api/addIncome', upload.single('image'), (req, res) => {
 
  console.log('File upload attempt:', req.file); // Log uploaded file details

  if (!req.file) {
    return res.status(400).json({ message: 'File upload failed!' });
  }
 
  const { amount, category, description, date } = req.body;
  const userId = req.session.user._id; // Assuming the user object is stored in the session

  const income = new Income({
    amount,
    category,
    description,
    date,
    image: req.file ? `/uploads/${req.file.filename}` : null, // Use relative URL for image path
    userId,
  });

  income.save()
    .then((newIncome) => {
      res.status(201).json({ message: 'Income added successfully!', income: newIncome });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error adding income', error });
    });
});

// API to fetch the transactions for the dashboard
app.get('/api/getTransactions', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  Income.find({ userId: req.session.user._id })
    .then((transactions) => {
      res.json(transactions);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Error fetching transactions', err });
    });
});

// Logout route (destroy session)
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error during logout.' });
    }
    res.redirect('/'); // Redirect to login after logout
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
