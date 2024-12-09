import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Registrer ny bruker
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, country } = req.body;
    
    // Sjekk om bruker allerede eksisterer
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      country: country || 'NO'
    });

    await user.save();

    // Generer JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);  // Se hva som kommer inn
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('Found user:', user ? 'Yes' : 'No');  // Se om bruker finnes

    if (!user || !(await user.checkPassword(password))) {
      console.log('Invalid credentials');
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);  // Log vellykket login
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);  // Mer detaljert feillogging
    res.status(400).json({ error: 'Login failed' });
  }
});

// Hent brukerprofil
router.get('/profile', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    country: req.user.country
  });
});

// Oppdater brukerprofil
router.patch('/profile', auth, async (req, res) => {
  const updates = {};
  ['firstName', 'lastName', 'country'].forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country
    });
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

export default router;