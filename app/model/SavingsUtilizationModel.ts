import { Timestamp } from 'firebase/firestore';

export interface SavingsUtilizationModel {
  id?: string;
  title: string;
  amount: number;
  date: Date;
  savingsId?: string; // Optional reference to a specific savings goal if applicable
}

/**
 * Converts Firestore data to a SavingsUtilizationModel.
 */
export const savingsUtilizationFromFirestore = (documentId: string, data: Record<string, any>): SavingsUtilizationModel => {
  const title = data.title || "";
  const amount = data.amount ?? 0;
  
  let date: Date;
  const rawDate = data.date ?? data.timestamp ?? data.created_at;
  if (rawDate instanceof Timestamp) {
    date = rawDate.toDate();
  } else if (rawDate?.seconds) {
    date = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    date = new Date(rawDate);
  } else {
    date = new Date();
  }

  return {
    id: documentId,
    title,
    amount: Number(amount),
    date,
    savingsId: data.savingsId,
  };
};

/**
 * Converts a SavingsUtilizationModel to a Firestore-compatible object.
 */
export const savingsUtilizationToFirestore = (utilization: SavingsUtilizationModel): Record<string, any> => {
  return {
    title: utilization.title,
    amount: utilization.amount,
    date: Timestamp.fromDate(utilization.date),
    savingsId: utilization.savingsId || null,
  };
};
