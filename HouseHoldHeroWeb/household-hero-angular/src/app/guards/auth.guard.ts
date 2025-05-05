// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    // TEMPORARY: Always return true to bypass authentication
    return of(true);

    // Original code (commented out)
    /*
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        this.router.navigate(['/guest/login']);
        return of(false);
      }
      
      return of(true);
    }
    
    return of(true);
    */
  }
}
