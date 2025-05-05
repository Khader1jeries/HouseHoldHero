import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if the user is authenticated
    if (localStorage.getItem('isAuthenticated') === 'true') {
      // User is authenticated, allow access
      return true;
    }

    // User is not authenticated, redirect to login
    this.router.navigate(['/guest/login']);
    return false;
  }
}
