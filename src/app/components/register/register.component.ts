import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  errorMessage: string = '';
  nameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  
  constructor(private authService: AuthService, private router: Router) {}

  validateName(name: string): boolean {
    // Only allow letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  }

  validateEmail(email: string): boolean {
    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): boolean {
    // Password must be at least 8 characters
    return password.length >= 8;
  }

  register() {
    console.log("Register button clicked!", this.user);
    
    // Reset error messages
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';
    
    // Validate all fields
    let isValid = true;
    
    // Check if all fields are filled
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.errorMessage = 'All fields are required';
      console.error(this.errorMessage);
      return;
    }
    
    // Name validation
    if (!this.validateName(this.user.name)) {
      this.nameError = 'Name should only contain letters and spaces';
      isValid = false;
    }
    
    // Email validation
    if (!this.validateEmail(this.user.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!this.validatePassword(this.user.password)) {
      this.passwordError = 'Password must be at least 8 characters long';
      isValid = false;
    }
    
    // Password match validation
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }

    // Proceed with registration if all validations pass
    this.authService.register({
      name: this.user.name,
      email: this.user.email,
      password: this.user.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = 'Registration failed';
        console.error('Error during registration', error);
      }
    });
  }
}