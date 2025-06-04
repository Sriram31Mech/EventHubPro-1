import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Play, Users, IndianRupee, Edit, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { eventsAPI } from "@/lib/api";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin
  if (!authAPI.isAdmin()) {
    navigate("/");
    return null;
  }

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events/my"],
    queryFn: eventsAPI.getMyEvents,
  });

  const deleteEventMutation = useMutation({
    mutationFn: eventsAPI.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/my"] });
      toast({
        title: "Event deleted successfully",
        description: "The event has been removed from your dashboard.",
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

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
  };

  // Calculate stats
  const totalEvents = events.length;
  const activeEvents = events.filter(event => new Date(event.endDate) > new Date()).length;
  const totalAttendees = totalEvents * 50; // Mock calculation
  const totalRevenue = events.reduce((sum, event) => {
    const cost = event.cost.toLowerCase();
    if (cost.includes('free') || cost === '0') return sum;
    // Extract number from cost string
    const amount = parseInt(cost.replace(/[^\d]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your events and track performance</p>
          </div>
          <Link href="/admin/create-event">
            <Button size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Events</p>
                  <p className="text-3xl font-bold text-green-600">{activeEvents}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Attendees</p>
                  <p className="text-3xl font-bold text-blue-600">{totalAttendees.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <IndianRupee className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Events Section */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">All</Button>
                <Button variant="ghost" size="sm">Active</Button>
                <Button variant="ghost" size="sm">Completed</Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any events yet. Start by creating your first event!
                </p>
                <Link href="/admin/create-event">
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const isActive = new Date(event.endDate) > new Date();
                  const isUpcoming = new Date(event.startDate) > new Date();
                  
                  return (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🎭</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                            <p className="text-gray-600">
                              {formatDate(event.startDate)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </p>
                            <p className="text-sm text-gray-500">{event.venue}</p>
                            {event.isAiGenerated && (
                              <Badge variant="outline" className="mt-1">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                              {Math.floor(Math.random() * 200) + 50}
                            </p>
                            <p className="text-sm text-gray-500">Attendees</p>
                          </div>
                          <Badge 
                            variant={isUpcoming ? "secondary" : isActive ? "default" : "outline"}
                            className={
                              isUpcoming 
                                ? "bg-blue-100 text-blue-800" 
                                : isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {isUpcoming ? "Upcoming" : isActive ? "Active" : "Completed"}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteEventMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
