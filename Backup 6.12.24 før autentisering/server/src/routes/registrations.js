import express from 'express';
import Registration from '../models/registration.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Opprett ny registrering
router.post('/', auth, async (req, res) => {
  try {
    const registration = new Registration({
      ...req.body,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      }
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hent alle registreringer for innlogget bruker
router.get('/', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Synkroniser registreringer
router.post('/sync', auth, async (req, res) => {
  try {
    const { registrations, lastSync } = req.body;
    
    // Håndter nye og oppdaterte registreringer fra klienten
    for (const reg of registrations) {
      if (reg._id) {
        // Oppdater eksisterende registrering
        await Registration.findByIdAndUpdate(reg._id, {
          ...reg,
          syncStatus: 'synced',
          lastModified: new Date()
        });
      } else {
        // Opprett ny registrering
        const newReg = new Registration({
          ...reg,
          userId: req.user._id,
          syncStatus: 'synced'
        });
        await newReg.save();
      }
    }

    // Hent alle endringer siden siste synkronisering
    const serverChanges = await Registration.find({
      userId: req.user._id,
      updatedAt: { $gt: new Date(lastSync) }
    });

    res.json({
      success: true,
      serverChanges,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Slett registrering
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json({ message: 'Registration deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;