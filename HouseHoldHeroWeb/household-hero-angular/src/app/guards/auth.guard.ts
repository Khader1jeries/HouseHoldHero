// src/app/guards/auth.guard.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): Observable<boolean> {
    // During SSR, always allow navigation (authentication will be checked client-side)
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }

    // On the client, check if user is logged in
    if (this.userService.isLoggedIn()) {
      return of(true);
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/guest/login']);
    return of(false);
  }
}
