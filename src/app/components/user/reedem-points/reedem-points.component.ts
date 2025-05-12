// redeem-points.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { LoyaltyService } from '../../../service/loyalty.service';
import { AuthService } from '../../../service/auth.service';
import { UserNavbarComponent } from "../user-navbar/user-navbar.component";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
}

@Component({
  selector: 'app-redeem-points',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule,
    UserNavbarComponent
],
  templateUrl: './reedem-points.component.html',
  styleUrl: './reedem-points.component.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggeredFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ReedemPointsComponent implements OnInit {
  rewards: Reward[] = [];
  filteredRewards: Reward[] = [];
  userPoints: number = 0;
  searchTerm: string = '';
  loading: boolean = true;
  loadingPoints: boolean = true;
  showConfirmDialog: boolean = false;
  selectedReward: Reward | null = null;
  filterMode: 'all' | 'available' | 'unavailable' = 'all';
  sortBy: 'default' | 'pointsLow' | 'pointsHigh' = 'default';
  redeemInProgress: boolean = false;
  
  // We'll get the userId dynamically from AuthService
  userId: string = '';
  
  constructor(
    private loyaltyService: LoyaltyService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the current user ID from the AuthService
    this.userId = this.authService.getCurrentUserId();
    
    // Check if we have a valid user ID
    if (!this.userId) {
      this.showNotification('User not authenticated. Please log in.', 'error');
      // You might want to redirect to login page here
      return;
    }
    
    this.loadUserPoints();
    this.loadRewards();
  }

  loadUserPoints(): void {
    this.loadingPoints = true;
    this.loyaltyService.getUserPoints(this.userId).subscribe({
      next: (data: any) => {
        this.userPoints = data.points || 0;
        this.loadingPoints = false;
      },
      error: (error) => {
        console.error('Error loading user points:', error);
        this.loadingPoints = false;
        this.showNotification('Failed to load your loyalty points', 'error');
      }
    });
  }

  loadRewards(): void {
    this.loading = true;
    this.loyaltyService.getAllRewards().subscribe({
      next: (data: any) => {
        this.rewards = data;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.loading = false;
        this.showNotification('Failed to load available rewards', 'error');
      }
    });
  }

  searchRewards(): void {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    // First apply search filter
    let results = this.rewards;
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      results = results.filter(reward => 
        reward.name.toLowerCase().includes(term) || 
        reward.description.toLowerCase().includes(term)
      );
    }
    
    // Then apply availability filter
    if (this.filterMode === 'available') {
      results = results.filter(reward => reward.pointsCost <= this.userPoints);
    } else if (this.filterMode === 'unavailable') {
      results = results.filter(reward => reward.pointsCost > this.userPoints);
    }
    
    // Then apply sorting
    if (this.sortBy === 'pointsLow') {
      results = [...results].sort((a, b) => a.pointsCost - b.pointsCost);
    } else if (this.sortBy === 'pointsHigh') {
      results = [...results].sort((a, b) => b.pointsCost - a.pointsCost);
    }
    
    this.filteredRewards = results;
  }

  setFilterMode(mode: 'all' | 'available' | 'unavailable'): void {
    this.filterMode = mode;
    this.applyFiltersAndSort();
  }
  
  setSortBy(sort: 'default' | 'pointsLow' | 'pointsHigh'): void {
    this.sortBy = sort;
    this.applyFiltersAndSort();
  }

  openRedeemConfirm(reward: Reward): void {
    this.selectedReward = reward;
    this.showConfirmDialog = true;
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.selectedReward = null;
  }

  redeemReward(): void {
    if (!this.selectedReward) return;
    
    this.redeemInProgress = true;
    
    this.loyaltyService.redeemReward(this.userId, this.selectedReward.id).subscribe({
      next: (response) => {
        this.redeemInProgress = false;
        this.closeConfirmDialog();
        this.loadUserPoints(); // Refresh points balance
        this.showNotification(`Successfully redeemed: ${this.selectedReward?.name}`, 'success');
      },
      error: (error) => {
        this.redeemInProgress = false;
        console.error('Error redeeming reward:', error);
        
        let errorMessage = 'Failed to redeem reward';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  canRedeem(reward: Reward): boolean {
    return this.userPoints >= reward.pointsCost;
  }

  pointsNeeded(reward: Reward): number {
    return Math.max(0, reward.pointsCost - this.userPoints);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}