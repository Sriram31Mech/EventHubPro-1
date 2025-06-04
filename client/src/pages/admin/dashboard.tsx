import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Users, Search, Filter, Grid, List, Eye, MoreVertical } from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const statsItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");

  // Check if user is admin
  useEffect(() => {
    if (!authAPI.isAdmin()) {
      navigate("/");
    }
  }, [navigate]);

  // Fetch admin's events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsAPI.getMyEvents(),
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: eventsAPI.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete event",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || event.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get unique event types for filter
  const eventTypes = [...new Set(events.map(event => event.eventType))];

  // Calculate stats
  const stats = {
    total: events.length,
    upcoming: events.filter(event => new Date(event.startDate) > new Date()).length,
    thisMonth: events.filter(event => {
      const eventDate = new Date(event.startDate);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-600 text-lg font-medium">Loading your events...</div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Events</h3>
                  <p className="text-red-600">Failed to load events. Please check your connection and try again.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Event Dashboard
              </h1>
              <p className="text-slate-600 text-lg">Manage and track your created events</p>
            </div>
            <Button 
              onClick={() => navigate("/admin/create-event")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-6 py-3 text-white font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={statsItem}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Events</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={statsItem}>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={statsItem}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold">{stats.thisMonth}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Controls Section */}
        {events.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 bg-white/80"
                      />
                    </div>
                    
                    {/* Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="pl-10 pr-8 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 bg-white/80 appearance-none cursor-pointer min-w-[140px]"
                      >
                        <option value="all">All Types</option>
                        {eventTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === "grid" 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === "list" 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Events Grid/List */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 && events.length > 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No events found</h3>
                  <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm border-slate-200/60 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-3">Ready to create your first event?</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-6">
                    Start building amazing experiences for your audience. Create your first event and watch your community grow!
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/create-event")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-8 py-3"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key={`events-${viewMode}`}
              className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event._id} variants={item}>
                  {viewMode === "grid" ? (
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                      {event.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden relative">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(event._id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-slate-600">
                            <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                            <span className="font-medium">{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Clock className="w-4 h-4 mr-3 text-emerald-500" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <MapPin className="w-4 h-4 mr-3 text-red-500" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Users className="w-4 h-4 mr-3 text-purple-500" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
                              {event.eventType}
                            </span>
                            <span className="text-slate-700 font-semibold">{event.cost}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {event.imageUrl && (
                            <div className="w-full lg:w-32 h-32 lg:h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors duration-200">
                                  {event.title}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                    {format(new Date(event.startDate), "MMM d, yyyy")}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                                    {event.startTime} - {event.endTime}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="truncate">{event.venue}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between lg:justify-end lg:flex-col lg:items-end gap-4">
                                <div className="flex items-center space-x-3">
                                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
                                    {event.eventType}
                                  </span>
                                  <span className="text-slate-700 font-semibold">{event.cost}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(event._id)}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}