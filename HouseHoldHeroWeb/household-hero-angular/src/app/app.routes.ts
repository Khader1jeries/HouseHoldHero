import { Routes } from '@angular/router';
import { GuestComponent } from './guest/guest.component';
import { GuestHomeContentComponent } from './guest/home-content/guest-home-content.component';
import { LoginComponent } from './guest/login/login.component';
import { RegistrationComponent } from './guest/registration/registration.component';
import { OtpVerificationComponent } from './guest/otp-verification/otp-verification.component';
import { ForgotPasswordComponent } from './guest/forget-password/forget-password.component';
import { ResetPasswordComponent } from './guest/reset-password/reset-password.component';
import { UserComponent } from './user/user.component';
import { ContactComponent } from './guest/contact/contact.component';
import { PrivacyPolicyComponent } from './guest/privacy-policy/privacy-policy.component';
import { TermsServiceComponent } from './guest/terms-of-service/terms-of-service.component';

export const routes: Routes = [
  { 
    path: '', 
    component: GuestComponent,
    children: [
      { path: '', redirectTo: 'guest/home', pathMatch: 'full' },
      { path: 'guest/home', component: GuestHomeContentComponent },
      { path: 'guest/login', component: LoginComponent },
      { path: 'guest/registration', component: RegistrationComponent },
      { path: 'guest/otp-verification', component: OtpVerificationComponent },
      { path: 'guest/forgot-password', component: ForgotPasswordComponent },
      { path: 'guest/reset-password', component: ResetPasswordComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'terms-of-service', component: TermsServiceComponent }
    ]
  },
  { 
    path: 'user', 
    component: UserComponent 
    // Add your auth guard here
    // canActivate: [authGuard]
  },
  // Redirect any unknown paths to home
  { path: '**', redirectTo: 'guest/home' }
];