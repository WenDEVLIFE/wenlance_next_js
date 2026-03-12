import { Timestamp } from 'firebase/firestore';

export interface SavingsModel {
  id?: string;
  title: string;
  category: string;
  amount: number;
  createdAt: Date;
}

/**
 * Converts Firestore data to a SavingsModel.
 */
export const savingsFromFirestore = (documentId: string, data: Record<string, any>): SavingsModel => {
  const title = data.title || "";
  const category = data.category || "General";
  const amount = data.amount ?? 0;
  
  let createdAt: Date;
  const rawDate = data.createdAt ?? data.timestamp ?? data.created_at;
  if (rawDate instanceof Timestamp) {
    createdAt = rawDate.toDate();
  } else if (rawDate?.seconds) {
    createdAt = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    createdAt = new Date(rawDate);
  } else {
    createdAt = new Date();
  }

  return {
    id: documentId,
    title,
    category,
    amount: Number(amount),
    createdAt,
  };
};

/**
 * Converts a SavingsModel to a Firestore-compatible object.
 */
export const savingsToFirestore = (savings: SavingsModel): Record<string, any> => {
  return {
    title: savings.title,
    category: savings.category,
    amount: savings.amount,
    createdAt: Timestamp.fromDate(savings.createdAt),
  };
};
