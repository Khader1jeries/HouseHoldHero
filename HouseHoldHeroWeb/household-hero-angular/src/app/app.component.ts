import { Component } from '@angular/core';

import { GuestComponent } from './guest/guest.component';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
@Component({
  selector: 'app-root',
  imports: [GuestComponent, RouterModule, UserComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'household-hero-angular';
}
