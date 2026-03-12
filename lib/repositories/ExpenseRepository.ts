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
import { ExpenseModel, expenseFromFirestore, expenseToFirestore } from '../../app/model/ExpenseModel';
import { onAuthStateChanged } from 'firebase/auth';

class ExpenseRepository {
  private getCollection(userId: string) {
    return collection(db, 'users', userId, 'expenses');
  }

  /**
   * Listens to real-time updates for expenses.
   * @param callback Function called with the updated list of expenses.
   * @returns Unsubscribe function to stop listening.
   */
  listenToExpenses(callback: (expenses: ExpenseModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getCollection(user.uid), orderBy('date', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const expenses = snapshot.docs.map(doc => expenseFromFirestore(doc.id, doc.data()));
          callback(expenses);
        }, (error) => {
          console.error("Error listening to expenses:", error);
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
   * Adds a new expense to Firestore.
   */
  async addExpense(expense: ExpenseModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const data = {
      ...expenseToFirestore(expense),
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(this.getCollection(user.uid), data);
    return docRef.id;
  }

  /**
   * Updates an existing expense.
   */
  async updateExpense(expense: ExpenseModel): Promise<void> {
    const user = auth.currentUser;
    if (!user || !expense.id) throw new Error("Invalid request");

    const docRef = doc(db, 'users', user.uid, 'expenses', expense.id);
    const data = {
      ...expenseToFirestore(expense),
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, data);
  }

  /**
   * Deletes an expense.
   */
  async deleteExpense(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'expenses', id);
    await deleteDoc(docRef);
  }
}

export const expenseRepository = new ExpenseRepository();
export default expenseRepository;
