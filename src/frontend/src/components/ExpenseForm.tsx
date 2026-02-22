import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAddExpense, useUpdateExpense } from '@/hooks/useQueries';
import { ExternalBlob, ExpenseCategory, type Expense } from '@/backend';
import { toast } from 'sonner';

interface ExpenseFormProps {
  tripId: string;
  expense?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ExpenseFormData {
  title: string;
  amount: string;
  category: ExpenseCategory;
  expenseDate: string;
  notes: string;
}

export default function ExpenseForm({ tripId, expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExpenseFormData>({
    defaultValues: {
      title: expense?.title || '',
      amount: expense?.amount?.toString() || '',
      category: expense?.category || ExpenseCategory.Other,
      expenseDate: expense?.expenseDate || new Date().toISOString().split('T')[0],
      notes: expense?.notes || '',
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();

  const category = watch('category');

  useEffect(() => {
    if (expense?.billImage) {
      setPreviewUrl(expense.billImage.getDirectURL());
    }
  }, [expense]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Please select a JPG or PNG image');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      let billImage: ExternalBlob;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        billImage = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (expense?.billImage) {
        billImage = expense.billImage;
      } else {
        toast.error('Please upload a bill image');
        return;
      }

      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (expense) {
        await updateExpense.mutateAsync({
          expenseId: expense.id,
          title: data.title,
          amount,
          category: data.category,
          expenseDate: data.expenseDate,
          billImage,
          notes: data.notes || null,
          tripId,
        });
        toast.success('Expense updated successfully!');
      } else {
        await addExpense.mutateAsync({
          title: data.title,
          amount,
          category: data.category,
          expenseDate: data.expenseDate,
          billImage,
          notes: data.notes || null,
          tripId,
        });
        toast.success('Expense added successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save expense. Please try again.');
      console.error('Error saving expense:', error);
    }
  };

  const isLoading = addExpense.isPending || updateExpense.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-stone-700 dark:text-stone-300">
          Expense Title *
        </Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="e.g., Hotel Accommodation"
          className="border-stone-300 dark:border-stone-700"
        />
        {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-stone-700 dark:text-stone-300">
            Amount (₹) *
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', { required: 'Amount is required' })}
            placeholder="₹ Enter amount"
            className="border-stone-300 dark:border-stone-700"
          />
          {errors.amount && <p className="text-sm text-red-600 dark:text-red-400">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-stone-700 dark:text-stone-300">
            Category *
          </Label>
          <Select value={category} onValueChange={(value) => setValue('category', value as ExpenseCategory)}>
            <SelectTrigger className="border-stone-300 dark:border-stone-700">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExpenseCategory.Travel}>Travel</SelectItem>
              <SelectItem value={ExpenseCategory.Food}>Food</SelectItem>
              <SelectItem value={ExpenseCategory.Hotel}>Hotel</SelectItem>
              <SelectItem value={ExpenseCategory.Other}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expenseDate" className="text-stone-700 dark:text-stone-300">
          Expense Date *
        </Label>
        <Input
          id="expenseDate"
          type="date"
          {...register('expenseDate', { required: 'Date is required' })}
          className="border-stone-300 dark:border-stone-700"
        />
        {errors.expenseDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.expenseDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="billImage" className="text-stone-700 dark:text-stone-300">
          Bill Image * (JPG or PNG)
        </Label>
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Bill preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-stone-300 dark:border-stone-700"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
            <Upload className="h-12 w-12 mx-auto text-stone-400 dark:text-stone-600 mb-2" />
            <Label htmlFor="billImage" className="cursor-pointer">
              <span className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                Click to upload
              </span>
              <span className="text-stone-600 dark:text-stone-400"> or drag and drop</span>
            </Label>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">JPG or PNG (max 10MB)</p>
            <Input
              id="billImage"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-stone-600 dark:text-stone-400">Uploading: {uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-stone-700 dark:text-stone-300">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any additional notes..."
          rows={3}
          className="border-stone-300 dark:border-stone-700 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
