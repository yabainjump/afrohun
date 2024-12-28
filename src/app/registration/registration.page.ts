import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage {
  firstName = '';
  lastName = '';
  email = '';
  institution = '';
  country = '';
  phone = '';
  password = '';
  confirmPassword = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(this.password)) {
      alert('Password must contain at least 6 characters, one uppercase letter, and one number.');
      return;
    }

    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      institution: this.institution,
      country: this.country,
      phone: this.phone,
    };

    this.authService
      .register(this.email, this.password, userData)
      .then(() => {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      })
      .catch((err) => alert('Registration failed: ' + err.message));
  }
}
