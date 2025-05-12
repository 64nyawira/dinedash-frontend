import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../service/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  phoneNumberControl = new FormControl('', [Validators.required, Validators.pattern(/^\d{10,12}$/)]);
  amountControl = new FormControl('', [Validators.required, Validators.min(5), Validators.max(150000)]);
  
  showConfirmationModal = false;
  isProcessing = false;
  
  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // No need for initForm since we're using individual FormControls
  }

  get formValid(): boolean {
    return this.phoneNumberControl.valid && this.amountControl.valid;
  }

  get formattedAmount(): string {
    const amount = this.amountControl.value;
    return amount ? Number(amount).toLocaleString() : '0';
  }

  get formattedPhoneNumber(): string {
    const phoneNumber = this.phoneNumberControl.value;
    if (!phoneNumber) return '';
    
    // Format: +XX XXX XXX XXX
    if (phoneNumber.length >= 10) {
      return `+${phoneNumber.substring(0, 2)} ${phoneNumber.substring(2, 5)} ${phoneNumber.substring(5, 8)} ${phoneNumber.substring(8)}`;
    }
    return phoneNumber;
  }

  openConfirmation(): void {
    if (this.formValid) {
      this.showConfirmationModal = true;
    } else {
      this.phoneNumberControl.markAsTouched();
      this.amountControl.markAsTouched();
    }
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  processPayment(): void {
    if (this.formValid) {
      this.isProcessing = true;
      
      // Ensure we have non-null values
      const phoneNumber = this.phoneNumberControl.value || '';
      const amount = this.amountControl.value ? Number(this.amountControl.value) : 0;
      
      // Ensure types match what the service expects
      const paymentData = {
        userId: 'current-user-id',
        orderId: `order-${new Date().getTime()}`,
        phoneNumber,
        amount
      };
      
      this.paymentService.initiatePayment(paymentData).subscribe({
        next: (response) => {
          this.isProcessing = false;
          this.showConfirmationModal = false;
          this.snackBar.open('Payment initiated successfully', 'Close', {
            duration: 5000,
            panelClass: 'success-snackbar'
          });
          this.resetForm();
        },
        error: (error) => {
          this.isProcessing = false;
          this.snackBar.open('Payment failed: ' + (error.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  resetForm(): void {
    this.phoneNumberControl.reset();
    this.amountControl.reset();
  }
}