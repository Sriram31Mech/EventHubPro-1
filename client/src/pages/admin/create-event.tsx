import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/auth";

const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  venue: z.string().min(1, "Venue is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  cost: z.string().min(1, "Cost information is required"),
  eventType: z.enum(["conference", "workshop", "networking", "seminar"]),
  location: z.string().min(1, "Location is required"),
  image: z.any().optional(),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function AdminCreateEvent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Check if user is admin
  if (!authAPI.isAdmin()) {
    navigate("/");
    return null;
  }

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      cost: "",
      eventType: "conference",
      location: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventForm) => {
      const eventData = {
        ...data,
        image: selectedFile || undefined,
      };
      return eventsAPI.createEvent(eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created successfully!",
        description: "Redirecting to your dashboard...",
      });
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create event",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateDescriptionMutation = useMutation({
    mutationFn: (data: { title: string; venue: string; eventType: string; location: string }) =>
      eventsAPI.generateDescription(data),
    onSuccess: (result) => {
      form.setValue("description", result.description);
      toast({
        title: "AI Description Generated!",
        description: "You can edit the description as needed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate description",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEventForm) => {
    createEventMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      toast({
        title: "File selected",
        description: `${file.name} is ready to upload.`,
      });
    }
  };

  const generateAIDescription = () => {
    const title = form.getValues("title");
    const venue = form.getValues("venue");
    const eventType = form.getValues("eventType");
    const location = form.getValues("location");

    if (!title || !venue) {
      toast({
        title: "Missing information",
        description: "Please fill in event title and venue first.",
        variant: "destructive",
      });
      return;
    }

    generateDescriptionMutation.mutate({ title, venue, eventType, location });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
              <p className="text-gray-600">Fill in the details to create your new event</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Event Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Venue</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter venue address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conference">Conference</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="networking">Networking</SelectItem>
                            <SelectItem value="seminar">Seminar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mumbai, Delhi, Bangalore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Cost</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the cost of the event in INR (e.g., Free, ₹500, ₹1000)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Event Description Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Event Description</h2>

                  {/* Event Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors duration-200">
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload Here</p>
                          <p className="text-sm text-gray-500">Max file size: 5MB. Supported formats: JPG, JPEG, PNG</p>
                          {selectedFile && (
                            <p className="text-sm text-primary font-medium mt-2">
                              Selected: {selectedFile.name}
                            </p>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="event-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('event-image-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Event Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Event Description</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateAIDescription}
                            disabled={generateDescriptionMutation.isPending}
                            className="ai-gradient text-white border-0 hover:opacity-90"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {generateDescriptionMutation.isPending ? "Generating..." : "Generate with AI"}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Type here... or use AI to generate a compelling description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Creating Event..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
