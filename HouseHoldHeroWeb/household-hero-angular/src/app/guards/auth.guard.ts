// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(): Observable<boolean> {
    // Check if user is logged in
    if (this.userService.isLoggedIn()) {
      return of(true);
    }
    
    // Not logged in, redirect to login page
    this.router.navigate(['/guest/login']);
    return of(false);
  }
}