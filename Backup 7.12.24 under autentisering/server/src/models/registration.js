import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  species: {
    scientificName: String,
    commonNameNorwegian: String,
    genusName: String,
    speciesName: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  accuracy: Number,
  images: [{
    url: String,
    timestamp: Date
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'error'],
    default: 'pending'
  },
  deviceId: String
}, {
  timestamps: true
});

// Indeks for geografisk søk
registrationSchema.index({ location: '2dsphere' });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;