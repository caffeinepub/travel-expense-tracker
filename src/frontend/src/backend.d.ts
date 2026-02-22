import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Trip {
    id: string;
    endDate: string;
    name: string;
    description?: string;
    startDate: string;
}
export interface Expense {
    id: string;
    expenseDate: string;
    title: string;
    billImage: ExternalBlob;
    tripId: string;
    notes?: string;
    category: ExpenseCategory;
    amount: number;
}
export enum ExpenseCategory {
    Food = "Food",
    Travel = "Travel",
    Hotel = "Hotel",
    Other = "Other"
}
export interface backendInterface {
    addExpense(title: string, amount: number, category: ExpenseCategory, expenseDate: string, billImage: ExternalBlob, notes: string | null, tripId: string): Promise<Expense>;
    createTrip(name: string, startDate: string, endDate: string, description: string | null): Promise<Trip>;
    debugPrintTripsMap(): Promise<void>;
    deleteExpense(expenseId: string): Promise<void>;
    deleteTrip(tripId: string): Promise<void>;
    getAllTrips(): Promise<Array<Trip>>;
    getExpensesByTripId(tripId: string): Promise<Array<Expense>>;
    getTripById(tripId: string): Promise<Trip>;
    updateExpense(expenseId: string, title: string, amount: number, category: ExpenseCategory, expenseDate: string, billImage: ExternalBlob, notes: string | null, tripId: string): Promise<void>;
    updateTrip(tripId: string, name: string, startDate: string, endDate: string, description: string | null): Promise<void>;
    uploadBillImage(file: ExternalBlob): Promise<ExternalBlob>;
}
