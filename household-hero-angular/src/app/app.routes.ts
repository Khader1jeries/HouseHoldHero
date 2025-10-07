// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GuestComponent } from './guest/guest.component';
import { GuestHomeContentComponent } from './guest/home-content/guest-home-content.component';
import { LoginComponent } from './guest/login/login.component';
import { RegistrationComponent } from './guest/registration/registration.component';
import { UserComponent } from './user/user.component';
import { ForgotPasswordComponent } from './guest/forget-password/forget-password.component';
import { IndexComponent } from './user/index/index.component';
import { MembersComponent } from './user/members/members.component';
import { AddMemberComponent } from './user/members/add-member/add-member.component';
import { TasksComponent } from './user/tasks/tasks.component';
import { AddTaskComponent } from './user/tasks/add-task/add-task.component';
import { SupportComponent } from './user/support/support.component';
import { AnalyticsComponent } from './user/analytics/analytics.component';
import { MoveTaskComponent } from './user/tasks/move-task/move-task.component';
import { SettingsComponent } from './user/settings/settings.component';
import { PrivacyPolicyComponent } from './guest/privacy-policy/privacy-policy.component';
import { TermsServiceComponent } from './guest/terms-of-service/terms-of-service.component';

import { AuthGuard } from './guards/auth.guard';

// Import new components
import { LeaderboardComponent } from './user/members/leaderboard/leaderboard.component';
import { MemberDetailsComponent } from './user/members/member-details/member-details.component';

import { TaskDetailsComponent } from './user/tasks/task-details/task-details.component';
import { VotesComponent } from './user/tasks/votes/votes.component';

export const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      { path: '', redirectTo: 'guest/home', pathMatch: 'full' },
      { path: 'guest/home', component: GuestHomeContentComponent },
      { path: 'guest/login', component: LoginComponent },
      { path: 'guest/registration', component: RegistrationComponent },
      { path: 'guest/forgot-password', component: ForgotPasswordComponent },

      { path: 'guest/privacy-policy', component: PrivacyPolicyComponent },
      { path: 'guest/terms-of-service', component: TermsServiceComponent },
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
      // New member routes
      { path: 'members/leaderboard', component: LeaderboardComponent },
      { path: 'members/details/:id', component: MemberDetailsComponent },

      { path: 'tasks', component: TasksComponent },
      { path: 'tasks/add', component: AddTaskComponent },
      // New task routes
      { path: 'tasks/details/:id', component: TaskDetailsComponent },
      { path: 'tasks/votes/:id', component: VotesComponent },
      { path: 'tasks/moveTask/:id', component: MoveTaskComponent },
      { path: 'support', component: SupportComponent },
      { path: 'analytics', component: AnalyticsComponent },

      { path: 'settings', component: SettingsComponent },
    ],
  },
  // Redirect any unknown paths to home
  { path: '**', redirectTo: 'guest/home' },
];
