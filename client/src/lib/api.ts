import { apiRequest } from "./queryClient";
import { getAuthHeaders } from "./auth";
import type { Event, EventSearchParams } from "@shared/schema";
import { handleResponse } from "./utils";

export interface CreateEventRequest {
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  cost: string;
  eventType: string;
  location: string;
  image?: File;
}

export const eventsAPI = {
  getAllEvents: async (params?: EventSearchParams): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.eventType && params.eventType !== "all") searchParams.set("eventType", params.eventType);
    if (params?.location) searchParams.set("location", params.location);
    if (params?.date) searchParams.set("date", params.date);

    const response = await fetch(`/api/events?${searchParams.toString()}`);
    const data = await handleResponse(response);
    return data.events;
  },

  getEvent: async (id: string): Promise<Event> => {
    const response = await fetch(`/api/events/${id}`);
    const data = await handleResponse(response);
    return data.event;
  },

  createEvent: async (formData: FormData): Promise<Event> => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await handleResponse(response);
    return data.event;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response = await fetch("/api/events/my", {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const result = await response.json();
    return result.events;
  },

  generateDescription: async (data: {
    title: string;
    venue: string;
    eventType?: string;
    location?: string;
  }): Promise<{ description: string; isAiGenerated: boolean }> => {
    const response = await fetch("/api/ai/generate-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return await response.json();
  },

  deleteEvent: async (id: string): Promise<void> => {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    await handleResponse(response);
  }
};
