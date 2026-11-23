import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../utils/firebase';

/**
 * Performance preferences stored per user.
 */
export interface PerformanceSettings {
  monthlyIncomeTarget: number;
  updatedAt?: Date;
}

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
  monthlyIncomeTarget: 0,
};

/**
 * Reads settings defensively: anything that is not a stored number falls back to 0.
 */
const settingsFromFirestore = (data: Record<string, unknown>): PerformanceSettings => {
  const target = data.monthlyIncomeTarget;
  const updatedAt = data.updatedAt;

  return {
    monthlyIncomeTarget: typeof target === 'number' ? target : 0,
    ...(updatedAt instanceof Date ? { updatedAt } : {}),
  };
};

class PerformanceRepository {
  private getSettingsRef(userId: string) {
    return doc(db, 'users', userId, 'settings', 'performance');
  }

  /**
   * Listens to real-time updates for the performance settings document.
   * Emits default settings when the user is signed out, the document is
   * missing, or the snapshot listener fails.
   * @param callback Function called with the current settings.
   * @returns Unsubscribe function to stop listening.
   */
  listenToSettings(callback: (settings: PerformanceSettings) => void): () => void {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        callback({ ...DEFAULT_PERFORMANCE_SETTINGS });
        return;
      }

      unsubscribeSnapshot = onSnapshot(
        this.getSettingsRef(user.uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            callback({ ...DEFAULT_PERFORMANCE_SETTINGS });
            return;
          }

          callback(settingsFromFirestore(snapshot.data()));
        },
        (error) => {
          console.error('Error listening to performance settings:', error);
          callback({ ...DEFAULT_PERFORMANCE_SETTINGS });
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }

  /**
   * Persists the monthly income target for the signed-in user.
   */
  async saveSettings(settings: PerformanceSettings): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await setDoc(
      this.getSettingsRef(user.uid),
      {
        monthlyIncomeTarget: settings.monthlyIncomeTarget,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export const performanceRepository = new PerformanceRepository();
export default performanceRepository;
