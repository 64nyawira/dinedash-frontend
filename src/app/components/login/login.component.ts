import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful', response);

        // Store authentication details
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userRole', response.user.role);

        // Navigate users based on their role and ID
        if (this.email === 'charitynyawirairungu@gmail.com') {
          this.router.navigate(['/admin-dash']);
        } else if (response.user.role === 'client') {
          this.router.navigate([`/manager/${response.user.id}`]);
        } else if (response.user.role === 'customer') {
          this.router.navigate([`/user-dash/${response.user.id}`]); // ✅ Navigate using User ID
        } else {
          this.errorMessage = 'Invalid role assigned. Please contact support.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Invalid email or password';
        console.error('Login failed', error);
      }
    });
  }
}
