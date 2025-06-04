import { users, events, type User, type InsertUser, type Event, type InsertEvent, type EventSearchParams } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike } from "drizzle-orm";

export interface EventWithAdmin extends Event {
  admin: User;
}

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
    const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
    const result: EventWithAdmin[] = [];
    
    for (const event of allEvents) {
      const [admin] = await db.select().from(users).where(eq(users.id, event.adminId));
      if (admin) {
        result.push({ ...event, admin });
      }
    }
    
    return result;
  }

  async searchEvents(params: EventSearchParams): Promise<EventWithAdmin[]> {
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
      conditions.push(eq(events.startDate, params.date));
    }

    let searchedEvents;
    if (conditions.length > 0) {
      searchedEvents = await db.select().from(events).where(and(...conditions)).orderBy(desc(events.createdAt));
    } else {
      searchedEvents = await db.select().from(events).orderBy(desc(events.createdAt));
    }

    const result: EventWithAdmin[] = [];
    for (const event of searchedEvents) {
      const [admin] = await db.select().from(users).where(eq(users.id, event.adminId));
      if (admin) {
        result.push({ ...event, admin });
      }
    }

    return result;
  }

  async getEvent(id: number): Promise<EventWithAdmin | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return undefined;
    
    const [admin] = await db.select().from(users).where(eq(users.id, event.adminId));
    if (!admin) return undefined;
    
    return { ...event, admin };
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
    
    return Array.isArray(result) ? result.length > 0 : true;
  }
}

export const storage = new DatabaseStorage();
