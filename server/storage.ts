import { users, events, type User, type InsertUser, type Event, type InsertEvent, type EventWithAdmin, type EventSearchParams } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent & { adminId: number }): Promise<Event>;
  getEventsByAdmin(adminId: number): Promise<Event[]>;
  getAllEvents(): Promise<EventWithAdmin[]>;
  searchEvents(params: EventSearchParams): Promise<EventWithAdmin[]>;
  getEvent(id: number): Promise<EventWithAdmin | undefined>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number, adminId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEvent(eventData: InsertEvent & { adminId: number }): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async getEventsByAdmin(adminId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.adminId, adminId))
      .orderBy(desc(events.createdAt));
  }

  async getAllEvents(): Promise<EventWithAdmin[]> {
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        venue: events.venue,
        startDate: events.startDate,
        endDate: events.endDate,
        startTime: events.startTime,
        endTime: events.endTime,
        cost: events.cost,
        eventType: events.eventType,
        location: events.location,
        imageUrl: events.imageUrl,
        adminId: events.adminId,
        isAiGenerated: events.isAiGenerated,
        createdAt: events.createdAt,
        admin: {
          id: users.id,
          name: users.name,
          email: users.email,
          password: users.password,
          role: users.role,
          createdAt: users.createdAt,
        }
      })
      .from(events)
      .leftJoin(users, eq(events.adminId, users.id))
      .orderBy(desc(events.createdAt));
  }

  async searchEvents(params: EventSearchParams): Promise<EventWithAdmin[]> {
    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        venue: events.venue,
        startDate: events.startDate,
        endDate: events.endDate,
        startTime: events.startTime,
        endTime: events.endTime,
        cost: events.cost,
        eventType: events.eventType,
        location: events.location,
        imageUrl: events.imageUrl,
        adminId: events.adminId,
        isAiGenerated: events.isAiGenerated,
        createdAt: events.createdAt,
        admin: {
          id: users.id,
          name: users.name,
          email: users.email,
          password: users.password,
          role: users.role,
          createdAt: users.createdAt,
        }
      })
      .from(events)
      .leftJoin(users, eq(events.adminId, users.id));

    const conditions = [];

    if (params.search) {
      conditions.push(ilike(events.title, `%${params.search}%`));
    }

    if (params.eventType) {
      conditions.push(eq(events.eventType, params.eventType));
    }

    if (params.location) {
      conditions.push(ilike(events.location, `%${params.location}%`));
    }

    if (params.date) {
      const searchDate = new Date(params.date);
      conditions.push(eq(events.startDate, searchDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(events.createdAt));
  }

  async getEvent(id: number): Promise<EventWithAdmin | undefined> {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        venue: events.venue,
        startDate: events.startDate,
        endDate: events.endDate,
        startTime: events.startTime,
        endTime: events.endTime,
        cost: events.cost,
        eventType: events.eventType,
        location: events.location,
        imageUrl: events.imageUrl,
        adminId: events.adminId,
        isAiGenerated: events.isAiGenerated,
        createdAt: events.createdAt,
        admin: {
          id: users.id,
          name: users.name,
          email: users.email,
          password: users.password,
          role: users.role,
          createdAt: users.createdAt,
        }
      })
      .from(events)
      .leftJoin(users, eq(events.adminId, users.id))
      .where(eq(events.id, id));

    return event || undefined;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number, adminId: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.adminId, adminId)));
    
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
