const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const Income = require('./models/Income'); // Assuming you have this model file created
const multer = require('multer'); // To handle file uploads
const router = express.Router();

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

app.use('/assets', express.static(path.join(__dirname, 'public/views/assets')));


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


// Route to get transaction details
app.get('/api/getIncome/:id', async (req, res) => {
  try {
    const transaction = await Income.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ income: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching income' });
  }
});



// Route to update transaction
app.post('/api/updateIncome', upload.single('image'), async (req, res) => {
  const { amount, category, description, date, id } = req.body;

  try {
    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    income.amount = amount;
    income.category = category;
    income.description = description;
    income.date = new Date(date);

    if (req.file) {
      income.image = `/uploads/${req.file.filename}`; // Update image path
    }

    await income.save();
    res.json({ message: 'Income updated successfully!', income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update income' });
  }
});

// Route to delete transaction
app.delete('/api/deleteIncome/:id', async (req, res) => {
    try {
        const incomeId = req.params.id;
        await Income.findByIdAndDelete(incomeId);
        res.json({ success: true, message: 'Income deleted successfully!' });
    } catch (err) {
        console.error('Error deleting income:', err);
        res.status(500).json({ success: false, message: 'Failed to delete the income.' });
    }
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


// Import the Expense model
const Expense = require('./models/Expense');

// API to add an expense
app.post('/api/addExpense', upload.single('image'), (req, res) => {
  console.log('File upload attempt:', req.file); // Log uploaded file details

  if (!req.file) {
    return res.status(400).json({ message: 'File upload failed!' });
  }

  const { amount, category, description, date } = req.body;
  const userId = req.session.user._id; // Assuming the user object is stored in the session

  const expense = new Expense({
    amount,
    category,
    description,
    date,
    image: req.file ? `/uploads/${req.file.filename}` : null, // Use relative URL for image path
    userId,
  });

  expense.save()
    .then((newExpense) => {
      res.status(201).json({ message: 'Expense added successfully!', expense: newExpense });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error adding expense', error });
    });
});

// API to fetch expenses for the dashboard
app.get('/api/getExpense', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  Expense.find({ userId: req.session.user._id })
    .then((expenses) => {
      res.json(expenses);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Error fetching expenses', err });
    });
});

// Route to get expense details
app.get('/api/getExpense/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching expense' });
  }
});

// Route to update expense
app.post('/api/updateExpense', upload.single('image'), async (req, res) => {
  const { amount, category, description, date, id } = req.body;

  try {
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.amount = amount;
    expense.category = category;
    expense.description = description;
    expense.date = new Date(date);

    if (req.file) {
      expense.image = `/uploads/${req.file.filename}`; // Update image path
    }

    await expense.save();
    res.json({ message: 'Expense updated successfully!', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Route to delete expense
app.delete('/api/deleteExpense/:id', async (req, res) => {
  try {
      const expenseId = req.params.id;
      await Expense.findByIdAndDelete(expenseId);
      res.json({ success: true, message: 'Expense deleted successfully!' });
  } catch (err) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ success: false, message: 'Failed to delete the expense.' });
  }
});


// API Route for Data Visualization
app.get('/api/visualizeData', async (req, res) => {
  const userId = req.session.userId; // Retrieve user ID from the session
  const { dataType, startDate, endDate } = req.query;

  // Ensure session is valid and user is logged in
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  // Ensure required query parameters are present
  if (!dataType || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required query parameters: dataType, startDate, or endDate' });
  }

  try {
    // Parse date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set the end of the day for the date range

    // Initialize variables for income and expense data
    let incomeData = [];
    let expenseData = [];
    let combinedCategories = [];
    let combinedData = [];

    // Fetch income data for the logged-in user and within the date range
    if (dataType === 'income' || dataType === 'both') {
      incomeData = await Income.find({
        userId: userId, // Ensure that we only fetch income for the current user
        date: { $gte: start, $lte: end }
      }).sort({ date: 1 }) || []; // Default to an empty array if no data found
    }

    // Fetch expense data for the logged-in user and within the date range
    if (dataType === 'expense' || dataType === 'both') {
      expenseData = await Expense.find({
        userId: userId, // Ensure that we only fetch expenses for the current user
        date: { $gte: start, $lte: end }
      }).sort({ date: 1 }) || []; // Default to an empty array if no data found
    }

    // Combine categories from both income and expense
    combinedCategories = [
      ...new Set([
        ...incomeData.map(i => i.category),
        ...expenseData.map(e => e.category)
      ])
    ];

    // Calculate total data for each category
    combinedData = combinedCategories.map(category => {
      const incomeSum = incomeData
        .filter(i => i.category === category)
        .reduce((sum, item) => sum + item.amount, 0);

      const expenseSum = expenseData
        .filter(e => e.category === category)
        .reduce((sum, item) => sum + item.amount, 0);

      return incomeSum + expenseSum; // Total amount for the category
    });

    // Respond with the processed data for visualization
    res.json({
      categories: combinedCategories,
      data: combinedData
    });
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    res.status(500).send('Server Error');
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
