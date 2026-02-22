import { Calendar, MapPin, Trash2, Edit, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGetAllTrips, useDeleteTrip } from '@/hooks/useQueries';
import type { Trip } from '@/backend';
import { toast } from 'sonner';

interface TripListProps {
  onEdit: (trip: Trip) => void;
  onTripClick: (tripId: string) => void;
  filteredTrips?: Trip[];
  searchQuery?: string;
}

export default function TripList({ onEdit, onTripClick, filteredTrips, searchQuery }: TripListProps) {
  const { data: trips, isLoading } = useGetAllTrips();
  const deleteTrip = useDeleteTrip();

  const handleDelete = async (tripId: string, tripName: string) => {
    try {
      await deleteTrip.mutateAsync(tripId);
      toast.success(`"${tripName}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete trip. Please try again.');
      console.error('Error deleting trip:', error);
    }
  };

  // Use filtered trips if provided, otherwise use all trips
  const displayTrips = filteredTrips !== undefined ? filteredTrips : trips;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!displayTrips || displayTrips.length === 0) {
    return (
      <Card className="border-dashed border-2 border-stone-300 dark:border-stone-700">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MapPin className="h-16 w-16 text-stone-400 dark:text-stone-600 mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
            {searchQuery ? 'No trips found' : 'No trips yet'}
          </h3>
          <p className="text-stone-600 dark:text-stone-400 text-center max-w-md">
            {searchQuery 
              ? `No trips match "${searchQuery}". Try a different search term.`
              : 'Start tracking your travel expenses by creating your first trip'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayTrips.map((trip) => (
        <Card
          key={trip.id}
          className="group hover:shadow-xl transition-all duration-300 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
          onClick={() => onTripClick(trip.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {trip.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {trip.description && (
              <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{trip.description}</p>
            )}
            <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(trip)}
                className="flex-1 border-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-300 hover:border-red-500 hover:text-red-700 dark:border-stone-700 dark:hover:border-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{trip.name}"? This action cannot be undone and will also delete
                      all associated expenses.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(trip.id, trip.name)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
