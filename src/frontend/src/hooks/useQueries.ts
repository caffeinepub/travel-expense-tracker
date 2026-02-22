import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExpenseCategory, type Trip, type Expense, ExternalBlob } from '@/backend';

// Trip Queries
export function useGetAllTrips() {
  const { actor, isFetching } = useActor();

  return useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      console.log('📋 Fetching all trips...');
      if (!actor) {
        console.log('⚠️ Actor not available, returning empty array');
        return [];
      }
      const trips = await actor.getAllTrips();
      console.log('✅ Fetched trips:', trips);
      return trips;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTripById(tripId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Trip>({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getTripById(tripId);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useCreateTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      startDate: string;
      endDate: string;
      description: string | null;
    }) => {
      console.log('🔧 useCreateTrip mutation called');
      console.log('📦 Mutation data:', JSON.stringify(data, null, 2));
      console.log('🔧 Actor status:', actor ? 'initialized' : 'NOT initialized');
      
      if (!actor) {
        const error = new Error('Backend connection not ready. Please wait a moment and try again.');
        console.error('❌ Actor not initialized');
        throw error;
      }
      
      console.log('📡 Calling backend createTrip with parameters:');
      console.log('  - name:', data.name);
      console.log('  - startDate:', data.startDate);
      console.log('  - endDate:', data.endDate);
      console.log('  - description:', data.description);
      
      try {
        const result = await actor.createTrip(
          data.name,
          data.startDate,
          data.endDate,
          data.description
        );
        console.log('✅ Backend createTrip returned:', JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error('❌ Backend createTrip call failed');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Mutation succeeded, invalidating trips query');
      console.log('Created trip data:', data);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error) => {
      console.error('❌ Mutation onError callback triggered');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : undefined);
      console.error('Full error object:', error);
    },
  });
}

export function useUpdateTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      tripId: string;
      name: string;
      startDate: string;
      endDate: string;
      description: string | null;
    }) => {
      console.log('🔧 useUpdateTrip mutation called with:', data);
      
      if (!actor) {
        const error = new Error('Backend connection not ready. Please wait a moment and try again.');
        console.error('❌ Actor not initialized');
        throw error;
      }
      
      console.log('📡 Calling backend updateTrip...');
      try {
        await actor.updateTrip(data.tripId, data.name, data.startDate, data.endDate, data.description);
        console.log('✅ Backend update completed');
      } catch (error) {
        console.error('❌ Backend call failed:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log('✅ Update mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
    onError: (error) => {
      console.error('❌ Update mutation failed:', error);
    },
  });
}

export function useDeleteTrip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteTrip(tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// Expense Queries
export function useGetExpensesByTripId(tripId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Expense[]>({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpensesByTripId(tripId);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      amount: number;
      category: ExpenseCategory;
      expenseDate: string;
      billImage: ExternalBlob;
      notes: string | null;
      tripId: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addExpense(
        data.title,
        data.amount,
        data.category,
        data.expenseDate,
        data.billImage,
        data.notes,
        data.tripId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      expenseId: string;
      title: string;
      amount: number;
      category: ExpenseCategory;
      expenseDate: string;
      billImage: ExternalBlob;
      notes: string | null;
      tripId: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateExpense(
        data.expenseId,
        data.title,
        data.amount,
        data.category,
        data.expenseDate,
        data.billImage,
        data.notes,
        data.tripId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteExpense(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
