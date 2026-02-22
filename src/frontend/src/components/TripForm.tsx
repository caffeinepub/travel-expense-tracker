import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTrip, useUpdateTrip } from '@/hooks/useQueries';
import { useActor } from '@/hooks/useActor';
import type { Trip } from '@/backend';
import { toast } from 'sonner';

interface TripFormProps {
  trip?: Trip | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TripFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function TripForm({ trip, onSuccess, onCancel }: TripFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TripFormData>({
    defaultValues: {
      name: trip?.name || '',
      startDate: trip?.startDate || '',
      endDate: trip?.endDate || '',
      description: trip?.description || '',
    },
  });

  const { actor, isFetching: isActorLoading } = useActor();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const onSubmit = async (data: TripFormData) => {
    console.log('🚀 Form submitted with data:', data);
    console.log('🔍 Actor status:', { actor: !!actor, isActorLoading });
    
    // Check if actor is ready
    if (!actor) {
      console.error('❌ Actor not ready');
      toast.error('Connection not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      if (trip) {
        console.log('📝 Updating existing trip:', trip.id);
        await updateTrip.mutateAsync({
          tripId: trip.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description || null,
        });
        console.log('✅ Trip updated successfully');
        toast.success('Trip updated successfully!');
      } else {
        console.log('➕ Creating new trip with params:', {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description || null,
        });
        const result = await createTrip.mutateAsync({
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description || null,
        });
        console.log('✅ Trip created successfully:', result);
        toast.success('Trip created successfully!');
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error('❌ Error saving trip:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });
      toast.error(
        error instanceof Error 
          ? `Failed to save trip: ${error.message}` 
          : 'Failed to save trip. Please try again.'
      );
    }
  };

  const isLoading = createTrip.isPending || updateTrip.isPending || isActorLoading;
  const isSubmitDisabled = isLoading || !actor;

  useEffect(() => {
    console.log('🔄 TripForm state:', {
      isLoading,
      isActorLoading,
      hasActor: !!actor,
      createPending: createTrip.isPending,
      updatePending: updateTrip.isPending,
      hasErrors: Object.keys(errors).length > 0,
      errors,
    });
  }, [isLoading, isActorLoading, actor, createTrip.isPending, updateTrip.isPending, errors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-stone-700 dark:text-stone-300">
          Trip Name *
        </Label>
        <Input
          id="name"
          {...register('name', { required: 'Trip name is required' })}
          placeholder="e.g., Summer Vacation 2026"
          className="border-stone-300 dark:border-stone-700"
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-stone-700 dark:text-stone-300">
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            className="border-stone-300 dark:border-stone-700"
            disabled={isLoading}
          />
          {errors.startDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-stone-700 dark:text-stone-300">
            End Date *
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate', { required: 'End date is required' })}
            className="border-stone-300 dark:border-stone-700"
            disabled={isLoading}
          />
          {errors.endDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-stone-700 dark:text-stone-300">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Add notes about your trip..."
          rows={3}
          className="border-stone-300 dark:border-stone-700 resize-none"
          disabled={isLoading}
        />
      </div>

      {isActorLoading && (
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to backend...</span>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {trip ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}
