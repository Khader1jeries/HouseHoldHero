import { Routes } from '@angular/router';
import { GuestHomeContentComponent } from './guest/home-content/guest-home-content.component';
import { LoginComponent } from './guest/login/login.component';
import { RegistrationComponent } from './guest/registration/registration.component';
import { OtpVerificationComponent } from './guest/otp-verification/otp-verification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'guest/home-content', pathMatch: 'full' },
  { path: 'guest/home-content', component: GuestHomeContentComponent },
  { path: 'guest/login', component: LoginComponent },
  { path: 'guest/registration', component: RegistrationComponent },
  { path: 'guest/otp-verification', component: OtpVerificationComponent },
];
