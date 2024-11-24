const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://Mutharasan:6RFmJG8HN_dJ_PP@expensetracker.699v4.mongodb.net/', {
  
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);  // Log the error in case the connection fails
    process.exit(1);  // Exit the process if connection fails to avoid further operations
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

// Routes
// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'views', 'index.html'));
  });  

  // Authentication routes
app.use('/auth', authRoutes);

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const filePath =(path.join(__dirname,'public', 'views', 'dashboard.html')); // Correct path to dashboard.html
        console.log(`Serving file: ${filePath}`);
        res.sendFile(filePath);
    } else {
        res.redirect('/'); // If not logged in, redirect to index page
    }
});

app.get('/views/login.html', (req, res) => {
    const filePath = path.join(__dirname,'public', 'views', 'login.html');
    console.log(`Serving file: ${filePath}`);
    res.sendFile(filePath);
});

  app.get('/views/signup.html', (req, res) => {
    const filePath = path.join(__dirname, 'public','views', 'signup.html');
    console.log(`Serving file: ${filePath}`);
    res.sendFile(filePath);
  
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
