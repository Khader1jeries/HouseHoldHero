import { Component } from '@angular/core';
import { GuestNavbarComponent } from './guest-navbar/guest-navbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [
    GuestNavbarComponent,
    RouterOutlet,
    FooterComponent,
  ],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.css',
})
export class GuestComponent {}