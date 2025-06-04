import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertEventSchema, eventSearchSchema, type Event } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { generateEventDescription } from "./openai";
import mongoose from "mongoose";
import fs from "fs";

// Type declarations
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: string;
      };
    }
  }
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'uploads/');
  },
  filename: function (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req: Request, file: MulterFile, cb: (error: Error | null, acceptFile: boolean) => void) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed'), false);
    }
  }
});

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: Function) {
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
function requireAdmin(req: Request, res: Response, next: Function) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

interface EventWithBuffer extends Event {
  image?: {
    data: Buffer;
    contentType: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
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
      // Parse the event data
      const eventData = {
        ...req.body,
        adminId: req.user._id,
      };

      // Add image data if present
      if (req.file) {
        eventData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }

      // Validate the event data
      const validatedData = insertEventSchema.parse({
        ...eventData,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: new Date(eventData.endDate).toISOString()
      });

      const event = await storage.createEvent(validatedData);

      res.json({
        message: "Event created successfully",
        event: {
          ...event,
          imageUrl: event.image?.data 
            ? `data:${event.image.contentType};base64,${event.image.data.toString('base64')}`
            : null
        }
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: JSON.stringify(error.errors, null, 2) });
      }
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

      // Convert binary image data to base64 URLs
      const eventsWithImageUrls = events.map((event) => ({
        ...event,
        imageUrl: event.image?.data 
          ? `data:${event.image.contentType};base64,${event.image.data.toString('base64')}`
          : null
      }));

      res.json({ events: eventsWithImageUrls });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get admin's events
  app.get("/api/events/my", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const events = await storage.getEventsByAdmin(req.user._id);
      
      // Convert binary image data to base64 URLs
      const eventsWithImageUrls = events.map((event) => ({
        ...event,
        imageUrl: event.image?.data 
          ? `data:${event.image.contentType};base64,${event.image.data.toString('base64')}`
          : null
      }));

      res.json({ events: eventsWithImageUrls });
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

      // Convert binary image data to base64 URL if present
      const eventWithImageUrl = {
        ...event,
        imageUrl: event.image?.data 
          ? `data:${event.image.contentType};base64,${event.image.data.toString('base64')}`
          : null
      };

      res.json({ event: eventWithImageUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update event
  app.put("/api/events/:id", authenticateToken, requireAdmin, upload.single('image'), async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.adminId !== req.user._id) {
        return res.status(403).json({ message: "You can only update your own events" });
      }

      const updateData = { ...req.body };

      // Add image data if present
      if (req.file) {
        updateData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }

      const updatedEvent = await storage.updateEvent(req.params.id, updateData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Failed to update event" });
      }

      res.json({
        message: "Event updated successfully",
        event: {
          ...updatedEvent,
          imageUrl: updatedEvent.image?.data 
            ? `data:${updatedEvent.image.contentType};base64,${updatedEvent.image.data.toString('base64')}`
            : null
        }
      });
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
      
      // Input validation with detailed feedback
      if (!title?.trim()) {
        return res.status(400).json({ 
          success: false,
          message: "Please provide an event title",
          error: "VALIDATION_ERROR" 
        });
      }

      if (!venue?.trim()) {
        return res.status(400).json({ 
          success: false,
          message: "Please provide an event venue",
          error: "VALIDATION_ERROR" 
        });
      }

      // Generate description with retry mechanism
      let retries = 2;
      let description: string | null = null;
      let error: any = null;

      while (retries >= 0 && !description) {
        try {
          description = await generateEventDescription(
            title.trim(), 
            venue.trim(), 
            eventType?.trim(), 
            location?.trim()
          );
          break;
        } catch (e: any) {
          error = e;
          if (e.message?.includes('rate limit') || e.message?.includes('busy')) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            retries--;
            continue;
          }
          throw e;
        }
      }

      if (!description) {
        throw error || new Error('Failed to generate description after retries');
      }

      // Success response
      res.json({
        success: true,
        description,
        isAiGenerated: true,
        message: "Description generated successfully"
      });

    } catch (error: any) {
      // Enhanced error logging
      console.error("AI Description Generation Error:", {
        error,
        body: req.body,
        userId: req.user._id,
        timestamp: new Date().toISOString()
      });
      
      // Determine appropriate status code and error type
      let statusCode = 500;
      let errorType = "AI_GENERATION_ERROR";
      let message = error.message || "Failed to generate description";

      if (message.includes("API") || message.includes("configuration")) {
        statusCode = 503;
        errorType = "SERVICE_ERROR";
      } else if (message.includes("rate limit") || message.includes("busy")) {
        statusCode = 429;
        errorType = "RATE_LIMIT_ERROR";
      } else if (message.includes("too short") || message.includes("empty")) {
        statusCode = 422;
        errorType = "CONTENT_ERROR";
      }

      // Error response with retry guidance
      res.status(statusCode).json({
        success: false,
        message,
        error: errorType,
        retryAfter: statusCode === 429 ? 5 : undefined,
        suggestion: statusCode === 422 ? "Try providing more specific event details" : undefined
      });
    }
  });

  const server = createServer(app);
  return server;
}


