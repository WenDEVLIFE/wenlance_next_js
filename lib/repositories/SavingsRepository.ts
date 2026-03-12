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
import { SavingsModel, savingsFromFirestore, savingsToFirestore } from '../../app/model/SavingsModel';
import { SavingsUtilizationModel, savingsUtilizationFromFirestore, savingsUtilizationToFirestore } from '../../app/model/SavingsUtilizationModel';
import { onAuthStateChanged } from 'firebase/auth';

class SavingsRepository {
  private getSavingsCollection(userId: string) {
    return collection(db, 'users', userId, 'savings');
  }

  private getUtilizationsCollection(userId: string) {
    return collection(db, 'users', userId, 'savingsUtilizations');
  }

  /**
   * Listens to real-time updates for savings.
   */
  listenToSavings(callback: (savings: SavingsModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getSavingsCollection(user.uid), orderBy('createdAt', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const savings = snapshot.docs.map(doc => savingsFromFirestore(doc.id, doc.data()));
          callback(savings);
        }, (error) => {
          console.error("Error listening to savings:", error);
        });
      } else {
        callback([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }

  /**
   * Listens to real-time updates for savings utilizations.
   */
  listenToUtilizations(callback: (utilizations: SavingsUtilizationModel[]) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const q = query(this.getUtilizationsCollection(user.uid), orderBy('date', 'desc'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const utilizations = snapshot.docs.map(doc => savingsUtilizationFromFirestore(doc.id, doc.data()));
          callback(utilizations);
        }, (error) => {
          console.error("Error listening to utilizations:", error);
        });
      } else {
        callback([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }

  async addSavings(savings: SavingsModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const data = {
      ...savingsToFirestore(savings),
      createdAt: serverTimestamp() // Overriding with server timestamp for consistency
    };

    const docRef = await addDoc(this.getSavingsCollection(user.uid), data);
    return docRef.id;
  }

  async updateSavings(savings: SavingsModel): Promise<void> {
    const user = auth.currentUser;
    if (!user || !savings.id) throw new Error("Invalid request");

    const docRef = doc(db, 'users', user.uid, 'savings', savings.id);
    const data = {
      ...savingsToFirestore(savings),
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, data);
  }

  async deleteSavings(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'savings', id);
    await deleteDoc(docRef);
  }

  async addUtilization(utilization: SavingsUtilizationModel): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(this.getUtilizationsCollection(user.uid), savingsUtilizationToFirestore(utilization));
    return docRef.id;
  }

  async deleteUtilization(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, 'users', user.uid, 'savingsUtilizations', id);
    await deleteDoc(docRef);
  }
}

export const savingsRepository = new SavingsRepository();
export default savingsRepository;
