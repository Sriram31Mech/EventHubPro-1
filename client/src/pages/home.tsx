import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Search } from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { format } from "date-fns";

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState({
    search: "",
    eventType: "all",
    location: "",
    date: "",
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", searchParams],
    queryFn: () => eventsAPI.getAllEvents({
      ...searchParams,
      eventType: searchParams.eventType === "all" ? "" : searchParams.eventType
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch due to the queryKey including searchParams
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Events Near You
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12">
              Find and attend the best events in your area. From conferences to workshops,
              we've got you covered.
            </p>
          </div>

          {/* Search Filters */}
          <Card className="max-w-4xl mx-auto transform translate-y-16">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search events..."
                    value={searchParams.search}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, search: e.target.value }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Select
                    value={searchParams.eventType}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({ ...prev, eventType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Location"
                    value={searchParams.location}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {isLoading ? (
          <div className="text-center">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Events Found</h2>
            <p className="text-gray-600">
              Try adjusting your search filters to find more events.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm font-medium">
                      <span className="text-primary">{event.eventType}</span>
                      <span className="mx-2">•</span>
                      <span>{event.cost}</span>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
