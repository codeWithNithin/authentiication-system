const mongoose = require("mongoose");
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('connect to DB')
  } catch (err) {
    console.log(`failed to connect to DB`)
  }
}

module.exports = connectDB;