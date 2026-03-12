import { Timestamp } from 'firebase/firestore';

export interface SaleModel {
  id?: string;
  title: string;
  category: string;
  amount: number;
  dateReceived: Date;
}

/**
 * Converts Firestore data to a SaleModel.
 */
export const saleFromFirestore = (documentId: string, data: Record<string, any>): SaleModel => {
  const title = data.title || "";
  const category = data.category || "Sales";
  
  // Flexible amount parsing
  const amount = data.amount ?? data.total ?? data.price ?? data.value ?? 0;
  
  // Flexible date parsing
  let dateReceived: Date;
  const rawDate = data.dateReceived ?? data.date ?? data.timestamp ?? data.created_at ?? data.date_received;
  if (rawDate instanceof Timestamp) {
    dateReceived = rawDate.toDate();
  } else if (rawDate?.seconds) {
    dateReceived = new Date(rawDate.seconds * 1000);
  } else if (typeof rawDate === 'string') {
    dateReceived = new Date(rawDate);
  } else {
    dateReceived = new Date();
  }

  return {
    id: documentId,
    title,
    category,
    amount: Number(amount),
    dateReceived,
  };
};

/**
 * Converts a SaleModel to a Firestore-compatible object.
 */
export const saleToFirestore = (sale: SaleModel): Record<string, any> => {
  return {
    title: sale.title,
    category: sale.category,
    amount: sale.amount,
    dateReceived: Timestamp.fromDate(sale.dateReceived),
  };
};
