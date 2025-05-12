import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-forgot-pass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-pass.component.html',
  styleUrl: './forgot-pass.component.css'
})
export class ForgotPassComponent {
  formData = { email: '' };
  errorMessage: string = '';
  successMessage: string = '';  // ✅ Success message variable

  constructor(private authService: AuthService, private router: Router) {}

  forgotPassword(form: NgForm) {
    console.log("Form Submitted:", form.value);
    console.log("Email before sending request:", this.formData.email);

    if (!this.formData.email || this.formData.email.trim() === '') {
      this.errorMessage = 'Email is required';
      console.error("Error:", this.errorMessage);
      return;
    }

    this.authService.forgotPassword(this.formData.email.trim()).subscribe({
      next: () => {
        this.successMessage = 'A reset code has been sent to your email.'; // ✅ Show message
        this.errorMessage = ''; // ✅ Clear any previous error
        
        setTimeout(() => {
          this.successMessage = ''; // ✅ Hide message after 3 seconds
          this.router.navigate(['/verify-code'], { queryParams: { email: this.formData.email } });
        }, 3000); // ✅ Redirect after 3 seconds
      },
      error: (error) => {
        this.errorMessage = 'Failed to send reset code';
        this.successMessage = ''; // ✅ Ensure success message is cleared if there's an error
        console.error('Error:', error);
      }
    });
  }
}
