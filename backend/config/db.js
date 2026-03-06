const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGODB_URI from environment variables.
 * Handles connection events and provides meaningful logging.
 */
const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
