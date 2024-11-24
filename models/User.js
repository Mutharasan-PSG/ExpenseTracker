const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        //unique: true,
        minlength: [3, 'Username must be at least 3 characters long.'],
        trim: true,  // To remove any extra spaces in the username
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Automatically convert email to lowercase
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },

    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long.'],
    },
});

// Creating indexes for uniqueness (if not already done by default in the model definition)
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
