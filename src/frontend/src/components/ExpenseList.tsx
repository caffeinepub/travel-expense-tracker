import { useState } from 'react';
import { Calendar, DollarSign, Edit, Eye, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useGetExpensesByTripId, useDeleteExpense } from '@/hooks/useQueries';
import BillImageModal from '@/components/BillImageModal';
import type { Expense } from '@/backend';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatCurrency';

interface ExpenseListProps {
  tripId: string;
  onEdit: (expense: Expense) => void;
  onExport: (expenses: Expense[]) => void;
}

const categoryColors = {
  Travel: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Hotel: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function ExpenseList({ tripId, onEdit, onExport }: ExpenseListProps) {
  const { data: expenses, isLoading } = useGetExpensesByTripId(tripId);
  const deleteExpense = useDeleteExpense();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDelete = async (expenseId: string, expenseTitle: string) => {
    try {
      await deleteExpense.mutateAsync(expenseId);
      toast.success(`"${expenseTitle}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete expense. Please try again.');
      console.error('Error deleting expense:', error);
    }
  };

  const total = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-stone-200 dark:border-stone-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl text-stone-900 dark:text-stone-100">Expenses</CardTitle>
          {expenses && expenses.length > 0 && (
            <Button
              onClick={() => onExport(expenses)}
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-stone-400 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">No expenses yet</h3>
              <p className="text-stone-600 dark:text-stone-400">Start adding expenses to track your spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-white dark:bg-stone-900"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100">{expense.title}</h4>
                      <Badge className={categoryColors[expense.category]}>{expense.category}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(expense.amount)}</span>
                      </div>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{expense.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExpense(expense)}
                      className="border-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View Bill
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      className="border-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                    >
                      <Edit className="h-3 w-3" />
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
                          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(expense.id, expense.title)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                  <span className="text-lg font-bold text-stone-900 dark:text-stone-100">Total Expenses</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedExpense && (
        <BillImageModal
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </>
  );
}
