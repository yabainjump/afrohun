import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  /**
   * Observe the authentication state of the user.
   * @returns Observable of the authenticated user or null.
   */
  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  /**
   * Log in a user with email and password.
   * @param email - User's email.
   * @param password - User's password.
   * @returns A promise resolving the login result.
   */
  login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password).catch((error) => {
      console.error('Login failed:', error);
      throw error; // Re-throw the error to handle it in the calling component
    });
  }

  /**
   * Register a new user and save additional user data to Firestore.
   * @param email - User's email.
   * @param password - User's password.
   * @param userData - Additional user data to store in Firestore.
   * @returns A promise resolving when the user is created and data is saved.
   */
  register(email: string, password: string, userData: any): Promise<void> {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user?.uid;
        if (userId) {
          return this.firestore.collection('users').doc(userId).set({
            ...userData,
            photoURL: userData.photoURL || 'assets/default-profile.png', // Image par défaut
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          throw new Error('User ID not available.');
        }
      })
      .catch((error) => {
        console.error('Registration failed:', error);
        throw error; // Re-throw the error to handle it in the calling component
      });
  }

  /**
   * Send a password reset email to the user.
   * @param email - User's email.
   * @returns A promise resolving when the email is sent.
   */
  resetPassword(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email).catch((error) => {
      console.error('Password reset failed:', error);
      throw error; // Re-throw the error to handle it in the calling component
    });
  }

  /**
   * Log out the currently authenticated user.
   * @returns A promise resolving when the user is logged out.
   */
  logout(): Promise<void> {
    return this.afAuth.signOut().catch((error) => {
      console.error('Logout failed:', error);
      throw error; // Re-throw the error to handle it in the calling component
    });
  }
}
