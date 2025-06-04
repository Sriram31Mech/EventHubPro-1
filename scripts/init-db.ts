import { User, Event } from '../server/db';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Created admin user');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });
    console.log('Created regular user');

    // Create sample events
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations',
        venue: 'Convention Center',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-17'),
        startTime: '09:00',
        endTime: '18:00',
        cost: '₹1500',
        eventType: 'conference',
        location: 'Mumbai',
        adminId: admin._id,
        isAiGenerated: false
      },
      {
        title: 'Web Development Workshop',
        description: 'Hands-on workshop on modern web development',
        venue: 'Tech Hub',
        startDate: new Date('2024-07-20'),
        endDate: new Date('2024-07-20'),
        startTime: '10:00',
        endTime: '16:00',
        cost: '₹800',
        eventType: 'workshop',
        location: 'Bangalore',
        adminId: admin._id,
        isAiGenerated: false
      }
    ];

    await Event.insertMany(events);
    console.log('Created sample events');

    console.log('\nDatabase initialized successfully!');
    console.log('\nYou can now log in with:');
    console.log('Admin - email: admin@example.com, password: admin123');
    console.log('User - email: user@example.com, password: user123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase(); 