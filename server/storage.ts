import { type User, type InsertUser, type Event, type InsertEvent, type EventSearchParams } from "@shared/schema";
import mongoose from "mongoose";
import { Event as EventModel } from "./models/event";
import { User as UserModel } from "./models/user";

export interface EventWithAdmin extends Event {
  admin: User;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent & { adminId: string }): Promise<Event>;
  getEventsByAdmin(adminId: string): Promise<Event[]>;
  getAllEvents(): Promise<EventWithAdmin[]>;
  searchEvents(params: EventSearchParams): Promise<EventWithAdmin[]>;
  getEvent(id: string): Promise<EventWithAdmin | undefined>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string, adminId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private convertUserToSchema(user: any): User {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt || null
    };
  }

  private convertEventToSchema(event: any): Event {
    return {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      cost: event.cost,
      eventType: event.eventType,
      location: event.location,
      image: event.image,
      imageUrl: event.imageUrl || null,
      adminId: event.adminId.toString(),
      isAiGenerated: event.isAiGenerated || false,
      createdAt: event.createdAt || null
    };
  }

  private convertEventWithAdminToSchema(event: any): EventWithAdmin {
    const admin = event.adminId;
    return {
      ...this.convertEventToSchema(event),
      admin: this.convertUserToSchema(admin)
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;
    return this.convertUserToSchema(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    return this.convertUserToSchema(user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return this.convertUserToSchema(user);
  }

  async createEvent(eventData: InsertEvent & { adminId: string }): Promise<Event> {
    const event = await EventModel.create({
      ...eventData,
      adminId: new mongoose.Types.ObjectId(eventData.adminId)
    });
    return this.convertEventToSchema(event);
  }

  async getEventsByAdmin(adminId: string): Promise<Event[]> {
    const events = await EventModel.find({ adminId: new mongoose.Types.ObjectId(adminId) })
      .sort({ createdAt: -1 });
    return events.map(event => this.convertEventToSchema(event));
  }

  async getAllEvents(): Promise<EventWithAdmin[]> {
    const events = await EventModel.find()
      .sort({ createdAt: -1 })
      .populate('adminId');
    
    return events.map(event => this.convertEventWithAdminToSchema(event));
  }

  async searchEvents(params: EventSearchParams): Promise<EventWithAdmin[]> {
    const query: any = {};

    if (params.search) {
      query.$text = { $search: params.search };
    }

    if (params.eventType) {
      query.eventType = params.eventType;
    }

    if (params.location) {
      query.location = { $regex: params.location, $options: 'i' };
    }

    if (params.date) {
      const searchDate = new Date(params.date);
      query.startDate = {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const events = await EventModel.find(query)
      .sort({ createdAt: -1 })
      .populate('adminId');

    return events.map(event => this.convertEventWithAdminToSchema(event));
  }

  async getEvent(id: string): Promise<EventWithAdmin | undefined> {
    const event = await EventModel.findById(id).populate('adminId');
    if (!event) return undefined;
    return this.convertEventWithAdminToSchema(event);
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await EventModel.findByIdAndUpdate(
      id,
      { $set: eventData },
      { new: true }
    );
    if (!event) return undefined;
    return this.convertEventToSchema(event);
  }

  async deleteEvent(id: string, adminId: string): Promise<boolean> {
    const result = await EventModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      adminId: new mongoose.Types.ObjectId(adminId)
    });
    return result.deletedCount > 0;
  }
}

// Export a single instance of DatabaseStorage
export const storage = new DatabaseStorage();
