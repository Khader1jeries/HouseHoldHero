// src/app/guards/auth.guard.ts - Updated to handle URL-based family ID
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.userService.getCurrentUser();

    if (!user) {
      // User is not logged in, redirect to login
      this.router.navigate(['/guest/login']);
      return false;
    }

    // Check if we have family ID in URL or user data
    const familyIdFromUrl = route.queryParams['familyId'];
    const userFamilyId = user.email;

    if (familyIdFromUrl) {
      // If family ID is in URL but different from user data, update user data
      if (userFamilyId !== familyIdFromUrl) {
        this.userService.setCurrentUser({
          ...user,
          email: familyIdFromUrl,
        });
      }
      return true;
    } else if (userFamilyId) {
      // If user has family ID but URL doesn't, redirect with family ID in URL
      const urlTree = this.router.createUrlTree([state.url], {
        queryParams: { familyId: userFamilyId },
        queryParamsHandling: 'merge',
      });
      this.router.navigateByUrl(urlTree);
      return false;
    }

    // User is logged in but no family context - allow access but may show family setup
    return true;
  }
}
