const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must meet complexity requirements.',
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    // Try to save the user
    await newUser.save();
    res.status(200).json({ success: true, message: 'Signup successful' });
  } catch (err) {
    console.error('Error occurred during signup:', err); // Log error to the console for debugging
    res.status(500).json({ success: false, message: 'Error occurred during signup.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = user;
        // Redirect the user to the dashboard after successful login
        return res.status(200).json({ success: true, message: 'Login successful', redirect: '/dashboard' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid password.' });
      }
    } catch (err) {
      console.error('Error during login:', err); // Log error to console for debugging
      res.status(500).json({ success: false, message: 'Error during login.', error: err.message });
    }
  });
  

module.exports = router;
