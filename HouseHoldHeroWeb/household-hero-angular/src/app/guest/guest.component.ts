import { Component } from '@angular/core';
import { GuestNavbarComponent } from './guest-navbar/guest-navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { GuestHomeContentComponent } from './home-content/guest-home-content.component';
@Component({
  selector: 'app-guest',
  imports: [
    GuestNavbarComponent,
    RouterModule,
    FooterComponent,
    GuestHomeContentComponent,
  ],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.css',
})
export class GuestComponent {}
