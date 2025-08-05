import { Component } from '@angular/core';
import { SliderComponent } from './slider/slider.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guest-home-content',
  standalone: true,
  imports: [SliderComponent, FormsModule],
  templateUrl: './guest-home-content.component.html',
  styleUrl: './guest-home-content.component.css',
})
export class GuestHomeContentComponent {
  email: string = '';

  constructor(private router: Router) {}

  navigateToRegistration() {
    this.router.navigate(['/guest/registration']);
  }
}
