import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Search, ImageOff, Star, Users } from "lucide-react";
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

  // Function to get enhanced border and accent colors based on event type
  const getEventColors = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "conference":
        return {
          border: "border-blue-400/60",
          gradient: "from-blue-500 via-blue-600 to-indigo-600",
          shadow: "shadow-blue-500/20",
          badge: "bg-blue-500",
          icon: "text-blue-600",
          iconBg: "bg-blue-50"
        };
      case "workshop":
        return {
          border: "border-green-400/60",
          gradient: "from-green-500 via-emerald-500 to-teal-600",
          shadow: "shadow-green-500/20",
          badge: "bg-green-500",
          icon: "text-green-600",
          iconBg: "bg-green-50"
        };
      case "networking":
        return {
          border: "border-purple-400/60",
          gradient: "from-purple-500 via-violet-500 to-indigo-600",
          shadow: "shadow-purple-500/20",
          badge: "bg-purple-500",
          icon: "text-purple-600",
          iconBg: "bg-purple-50"
        };
      case "seminar":
        return {
          border: "border-orange-400/60",
          gradient: "from-orange-500 via-red-500 to-pink-600",
          shadow: "shadow-orange-500/20",
          badge: "bg-orange-500",
          icon: "text-orange-600",
          iconBg: "bg-orange-50"
        };
      default:
        return {
          border: "border-indigo-400/60",
          gradient: "from-indigo-500 via-purple-500 to-pink-600",
          shadow: "shadow-indigo-500/20",
          badge: "bg-indigo-500",
          icon: "text-indigo-600",
          iconBg: "bg-indigo-50"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Discover Premium Events</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Your Next Amazing
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Experience Awaits
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
              Discover extraordinary events, connect with like-minded people, and create unforgettable memories
            </p>
          </div>

          {/* Enhanced Search Filters */}
          <Card className="max-w-5xl mx-auto transform translate-y-20 shadow-2xl border-0 backdrop-blur-xl bg-white/95 ring-1 ring-white/20">
            <CardContent className="p-8">
              <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-200 group-hover:text-indigo-500 group-focus-within:text-indigo-500" />
                  <Input
                    placeholder="Search amazing events..."
                    value={searchParams.search}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, search: e.target.value }))
                    }
                    className="w-full pl-12 h-12 shadow-lg border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm rounded-xl"
                  />
                </div>
                <div>
                  <Select
                    value={searchParams.eventType}
                    onValueChange={(value) =>
                      setSearchParams((prev) => ({ ...prev, eventType: value }))
                    }
                  >
                    <SelectTrigger className="h-12 shadow-lg border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm rounded-xl">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent className="shadow-2xl border-gray-200/80 backdrop-blur-xl bg-white/95 rounded-xl">
                      <SelectItem value="all" className="hover:bg-indigo-50 rounded-lg">All Types</SelectItem>
                      <SelectItem value="conference" className="hover:bg-blue-50 rounded-lg">Conference</SelectItem>
                      <SelectItem value="workshop" className="hover:bg-green-50 rounded-lg">Workshop</SelectItem>
                      <SelectItem value="networking" className="hover:bg-purple-50 rounded-lg">Networking</SelectItem>
                      <SelectItem value="seminar" className="hover:bg-orange-50 rounded-lg">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-200 group-hover:text-indigo-500 group-focus-within:text-indigo-500" />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={searchParams.location}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full pl-12 h-12 shadow-lg border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm rounded-xl"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-200 group-hover:text-indigo-500 group-focus-within:text-indigo-500" />
                  <Input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full pl-12 h-12 shadow-lg border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm rounded-xl"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6 shadow-lg">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Loading Amazing Events</h3>
            <p className="text-gray-600">Discovering the best experiences for you...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-8 shadow-lg">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Events Found</h2>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              Try adjusting your search filters to discover more amazing events. We're constantly adding new experiences!
            </p>
          </div>
        ) : (
          <>
            {/* Enhanced Results header */}
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                {events.length === 1 ? '1 Amazing Event' : `${events.length} Amazing Events`}
              </h2>
              <p className="text-xl text-gray-600">Your next unforgettable experience is just a click away</p>
            </div>

            {/* Enhanced Events grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const colors = getEventColors(event.eventType);
                return (
                  <Card 
                    key={event._id} 
                    className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 shadow-xl hover:scale-[1.02] hover:-translate-y-3 bg-white/95 backdrop-blur-sm ${colors.border} ${colors.shadow} hover:shadow-2xl rounded-2xl`}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    {event.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden relative rounded-t-2xl">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 backdrop-blur-sm bg-black/20 rounded-full p-2">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={`aspect-video w-full flex items-center justify-center bg-gradient-to-br ${colors.gradient} relative overflow-hidden rounded-t-2xl`}>
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
                          <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-white rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col items-center text-white z-10">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                            <ImageOff className="w-8 h-8" />
                          </div>
                          <span className="text-lg font-semibold capitalize">{event.eventType}</span>
                          <span className="text-sm opacity-80">Event</span>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6 relative">
                      <div className={`absolute -top-3 right-6 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${colors.badge} ring-2 ring-white`}>
                        {event.eventType.toUpperCase()}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors duration-300 pr-16 leading-tight">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-gray-700 group-hover:text-gray-800 transition-colors">
                          <div className={`flex items-center justify-center w-10 h-10 ${colors.iconBg} rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200`}>
                            <Calendar className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <span className="font-semibold text-base">{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-gray-700 group-hover:text-gray-800 transition-colors">
                          <div className={`flex items-center justify-center w-10 h-10 ${colors.iconBg} rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200`}>
                            <Clock className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <span className="font-semibold text-base">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700 group-hover:text-gray-800 transition-colors">
                          <div className={`flex items-center justify-center w-10 h-10 ${colors.iconBg} rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200`}>
                            <MapPin className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <span className="font-semibold text-base truncate">{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {event.cost}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Explore Event
                        </Button>
                      </div>
                      
                      {/* Enhanced hover effect overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`}></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}