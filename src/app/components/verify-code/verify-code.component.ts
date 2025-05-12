import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent {
  formData = { code: '' };  // ✅ Using formData to store code
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  verifyCode(form: NgForm) {  // ✅ Accepting form reference
    console.log("Form Submitted:", form.value); // ✅ Debugging log
    console.log("Code entered:", this.formData.code); // ✅ Debugging log

    if (!this.formData.code.trim()) {
      this.errorMessage = 'Code is required';
      return;
    }

    this.authService.verifyResetCode({ email: this.email, code: this.formData.code.trim() }).subscribe({
      next: () => {
        this.successMessage = 'Code verified successfully! Redirecting...';
        this.errorMessage = '';

        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/reset-pass'], { queryParams: { email: this.email } });
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Invalid or expired reset code';
        this.successMessage = '';
        console.error('Error:', error);
      }
    });
  }
}
