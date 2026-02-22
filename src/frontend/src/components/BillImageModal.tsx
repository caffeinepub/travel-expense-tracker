import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Expense } from '@/backend';
import { formatCurrency } from '@/utils/formatCurrency';

interface BillImageModalProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillImageModal({ expense, isOpen, onClose }: BillImageModalProps) {
  const imageUrl = expense.billImage.getDirectURL();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-stone-900 dark:text-stone-100">{expense.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={imageUrl}
            alt={`Bill for ${expense.title}`}
            className="w-full h-auto rounded-lg border border-stone-200 dark:border-stone-800"
          />
          <div className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <p>
              <span className="font-semibold">Amount:</span> {formatCurrency(expense.amount)}
            </p>
            <p>
              <span className="font-semibold">Category:</span> {expense.category}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {new Date(expense.expenseDate).toLocaleDateString()}
            </p>
            {expense.notes && (
              <p>
                <span className="font-semibold">Notes:</span> {expense.notes}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
