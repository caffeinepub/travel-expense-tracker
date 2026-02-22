import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Plus, Download, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import { useGetTripById } from '@/hooks/useQueries';
import { exportToExcel } from '@/utils/exportToExcel';
import type { Expense } from '@/backend';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const { tripId } = useParams({ strict: false }) as { tripId: string };
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: trip, isLoading: tripLoading } = useGetTripById(tripId);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleExport = (expenses: Expense[]) => {
    if (trip) {
      exportToExcel(trip.name, expenses);
      toast.success('Expenses exported successfully!');
    }
  };

  if (tripLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-stone-600 dark:text-stone-400">Trip not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/trips' })}
            className="text-stone-600 hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-400 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trips
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Trip Expenses</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            {trip.description && (
              <p className="text-stone-600 dark:text-stone-400 max-w-2xl">{trip.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Expense
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-emerald-200 shadow-xl dark:border-emerald-900">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </CardTitle>
            <CardDescription>
              {editingExpense ? 'Update expense details' : 'Record a new expense for this trip'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ExpenseForm
              tripId={tripId}
              expense={editingExpense}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <ExpenseList tripId={tripId} onEdit={handleEdit} onExport={handleExport} />
    </div>
  );
}
