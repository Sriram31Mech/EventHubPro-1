import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertEventSchema, eventSearchSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { generateEventDescription } from "./openai";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed'));
    }
  }
});

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        message: "User registered successfully",
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(loginData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Event routes
  app.post("/api/events", authenticateToken, requireAdmin, upload.single('image'), async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      });

      const event = await storage.createEvent({
        ...eventData,
        adminId: req.user._id,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      });

      res.json({
        message: "Event created successfully",
        event
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all events (public)
  app.get("/api/events", async (req, res) => {
    try {
      const searchParams = eventSearchSchema.parse(req.query);
      const events = searchParams.search || searchParams.eventType || searchParams.location || searchParams.date
        ? await storage.searchEvents(searchParams)
        : await storage.getAllEvents();

      res.json({ events });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get admin's events
  app.get("/api/events/my", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const events = await storage.getEventsByAdmin(req.user._id);
      res.json({ events });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ event });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update event
  app.put("/api/events/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.adminId !== req.user._id) {
        return res.status(403).json({ message: "You can only update your own events" });
      }

      const updatedEvent = await storage.updateEvent(req.params.id, req.body);
      res.json({ event: updatedEvent });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete event
  app.delete("/api/events/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id, req.user._id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found or you don't have permission to delete it" });
      }

      res.json({ message: "Event deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI description generation
  app.post("/api/ai/generate-description", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { title, venue, eventType, location } = req.body;
      
      if (!title || !venue) {
        return res.status(400).json({ message: "Title and venue are required" });
      }

      const description = await generateEventDescription(title, venue, eventType, location);
      
      res.json({
        description,
        isAiGenerated: true
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const server = createServer(app);
  return server;
}


