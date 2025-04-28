// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GuestHomeContentComponent } from './guest/home-content/guest-home-content.component';
import { LoginComponent } from './guest/login/login.component';
import { RegistrationComponent } from './guest/registration/registration.component';
import { OtpVerificationComponent } from './guest/otp-verification/otp-verification.component';
import { UserComponent } from './user/user.component';
import { IndexComponent } from './user/index/index.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'guest/home-content', pathMatch: 'full' },
  { path: 'guest/home-content', component: GuestHomeContentComponent },
  { path: 'guest/login', component: LoginComponent },
  { path: 'guest/registration', component: RegistrationComponent },
  { path: 'guest/otp-verification', component: OtpVerificationComponent },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'index', component: IndexComponent },
      // Add other user routes as needed
    ],
  },
  // Catch-all redirect to home
  { path: '**', redirectTo: 'guest/home-content' },
];
