import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserNavbarComponent } from "../user-navbar/user-navbar.component";
import { AuthService } from '../../../service/auth.service';
import { LoyaltyService } from '../../../service/loyalty.service';
import { OrderService } from '../../../service/order.service';
import { ReservationService } from '../../../service/reservation.service';

@Component({
  selector: 'app-user-dash',
  standalone: true,
  imports: [FormsModule, CommonModule, UserNavbarComponent, RouterLink],
  templateUrl: './user-dash.component.html',
  styleUrl: './user-dash.component.css'
})
export class UserDashComponent implements OnInit {
  title = 'restaurant-app';
  
  user = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    loyaltyPoints: 0,
    lastVisit: new Date()
  };
  
  currentOrders: any[] = [];
  orderHistory: any[] = [];
  reservations: any[] = [];
  
  constructor(
    private orderService: OrderService,
    private reservationService: ReservationService,
    private loyaltyService: LoyaltyService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    // Get user ID either from route params or auth service
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id') || this.authService.getCurrentUserId();
      
      if (userId) {
        this.loadUserData(userId);
        this.loadOrders(userId);
        this.loadReservations(userId);
      } else {
        console.error('No user ID available');
        // Handle the error or redirect to login
      }
    });
  }
  
  loadUserData(userId: string): void {
    // Get current user data
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = {
          id: user.id,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          email: user.email,
          loyaltyPoints: 0,
          lastVisit: new Date()
        };
      }
    });
    
    // Get loyalty points
    this.loyaltyService.getUserPoints(userId).subscribe({
      next: (response) => {
        this.user.loyaltyPoints = response.points;
      },
      error: (error) => {
        console.error('Error loading loyalty points:', error);
      }
    });
  }
  
  loadOrders(userId: string): void {
    this.orderService.getOrdersByUser(userId).subscribe({
      next: (orders) => {
        // Split orders into current and history based on status
        this.currentOrders = orders.filter(order => 
          ['pending', 'preparing', 'ready'].includes(order.status.toLowerCase())
        );
        
        this.orderHistory = orders.filter(order => 
          ['completed', 'cancelled'].includes(order.status.toLowerCase())
        );
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }
  
  loadReservations(userId: string): void {
    this.reservationService.getUserReservations(userId).subscribe({
      next: (reservations) => {
        // Only include active reservations with future dates
        this.reservations = reservations
          .filter(res => res.status === 'active' && new Date(res.reservationTime) > new Date())
          .map(res => ({
            id: res.id,
            date: new Date(res.reservationTime),
            partySize: res.table?.capacity || 0,
            specialRequests: ''
          }));
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
      }
    });
  }
  redeemPoints(): void {
    // Navigate to rewards page or open modal
  }
  
  viewOrderDetails(orderId: string): void {
    // Navigate to order details page
  }
  
  cancelReservation(reservationId: string): void {
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: () => {
        this.loadReservations(this.user.id);
      },
      error: (error) => {
        console.error('Error cancelling reservation:', error);
      }
    });
  }
  
  modifyReservation(reservationId: string): void {
    // Navigate to reservation modification page
  }
  
  favorites = [
    {
      id: 1,
      name: 'Ribeye Steak',
      price: 34.99,
      imageUrl: '/assets/steak-asparagus.jpeg'
    },
    {
      id: 2,
      name: 'Truffle Fries',
      price: 9.99,
      imageUrl: '/assets/curry-dish.webp'
    },
    {
      id: 3,
      name: 'Chocolate Mousse',
      price: 8.99,
      imageUrl: '/assets/food-spread.jpg'
    }
  ];
  
  events = [
    {
      id: 1,
      name: 'Wine Tasting Night',
      date: new Date('2025-03-25T18:00:00'),
      description: 'Join us for an evening of fine wines paired with delicious appetizers.'
    },
    {
      id: 2,
      name: 'Live Jazz Friday',
      date: new Date('2025-03-28T20:00:00'),
      description: 'Enjoy dinner with live jazz music from local artists.'
    }
  ];
  
  storyTemplates = [
    {
      id: 1,
      title: 'THE RECIPE',
      subtext: 'Check out our exclusive recipe of the month.',
      imageUrl: '/assets/recipe-bowl.jpeg',
      buttonText: 'Learn More'
    },
    {
      id: 2,
      title: 'MIRACLE TASTE',
      subtext: 'These are our exclusive premium dishes.',
      imageUrl: '/assets/steak-asparagus.jpeg',
      buttonText: 'View Menu'
    },
    {
      id: 3,
      title: 'DISCOUNT THIS WEEK:',
      subtext: 'UP TO 50%',
      description: 'Check out what special dishes on discount this week.',
      imageUrl: '/assets/curry-dish.webp',
      buttonText: 'See Details'
    },
    {
      id: 4,
      title: 'SPECIAL MENU',
      subtext: '',
      imageUrl: '/assets/stake-plate.jpeg',
      buttonText: 'Discover'
    },
    {
      id: 5,
      title: 'YUMMY FOOD.',
      subtext: 'Exclusive taste and premium service.',
      imageUrl: '/assets/food-spread.jpg',
      buttonText: 'Order Now'
    },
    {
      id: 6,
      title: 'FAVORITE MENU',
      subtext: 'Check out what others love from our menu.',
      imageUrl: '/assets/egg-salad.jpeg',
      buttonText: 'See Menu'
    },
    {
      id: 7,
      title: 'PROMO ONLY TODAY.',
      subtext: 'Special lunch promotions today.',
      imageUrl: '/assets/chicken-dish.jpg',
      buttonText: 'Get Promo'
    },
    {
      id: 8,
      title: 'WE ARE OPEN.',
      subtext: 'Visit us for an exclusive premium experience.',
      imageUrl: '/assets/soup-vegetable.jpg',
      buttonText: 'Book Now'
    },
    {
      id: 9,
      title: 'GET PREMIUM TASTE.',
      subtext: 'Visit us for an exclusive premium experience.',
      imageUrl: '/assets/charcuterie.jpg',
      buttonText: 'Reserve'
    }
  ];
 
}