import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Users } from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-primary text-lg">Loading events...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                Failed to load events. Please try again later.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-600">Manage and track your created events</p>
          </div>
          <Button 
            onClick={() => navigate("/admin/create-event")}
            className="bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-dashed border-2 border-gray-300 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-900">No Events Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You haven't created any events yet. Start by creating your first event and begin managing amazing experiences!
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/create-event")}
                    className="mt-4 bg-primary hover:bg-primary/90 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {events.map((event) => (
              <motion.div key={event._id} variants={item}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  {event.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-200">
                      {event.title}
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                        <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary/70" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary/70" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {event.eventType}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600">{event.cost}</span>
                      </div>
                      <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                          className="hover:bg-primary hover:text-white transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(event._id)}
                          className="hover:bg-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
