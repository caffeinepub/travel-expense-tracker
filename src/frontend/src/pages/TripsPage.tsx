import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TripForm from '@/components/TripForm';
import TripList from '@/components/TripList';
import type { Trip } from '@/backend';
import { useGetAllTrips } from '@/hooks/useQueries';

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: trips } = useGetAllTrips();

  const handleEdit = (trip: Trip) => {
    console.log('✏️ Editing trip:', trip);
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleFormClose = () => {
    console.log('🔒 Closing form');
    setShowForm(false);
    setEditingTrip(null);
  };

  const handleTripClick = (tripId: string) => {
    console.log('🔗 Navigating to trip expenses:', tripId);
    navigate({ to: '/trips/$tripId/expenses', params: { tripId } });
  };

  const handleNewTrip = () => {
    console.log('➕ Opening new trip form');
    setEditingTrip(null);
    setShowForm(true);
  };

  // Filter trips based on search query
  const filteredTrips = trips?.filter((trip) =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100">My Trips</h1>
          <p className="text-stone-600 dark:text-stone-400">Manage your travel adventures and expenses</p>
        </div>
        <Button
          onClick={handleNewTrip}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Trip
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-200 shadow-xl dark:border-emerald-900">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
              <MapPin className="h-5 w-5" />
              {editingTrip ? 'Edit Trip' : 'Create New Trip'}
            </CardTitle>
            <CardDescription>
              {editingTrip ? 'Update your trip details' : 'Add a new travel adventure'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <TripForm trip={editingTrip} onSuccess={handleFormClose} onCancel={handleFormClose} />
          </CardContent>
        </Card>
      )}

      {trips && trips.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-600" />
          <Input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-stone-300 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500"
          />
        </div>
      )}

      <TripList 
        onEdit={handleEdit} 
        onTripClick={handleTripClick} 
        filteredTrips={filteredTrips}
        searchQuery={searchQuery}
      />
    </div>
  );
}
