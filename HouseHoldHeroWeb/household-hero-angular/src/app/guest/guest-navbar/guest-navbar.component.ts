import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-guest-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './guest-navbar.component.html',
  styleUrl: './guest-navbar.component.css',
})
export class GuestNavbarComponent {}