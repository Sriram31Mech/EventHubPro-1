import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Edit, Trash2 } from "lucide-react";
import { Event } from "@/lib/api";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
}

export default function EventCard({ event, showActions = false, onEdit, onDelete }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
  };

  const isFreeEvent = event.cost.toLowerCase().includes('free') || event.cost === '0';

  return (
    <Card className="event-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <div className="text-6xl">🎭</div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant={isFreeEvent ? "default" : "secondary"} className="font-medium">
            {isFreeEvent ? "FREE" : "PAID"}
          </Badge>
        </div>
        {event.isAiGenerated && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/90">
              AI Generated
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.startDate)}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            {event.venue}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {event.eventType.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500">{event.location}</span>
          </div>
          
          {!showActions && (
            <span className="text-sm font-medium text-primary">
              {event.cost}
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Admin: {event.admin?.name}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(event)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(event.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
