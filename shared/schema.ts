import { z } from "zod";
import { Types } from "mongoose";

// Custom Zod type for MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (val) => Types.ObjectId.isValid(val),
  (val) => ({ message: `${val} is not a valid ObjectId` })
);

// Base schemas without refinements
const baseEventSchema = z.object({
  _id: objectIdSchema,
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  venue: z.string()
    .min(3, "Venue must be at least 3 characters")
    .max(200, "Venue must be less than 200 characters"),
  startDate: z.string()
    .min(1, "Start date is required"),
  endDate: z.string()
    .min(1, "End date is required"),
  startTime: z.string()
    .min(1, "Start time is required"),
  endTime: z.string()
    .min(1, "End time is required"),
  cost: z.string()
    .min(1, "Cost information is required")
    .max(20, "Cost must be less than 20 characters"),
  eventType: z.enum(["conference", "workshop", "networking", "seminar"]),
  location: z.string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  imageUrl: z.string().nullable().optional(),
  adminId: objectIdSchema,
  isAiGenerated: z.boolean().default(false),
  createdAt: z.date().nullable(),
});

// User schemas
export const userSchema = z.object({
  _id: objectIdSchema,
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email format")
    .min(5, "Email must be at least 5 characters")
    .max(50, "Email must be less than 50 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  role: z.enum(["admin", "user"]),
  createdAt: z.date().nullable(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema with password confirmation
export const registrationSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Event schemas with date validation
export const eventSchema = baseEventSchema.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const insertEventSchema = baseEventSchema.omit({ _id: true, createdAt: true }).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const eventSearchSchema = z.object({
  search: z.string().optional(),
  eventType: z.enum(["conference", "workshop", "networking", "seminar"]).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegistrationRequest = z.infer<typeof registrationSchema>;
export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventWithAdmin = Event & { admin: User };
export type EventSearchParams = z.infer<typeof eventSearchSchema>;
