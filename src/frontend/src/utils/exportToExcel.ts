import type { Expense } from '@/backend';
import { formatCurrency } from './formatCurrency';

export async function exportToExcel(tripName: string, expenses: Expense[]) {
  // Create CSV content
  const headers = ['Expense Title', 'Category', 'Date', 'Amount'];
  const rows = expenses.map((expense) => [
    expense.title,
    expense.category,
    new Date(expense.expenseDate).toLocaleDateString(),
    formatCurrency(expense.amount),
  ]);

  // Calculate total
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  rows.push(['TOTAL', '', '', formatCurrency(total)]);

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tripName.replace(/[^a-z0-9]/gi, '_')}_Expenses.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
