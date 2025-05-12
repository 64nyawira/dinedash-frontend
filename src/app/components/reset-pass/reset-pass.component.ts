import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-pass',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.css'
})
export class ResetPassComponent {
  formData = { password: '', confirmPassword: '' };  // ✅ Use formData instead of individual variables
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  resetPassword(form: NgForm) {  // ✅ Get form values directly
    console.log("Form Submitted:", form.value); // ✅ Debugging log
    console.log("Password entered:", this.formData.password);
    console.log("Confirm Password entered:", this.formData.confirmPassword);

    if (!this.formData.password || !this.formData.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.resetPassword({ email: this.email, newPassword: this.formData.password }).subscribe({
      next: () => {
        this.successMessage = 'Password reset successful! Redirecting...';
        this.errorMessage = '';

        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to reset password';
        this.successMessage = '';
        console.error('Error:', error);
      }
    });
  }
}
