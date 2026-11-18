const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/worksphere';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn(`
[DATABASE WARNING]: Could not connect to MongoDB at "${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/worksphere'}".
To connect with MongoDB Atlas:
1. Create a free cluster on https://cloud.mongodb.com
2. Copy your connection string into backend/.env:
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/worksphere?retryWrites=true&w=majority
3. Restart server.
    `);
    // Do not terminate process in development so APIs can return structured DB error responses
  }
};

module.exports = connectDB;

