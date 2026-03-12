import { Timestamp } from 'firebase/firestore';

export interface ExpenseModel {
  id?: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
}

/**
 * Converts Firestore data to an ExpenseModel.
 */
export const expenseFromFirestore = (documentId: string, data: Record<string, any>): ExpenseModel => {
  const title = data.title || "";
  const category = data.category || "Other";
  
  // Flexible amount parsing
  const amount = data.amount ?? data.total ?? data.price ?? data.value ?? 0;
  
  // Flexible date parsing
  let date: Date;
  const rawDate = data.date ?? data.timestamp ?? data.created_at ?? data.date_received;
  if (rawDate instanceof Timestamp) {
    date = rawDate.toDate();
  } else if (rawDate?.seconds) {
    date = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    date = new Date(rawDate);
  } else {
    date = new Date();
  }

  const description = data.description || "";

  return {
    id: documentId,
    title,
    category,
    amount: Number(amount),
    date,
    description,
  };
};

/**
 * Converts an ExpenseModel to a Firestore-compatible object.
 */
export const expenseToFirestore = (expense: ExpenseModel): Record<string, any> => {
  return {
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    date: Timestamp.fromDate(expense.date),
    description: expense.description,
  };
};
