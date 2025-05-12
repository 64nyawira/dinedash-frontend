// reward.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoyaltyService } from '../../../service/loyalty.service';
import { AuthService } from '../../../service/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
}

@Component({
  selector: 'app-reward',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
],
  templateUrl: './reward.component.html',
  styleUrl: './reward.component.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class RewardComponent implements OnInit {
  rewards: Reward[] = [];
  filteredRewards: Reward[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  formMode: 'create' | 'edit' = 'create';
  currentRewardId: string | null = null;
  rewardForm: FormGroup;
  
  // Property to store the user ID
  userId: string = '';
  
  constructor(
    private loyaltyService: LoyaltyService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.rewardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      pointsCost: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Get the current user ID from the AuthService
    this.userId = this.authService.getCurrentUserId();
    
    // Check if we have a valid user ID
    if (!this.userId) {
      this.showNotification('User not authenticated. Please log in.', 'error');
      // You might want to redirect to login page here
      return;
    }
    
    this.loadRewards();
  }

  loadRewards(): void {
    this.loading = true;
    this.loyaltyService.getAllRewards().subscribe({
      next: (data: any) => {
        this.rewards = data;
        this.filteredRewards = [...this.rewards];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.loading = false;
        this.showNotification('Failed to load rewards', 'error');
      }
    });
  }

  searchRewards(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRewards = [...this.rewards];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    const isNumeric = !isNaN(Number(term));
    
    this.filteredRewards = this.rewards.filter(reward => {
      const nameMatch = reward.name.toLowerCase().includes(term);
      const pointsMatch = isNumeric && reward.pointsCost === Number(term);
      return nameMatch || pointsMatch;
    });
  }

  openCreateForm(): void {
    this.formMode = 'create';
    this.rewardForm.reset({
      name: '',
      description: '',
      pointsCost: null
    });
    this.showForm = true;
  }

  openEditForm(reward: Reward): void {
    this.formMode = 'edit';
    this.currentRewardId = reward.id;
    this.rewardForm.setValue({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  openDeleteConfirm(id: string): void {
    this.currentRewardId = id;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.currentRewardId = null;
  }

  submitForm(): void {
    if (this.rewardForm.invalid) {
      this.rewardForm.markAllAsTouched();
      return;
    }

    const rewardData = this.rewardForm.value;

    if (this.formMode === 'create') {
      // Pass the current user ID with the reward data
      this.loyaltyService.createReward({...rewardData, userId: this.userId}).subscribe({
        next: () => {
          this.loadRewards();
          this.closeForm();
          this.showNotification('Reward created successfully', 'success');
        },
        error: (error) => {
          console.error('Error creating reward:', error);
          this.showNotification('Failed to create reward', 'error');
        }
      });
    } else {
      if (!this.currentRewardId) return;
      
      // Pass the current user ID with the update
      this.loyaltyService.updateReward(this.currentRewardId, {...rewardData, userId: this.userId}).subscribe({
        next: () => {
          this.loadRewards();
          this.closeForm();
          this.showNotification('Reward updated successfully', 'success');
        },
        error: (error) => {
          console.error('Error updating reward:', error);
          this.showNotification('Failed to update reward', 'error');
        }
      });
    }
  }

  deleteReward(): void {
    if (!this.currentRewardId) return;
    
    // Pass the current user ID with the delete request
    this.loyaltyService.deleteReward(this.currentRewardId).subscribe({
      next: () => {
        this.loadRewards();
        this.closeDeleteConfirm();
        this.showNotification('Reward deleted successfully', 'success');
      },
      error: (error) => {
        console.error('Error deleting reward:', error);
        this.showNotification('Failed to delete reward', 'error');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}