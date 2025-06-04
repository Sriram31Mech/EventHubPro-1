import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ArrowLeft, Users, Tag, Info } from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { format } from "date-fns";

export default function EventDetails({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", params.id],
    queryFn: () => eventsAPI.getEvent(params.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-600">
            Failed to load event details. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full aspect-video rounded-lg overflow-hidden mb-8">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Event Details */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Title and Type */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center text-primary">
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="capitalize">{event.eventType}</span>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(event.startDate), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center text-gray-700">
                    <Info className="w-4 h-4 mr-2" />
                    <span>{event.cost}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About this Event</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 