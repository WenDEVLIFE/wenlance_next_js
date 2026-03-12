import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { SaleModel, saleFromFirestore, saleToFirestore } from '../../app/model/SaleModel';
import { onAuthStateChanged } from 'firebase/auth';

class SaleRepository {
  private getCollection(userId: string) {
    return collection(db, 'users', userId, 'sales');
  }

  /**
   * Listens to real-time updates for sales.
   * @param callback Function called with the updated list of sales.
   * @returns Unsubscribe function to stop listening.
   */
  listenToSales(callback: (sales: SaleModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getCollection(user.uid), orderBy('dateReceived', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const sales = snapshot.docs.map(doc => saleFromFirestore(doc.id, doc.data()));
          callback(sales);
        }, (error) => {
          console.error("Error listening to sales:", error);
        });
      } else {
        callback([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }

  /**
   * Adds a new sale to Firestore.
   */
  async addSale(sale: SaleModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const data = {
      ...saleToFirestore(sale),
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(this.getCollection(user.uid), data);
    return docRef.id;
  }

  /**
   * Updates an existing sale.
   */
  async updateSale(sale: SaleModel): Promise<void> {
    const user = auth.currentUser;
    if (!user || !sale.id) throw new Error("Invalid request");

    const docRef = doc(db, 'users', user.uid, 'sales', sale.id);
    const data = {
      ...saleToFirestore(sale),
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, data);
  }

  /**
   * Deletes a sale.
   */
  async deleteSale(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'sales', id);
    await deleteDoc(docRef);
  }
}

export const saleRepository = new SaleRepository();
export default saleRepository;
