// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { UserService } from '../services/user.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getCurrentUser().pipe(
    take(1),
    map((user) => {
      const isLoggedIn = !!user;

      if (!isLoggedIn) {
        router.navigate(['/guest/login']);
        return false;
      }

      return true;
    })
  );
};
