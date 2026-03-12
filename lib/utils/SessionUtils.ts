import { User } from 'firebase/auth';

/**
 * Session utility class for managing user sessions in the browser.
 * Translated from Flutter SessionUtils.
 */
export class SessionUtils {
  private static readonly KEY_USER_EMAIL = 'user_email';
  private static readonly KEY_USER_ID = 'user_id';
  private static readonly KEY_USER_TOKEN = 'user_token';
  private static readonly KEY_IS_LOGGED_IN = 'is_logged_in';
  private static readonly KEY_USER_DATA = 'user_data';

  /**
   * Save user session to localStorage
   */
  static async saveSession(user: User): Promise<void> {
    try {
      localStorage.setItem(this.KEY_USER_EMAIL, user.email || '');
      localStorage.setItem(this.KEY_USER_ID, user.uid);
      localStorage.setItem(this.KEY_IS_LOGGED_IN, 'true');

      const token = await user.getIdToken();
      localStorage.setItem(this.KEY_USER_TOKEN, token);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      };
      localStorage.setItem(this.KEY_USER_DATA, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save session:', e);
      throw new Error('Failed to save session');
    }
  }

  /**
   * Get saved user email
   */
  static getUserEmail(): string | null {
    return localStorage.getItem(this.KEY_USER_EMAIL);
  }

  /**
   * Get saved user ID
   */
  static getUserId(): string | null {
    return localStorage.getItem(this.KEY_USER_ID);
  }

  /**
   * Get saved user token
   */
  static getUserToken(): string | null {
    return localStorage.getItem(this.KEY_USER_TOKEN);
  }

  /**
   * Get saved user data
   */
  static getUserData(): any | null {
    const userData = localStorage.getItem(this.KEY_USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return localStorage.getItem(this.KEY_IS_LOGGED_IN) === 'true';
  }

  /**
   * Clear user session
   */
  static clearSession(): void {
    localStorage.removeItem(this.KEY_USER_EMAIL);
    localStorage.removeItem(this.KEY_USER_ID);
    localStorage.removeItem(this.KEY_USER_TOKEN);
    localStorage.removeItem(this.KEY_IS_LOGGED_IN);
    localStorage.removeItem(this.KEY_USER_DATA);
    
    // Also clear cookies if using them for SSR
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}
