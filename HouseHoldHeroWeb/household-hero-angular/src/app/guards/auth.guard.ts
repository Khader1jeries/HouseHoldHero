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

    console.log('🔍 AuthGuard - Current user:', user);

    const emailFromUrl = route.queryParams['email'];

    if (!user) {
      if (emailFromUrl) {
        // No user loaded yet, but email is in the URL — fetch the user
        this.userService.setCurrentUser(emailFromUrl);
        return true; // allow navigation; user will be loaded
      } else {
        // No user and no email — redirect to login
        this.router.navigate(['/guest/login']);
        return false;
      }
    }

    const userEmail = user.email;

    if (emailFromUrl) {
      if (userEmail !== emailFromUrl) {
        // Email in URL is different — re-fetch correct user
        this.userService.setCurrentUser(emailFromUrl);
      }
      return true;
    } else if (userEmail) {
      // Add email to URL for consistency
      const urlTree = this.router.createUrlTree([state.url], {
        queryParams: { email: userEmail },
        queryParamsHandling: 'merge',
      });
      this.router.navigateByUrl(urlTree);
      return false;
    }

    return true; // fallback
  }
}
