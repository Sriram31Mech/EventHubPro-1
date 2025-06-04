import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  cost: {
    type: String,
    required: true,
    maxlength: 20,
  },
  eventType: {
    type: String,
    required: true,
    enum: ["conference", "workshop", "networking", "seminar"],
  },
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  imageUrl: {
    type: String,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAiGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Add index for search functionality
eventSchema.index({
  title: "text",
  description: "text",
  location: "text",
  venue: "text",
});

// Check if model exists before creating
export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema); 