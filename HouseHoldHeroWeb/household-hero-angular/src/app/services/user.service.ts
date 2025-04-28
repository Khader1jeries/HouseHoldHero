// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, from, switchMap, of } from 'rxjs';

export interface User {
  uid?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  role?: 'admin' | 'user';
  familyId?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  // Register a new user
  registerUser(user: User, password: string): Observable<any> {
    return from(
      this.afAuth.createUserWithEmailAndPassword(user.email, password)
    ).pipe(
      switchMap((credentials) => {
        if (credentials.user) {
          // Add user to Firestore with UID from authentication
          const userData: User = {
            uid: credentials.user.uid,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            role: 'user', // Default role
            createdAt: new Date(),
          };

          return from(
            this.firestore
              .collection('users')
              .doc(credentials.user.uid)
              .set(userData)
          );
        }
        return of(null);
      })
    );
  }

  // Login user
  loginUser(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  // Logout user
  logoutUser(): Observable<void> {
    return from(
      this.afAuth.signOut().then(() => {
        this.router.navigate(['/guest/login']);
      })
    );
  }

  // Get current user
  getCurrentUser(): Observable<firebase.default.User | null> {
    return this.afAuth.authState;
  }

  // Send verification email after registration
  sendVerificationEmail(): Observable<void | null> {
    return from(
      this.afAuth.currentUser.then((user) => {
        if (user) {
          return user.sendEmailVerification();
        }
        return null;
      })
    );
  }

  // Reset password
  resetPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }

  // Get user data from Firestore
  getUserData(uid: string): Observable<User | undefined> {
    return this.firestore.collection('users').doc<User>(uid).valueChanges();
  }

  // Update user profile
  updateUserProfile(user: Partial<User>): Observable<void | null> {
    return from(
      this.afAuth.currentUser.then((currentUser) => {
        if (currentUser && user.uid) {
          return this.firestore.collection('users').doc(user.uid).update(user);
        }
        return null;
      })
    );
  }

  // Create a new family and assign the user as admin
  createFamily(familyName: string, uid: string): Observable<any> {
    const familyData = {
      name: familyName,
      admin: uid,
      members: [uid],
      createdAt: new Date(),
    };

    return from(this.firestore.collection('families').add(familyData)).pipe(
      switchMap((docRef) => {
        // Update user with familyId and role
        return this.firestore.collection('users').doc(uid).update({
          familyId: docRef.id,
          role: 'admin',
        });
      })
    );
  }
}
