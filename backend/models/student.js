const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  },
  sem: {
    type: Number,
    required: true,
  },
  dept: {
    type: String
  },
  coursesCompleted: {
    type: [String]
  }
});

module.exports = mongoose.model("student", userSchema);