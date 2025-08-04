import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  isSubmitting: boolean = false;
  isSubmitted: boolean = false;
  errorMessage: string = '';

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSubmitted = true;

      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };
    }, 1500);
  }
}
