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
import { Upload, Sparkles, Calendar, MapPin, Clock, Users, DollarSign, FileText, ImageIcon, CheckCircle } from "lucide-react";
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

const eventTypeIcons = {
  conference: Users,
  workshop: FileText,
  networking: Users,
  seminar: FileText
};

const eventTypeColors = {
  conference: "bg-blue-100 text-blue-600 border-blue-200",
  workshop: "bg-green-100 text-green-600 border-green-200",
  networking: "bg-purple-100 text-purple-600 border-purple-200",
  seminar: "bg-orange-100 text-orange-600 border-orange-200"
};

export default function AdminCreateEvent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const currentUser = authAPI.getCurrentUser();

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
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image') {
          formData.append(key, value);
        }
      });

      // Add the current user's ID as adminId
      if (currentUser?._id) {
        formData.append('adminId', currentUser._id);
      }

      // Add the file if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      return eventsAPI.createEvent(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "🎉 Event created successfully!",
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
        title: "✨ AI Description Generated!",
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
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "📸 File selected",
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

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create New Event
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bring your vision to life by creating an engaging event that connects people and creates memorable experiences
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Basic Info</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Details</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Event Information */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Event Information</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>Event Title</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your event title" 
                                className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                                {...field} 
                              />
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
                            <FormLabel className="text-base font-semibold flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Event Venue</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter venue address" 
                                className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                                {...field} 
                              />
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Start Time</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                              {...field} 
                            />
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>End Time</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                              {...field} 
                            />
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Start Date</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                              {...field} 
                            />
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>End Date</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                              {...field} 
                            />
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Event Type</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conference">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>Conference</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="workshop">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span>Workshop</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="networking">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>Networking</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="seminar">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span>Seminar</span>
                                </div>
                              </SelectItem>
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
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Location</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Mumbai, Delhi, Bangalore" 
                              className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                              {...field} 
                            />
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
                            <FormLabel className="text-base font-semibold flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Event Cost</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter the cost of the event in INR (e.g., Free, ₹500, ₹1000)" 
                                className="h-12 text-lg border-2 focus:border-indigo-500 transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Event Description Section */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Media & Description</h2>
                  </div>

                  {/* Event Image Upload */}
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-4">Event Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-indigo-50">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-48 h-32 object-cover rounded-xl shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-sm text-green-600 font-medium flex items-center justify-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{selectedFile?.name}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Upload className="h-10 w-10 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-gray-900">Upload Event Image</p>
                            <p className="text-gray-500 mt-1">Max file size: 5MB • Supported formats: JPG, JPEG, PNG</p>
                          </div>
                        </div>
                      )}
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
                        size="lg"
                        onClick={() => document.getElementById('event-image-upload')?.click()}
                        className="mt-4 border-2 hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview ? 'Change Image' : 'Choose File'}
                      </Button>
                    </div>
                  </div>

                  {/* Event Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-4">
                          <FormLabel className="text-base font-semibold flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Event Description</span>
                          </FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateAIDescription}
                            disabled={generateDescriptionMutation.isPending}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {generateDescriptionMutation.isPending ? "Generating..." : "Generate with AI"}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Type here... or use AI to generate a compelling description"
                            className="resize-none text-lg border-2 focus:border-indigo-500 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Event...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Create Event</span>
                      </div>
                    )}
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