import { auth } from '@/lib/utils/firebase';
import { signInWithEmailAndPassword, User, signOut } from 'firebase/auth';
import { SessionUtils } from '@/lib/utils/SessionUtils';

/**
 * Repository interface for Authentication logic.
 * Translated from Swift LoginRepository.
 */
export interface AuthRepository {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}

/**
 * Concrete implementation of the Auth Repository using Firebase.
 */
export class FirebaseAuthRepository implements AuthRepository {
  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Save session locally
      await SessionUtils.saveSession(result.user);

      return result.user;
    } catch (error: any) {
      console.error('Login error in repository:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      SessionUtils.clearSession();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user from auth state
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}

// Export a singleton instance
export const authRepository = new FirebaseAuthRepository();
