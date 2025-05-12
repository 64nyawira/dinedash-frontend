import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AuthService } from '../../../service/auth.service';
import { LoyaltyService } from '../../../service/loyalty.service';
import { OrderService } from '../../../service/order.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleMapsModule } from '@angular/google-maps';
import { Subscription } from 'rxjs';
import { Inject } from '@angular/core';
import { UserNavbarComponent } from '../user-navbar/user-navbar.component';

// Image Dialog Component (separate file)
@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule , UserNavbarComponent],
  template: `
    <div class="image-dialog">
      <h2 mat-dialog-title>{{ data.itemName }}</h2>
      <mat-dialog-content>
        <img [src]="data.imageUrl" [alt]="data.itemName" class="full-width-image">
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="true">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .full-width-image {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
    }
  `]
})
export class ImageDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ImageDialogData) {}
}

// Interfaces
interface ImageDialogData {
  imageUrl: string;
  itemName: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  orderType: 'delivery' | 'take-away' | 'dine-in';
  status: string;
  orderDate?: string;
  processingDate?: string;
  completionDate?: string;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress?: string;
}

interface OrderItem {
  quantity: number;
  name: string;
  price: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-user-order',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    GoogleMapsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    UserNavbarComponent
],
  templateUrl: './user-order.component.html',
  styleUrl: './user-order.component.css',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('orderHighlight', [
      state('normal', style({ backgroundColor: 'transparent' })),
      state('highlight', style({ backgroundColor: 'rgba(144, 238, 144, 0.3)' })),
      transition('normal <=> highlight', animate('0.3s ease-in-out'))
    ]),
    trigger('pointsChange', [
      state('increase', style({ color: 'green', transform: 'scale(1.1)' })),
      state('decrease', style({ color: 'red', transform: 'scale(1.1)' })),
      state('normal', style({ color: 'inherit', transform: 'scale(1)' })),
      transition('* => increase', [animate('0.3s ease-out')]),
      transition('* => decrease', [animate('0.3s ease-out')]),
      transition('increase => normal', [animate('0.3s 1s ease-in')]),
      transition('decrease => normal', [animate('0.3s 1s ease-in')])
    ])
  ]
})
export class UserOrderComponent implements OnInit, OnDestroy {
  
  recentOrders: Order[] = [];
  pointsAnimation: 'increase' | 'decrease' | 'normal' = 'normal';
  previousPoints: number = 0;
  private subscriptions: Subscription[] = [];
  currentUser: any;
  orders: Order[] = [];
  activeOrders: Order[] = [];
  completedOrders: Order[] = [];
  loyaltyPoints: number = 0;
  selectedOrder: Order | null = null;
  loadingOrders: boolean = true;
  
  // Map properties for order tracking
  center: google.maps.LatLngLiteral | null = null;
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  
  // Status code to friendly text mapping
  orderStatusMap: { [key: string]: string } = {
    pending: 'Preparing',
    processing: 'On the way',
    completed: 'Delivered',
    cancelled: 'Cancelled'
  };
  
  // Status to progress percentage mapping
  orderProgressMap: { [key: string]: number } = {
    pending: 25,
    processing: 75,
    completed: 100,
    cancelled: 0
  };

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private loyaltyService: LoyaltyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
     const userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadUserOrders();
        this.loadLoyaltyPoints();
      }
    });
    this.subscriptions.push(userSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserOrders(): void {
    this.loadingOrders = true;
    this.orderService.getOrdersByUser(this.currentUser.id).subscribe({
      next: (orders: any[]) => {
        this.orders = orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `#${Math.floor(Math.random() * 10000)}`,
          orderType: order.orderType,
          status: order.status,
          orderDate: order.orderDate,
          processingDate: order.processingDate,
          completionDate: order.completionDate,
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.orderItems.reduce((sum: number, item: any) => sum + (item.menu?.price || 0) * item.quantity, 0),
          items: order.orderItems.map((item: any) => ({
            quantity: item.quantity,
            name: item.menu?.dishName || 'Unknown Dish',
            price: item.menu?.price || 0,
            description: item.menu?.description || 'No description available',
            image: item.menu?.image || '/assets/food-spread.jpg'
          }))
        }));        
        console.log('Processed orders:', this.orders);
        this.activeOrders = this.orders.filter(order => order.status === 'pending' || order.status === 'processing');
        this.completedOrders = this.orders.filter(order => order.status === 'completed');
        
        console.log('Active Orders:', this.activeOrders);
        console.log('Completed Orders:', this.completedOrders);
        
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('Error loading orders', error);
        this.loadingOrders = false;
        this.showNotification('Could not load your orders. Please try again later.', 'error');
      }
    });
  }

  cancelOrder(orderId: string): void {
    const cancelSubscription = this.orderService.cancelOrder(orderId).subscribe({
      next: (response) => {
        // Update local orders list
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex > -1) {
          this.orders[orderIndex].status = 'cancelled';
          // Refresh filtered lists
          this.activeOrders = this.activeOrders.filter(order => order.id !== orderId);
          this.loadLoyaltyPoints(); // Loyalty points might be affected
        }
        this.showNotification('Order cancelled successfully', 'success');
      },
      error: (error) => {
        console.error('Error cancelling order', error);
        this.showNotification('Failed to cancel order. Please try again.', 'error');
      }
    });
    this.subscriptions.push(cancelSubscription);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  formatOrderDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDeliveryEta(order: Order): string {
    // In a real app, this would come from the delivery service
    if (order.status === 'processing' && order.orderType === 'delivery') {
      return '25-30 minutes';
    }
    return 'N/A';
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? 'error-snackbar' : 
                 type === 'success' ? 'success-snackbar' : 'info-snackbar'
    });
  }

  loadLoyaltyPoints(): void {
    // Use LoyaltyRewardService to get user points
    this.loyaltyService.getUserPoints(this.currentUser.id).subscribe({
      next: (response: any) => {
        this.previousPoints = this.loyaltyPoints;
        this.loyaltyPoints = response.points || 0;
        
        // Animate points change
        if (this.previousPoints > 0 && this.previousPoints !== this.loyaltyPoints) {
          this.pointsAnimation = this.loyaltyPoints > this.previousPoints ? 'increase' : 'decrease';
          setTimeout(() => {
            this.pointsAnimation = 'normal';
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error loading loyalty points', error);
        this.showNotification('Could not load your loyalty points', 'error');
      }
    });
  }

  // New method to calculate points earned for a completed order
  calculatePointsEarned(order: Order): number {
    // Example calculation: 1 point for every $10 spent
    if (order.status === 'completed' && order.totalAmount) {
      return Math.floor(order.totalAmount / 10);
    }
    return 0;
  }

  // Calculate a level based on loyalty points - just for visual enhancement
  getLoyaltyLevel(): number {
    return Math.floor(this.loyaltyPoints / 100) + 1;
  }

  // Calculate progress to next level
  getLoyaltyProgress(): number {
    const currentLevel = this.getLoyaltyLevel();
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsToNextLevel = currentLevel * 100;
    const progress = ((this.loyaltyPoints - pointsForCurrentLevel) / 
                     (pointsToNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(progress, 100);
  }

  getPointsToNextLevel(): number {
    const currentLevel = this.getLoyaltyLevel();
    const pointsToNextLevel = currentLevel * 100;
    return Math.max(0, pointsToNextLevel - this.loyaltyPoints);
  }

  openImageDialog(imageUrl: string | undefined, itemName: string): void {
    if (imageUrl) {
      const dialogRef = this.dialog.open(ImageDialogComponent, {
        width: '500px',
        data: { imageUrl, itemName }
      });
    }
  }
}