import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env file');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// ✅ Define User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ✅ Define Event schema and model
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  venue: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  cost: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true,
    enum: ['conference', 'workshop', 'networking', 'seminar']
  },
  location: { type: String, required: true },
  imageUrl: { type: String, default: null },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  isAiGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema);

// ✅ Export everything needed
export { connectDB, User, Event };
