import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  imports: [FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  // This will be used to store user input (if needed)
  user = {
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '',
  };
}
