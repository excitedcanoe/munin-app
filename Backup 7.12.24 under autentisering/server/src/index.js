import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/users.js';
import registrationRoutes from './routes/registrations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Test connection by running a simple query
    mongoose.connection.db.admin().ping()
      .then(() => console.log('Successfully pinged MongoDB. Connection is alive'))
      .catch(err => console.error('MongoDB ping failed:', err));
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Økt limit for store payloads

// Routes
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  });
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Something broke!',
    path: req.url,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});