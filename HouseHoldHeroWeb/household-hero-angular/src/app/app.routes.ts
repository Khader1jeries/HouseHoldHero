// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GuestComponent } from './guest/guest.component';
import { GuestHomeContentComponent } from './guest/home-content/guest-home-content.component';
import { LoginComponent } from './guest/login/login.component';
import { RegistrationComponent } from './guest/registration/registration.component';
import { OtpVerificationComponent } from './guest/otp-verification/otp-verification.component';
import { UserComponent } from './user/user.component';
import { ForgotPasswordComponent } from './guest/forget-password/forget-password.component';
import { ResetPasswordComponent } from './guest/reset-password/reset-password.component';
import { IndexComponent } from './user/index/index.component';
import { MembersComponent } from './user/members/members.component';
import { AddMemberComponent } from './user/members/add-member/add-member.component';
import { TasksComponent } from './user/tasks/tasks.component';
import { AddTaskComponent } from './user/tasks/add-task/add-task.component';
import { SupportComponent } from './user/support/support.component';
import { AnalyticsComponent } from './user/analytics/analytics.component';
import { ReportsComponent } from './user/reports/reports.component';
import { SettingsComponent } from './user/settings/settings.component';
import { PrivacyPolicyComponent } from './guest/privacy-policy/privacy-policy.component';
import { TermsServiceComponent } from './guest/terms-of-service/terms-of-service.component';
import { ContactComponent } from './guest/contact/contact.component';
import { AuthGuard } from './guards/auth.guard';

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
      { path: 'guest/privacy-policy', component: PrivacyPolicyComponent },
      { path: 'guest/terms-of-service', component: TermsServiceComponent },
      { path: 'guest/contact', component: ContactComponent },
    ],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: IndexComponent },
      { path: 'members', component: MembersComponent },
      { path: 'members/add', component: AddMemberComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'tasks/add', component: AddTaskComponent },
      { path: 'support', component: SupportComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  // Redirect any unknown paths to home
  { path: '**', redirectTo: 'guest/home' },
];
