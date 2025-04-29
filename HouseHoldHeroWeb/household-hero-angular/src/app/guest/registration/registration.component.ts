import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  imports: [FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  // User data structure
  user = {
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+972', // Default country code
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get email from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.user.email = params['email'];
      }
    });
  }

  onSubmit() {
    // Basic validation
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Store user information (would normally be sent to backend)
    localStorage.setItem('registeredUser', JSON.stringify(this.user));
    
    // Navigate to OTP verification page
    this.router.navigate(['/guest/otp-verification'], { 
      queryParams: { email: this.user.email } 
    });
  }
}