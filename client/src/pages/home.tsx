import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Play } from "lucide-react";
import EventCard from "@/components/event-card";
import { eventsAPI, EventSearchParams } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<EventSearchParams>({});
  const [localSearch, setLocalSearch] = useState("");
  const [localType, setLocalType] = useState("");
  const [localLocation, setLocalLocation] = useState("");
  const [localDate, setLocalDate] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", searchParams],
    queryFn: () => eventsAPI.getAllEvents(searchParams),
  });

  const handleSearch = () => {
    setSearchParams({
      search: localSearch || undefined,
      eventType: localType || undefined,
      location: localLocation || undefined,
      date: localDate || undefined,
    });
  };

  const handleDiscoverNow = () => {
    toast({
      title: "Welcome to Event Hive!",
      description: "Explore our amazing events below.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover and experience 
                <span className="block">extraordinary Events</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-purple-100 leading-relaxed">
                Enter in the world of events. Discover new life latest Events or start creating your own!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto"
                  onClick={handleDiscoverNow}
                >
                  Discover now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-4 h-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch video
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full max-w-md mx-auto">
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="text-8xl mb-4">🏆</div>
                  <div className="text-6xl mb-4">✈️</div>
                  <div className="text-4xl">🎭</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Event</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Events</label>
                <div className="relative">
                  <Input
                    placeholder="Search by title..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="form-input"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <Select value={localType} onValueChange={setLocalType}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <Select value={localLocation} onValueChange={setLocalLocation}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="San Francisco">San Francisco</SelectItem>
                    <SelectItem value="Lucknow">Lucknow</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={localDate}
                  onChange={(e) => setLocalDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleSearch} size="lg" className="px-8">
                <Search className="w-4 h-4 mr-2" />
                Search Events
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Listed Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Listed Events</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {Object.keys(searchParams).length > 0 
                  ? "Try adjusting your search criteria to find more events."
                  : "No events are currently available. Check back later!"}
              </p>
              {Object.keys(searchParams).length > 0 && (
                <Button onClick={() => {
                  setSearchParams({});
                  setLocalSearch("");
                  setLocalType("");
                  setLocalLocation("");
                  setLocalDate("");
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {events.length >= 9 && (
                <div className="text-center mt-12">
                  <Button size="lg" className="px-8">
                    Load more...
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
