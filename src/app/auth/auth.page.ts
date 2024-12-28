import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService
      .login(this.email, this.password)
      .then(() => {
        console.log('Login successful');
        this.router.navigate(['/home']); // Redirige vers la page d'accueil
      })
      .catch((err) => console.error('Login failed:', err));
  }

  register() {
    this.authService
      .register(this.email, this.password, 'New User')
      .then(() => console.log('Registration successful'))
      .catch((err) => console.error('Registration failed:', err));
  }
}
