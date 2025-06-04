import { z } from "zod";
import { Types } from "mongoose";

// Custom Zod type for MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (val) => Types.ObjectId.isValid(val),
  (val) => ({ message: `${val} is not a valid ObjectId` })
);

// User schemas
export const userSchema = z.object({
  _id: objectIdSchema,
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "user"]),
  createdAt: z.date().nullable(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Event schemas
export const eventSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  description: z.string(),
  venue: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  cost: z.string(),
  eventType: z.string(),
  location: z.string(),
  imageUrl: z.string().nullable().optional(),
  adminId: objectIdSchema,
  isAiGenerated: z.boolean().default(false),
  createdAt: z.date().nullable(),
});

export const insertEventSchema = eventSchema.omit({ _id: true, createdAt: true });

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export const eventSearchSchema = z.object({
  search: z.string().optional(),
  eventType: z.string().optional(),
  location: z.string().optional(),
  date: z.date().optional(),
});

export type EventWithAdmin = Event & { admin: User };
export type EventSearchParams = z.infer<typeof eventSearchSchema>;
