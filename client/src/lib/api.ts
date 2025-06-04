import { apiRequest } from "./queryClient";
import { getAuthHeaders } from "./auth";

export interface Event {
  id: number;
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
  imageUrl?: string;
  adminId: number;
  isAiGenerated: boolean;
  createdAt: string;
  admin?: {
    id: number;
    name: string;
    email: string;
  };
}

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

export interface EventSearchParams {
  search?: string;
  eventType?: string;
  location?: string;
  date?: string;
}

export const eventsAPI = {
  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== undefined) {
        formData.append(key, value as string);
      }
    });

    const response = await fetch("/api/events", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || response.statusText);
    }

    const result = await response.json();
    return result.event;
  },

  getAllEvents: async (params?: EventSearchParams): Promise<Event[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const url = `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest("GET", url);
    const result = await response.json();
    return result.events;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response = await fetch("/api/events/my", {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(response.statusText);
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
      throw new Error(response.statusText);
    }

    return await response.json();
  },

  deleteEvent: async (id: number): Promise<void> => {
    await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
  }
};
