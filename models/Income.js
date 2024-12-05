// models/Income.js
const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default:''
  },
  date: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
