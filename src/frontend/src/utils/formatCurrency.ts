/**
 * Formats a number as Indian Rupees currency
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol (e.g., "₹1234.50")
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
