import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../service/menu.service';
import { CartService } from '../../../service/cart.service';
import { UserNavbarComponent } from "../user-navbar/user-navbar.component";

interface MenuItem {
  id: string;
  dishName: string;
  description: string;
  price: number;
  category: string;
  ingredients: string;
  allergenInfo: string;
  status: string;
  image?: string;
  servingTimes?: string;
  addOns?: string;
  serviceCost: number;
  total: number;
}

interface CartItem {
  id: string;
  userId: string;
  menuId: string;
  quantity: number;
  menu: MenuItem;
}

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, UserNavbarComponent],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  cartItems: CartItem[] = [];
  cartCount: number = 0;
  categories: string[] = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
  loading: boolean = true;
  error: string | null = null;
  
  // Assuming user authentication is implemented elsewhere
  // This would typically come from an auth service
  userId: string = 'current-user-id';

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadCartItems();
  }

  loadMenuItems(): void {
    this.loading = true;
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load menu items. Please try again later.';
        this.loading = false;
        console.error('Error loading menu items:', err);
      }
    });
  }

  loadCartItems(): void {
    this.cartService.viewCart(this.userId).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.updateCartCount();
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  updateCartCount(): void {
    this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getItemsByCategory(category: string): MenuItem[] {
    return this.menuItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase() && 
      item.status === 'Available'
    );
  }

  viewItemDetails(itemId: string): void {
    if (itemId) {
      console.log('Navigating to item with ID:', itemId); // Add for debugging
      this.router.navigate(['/menu-item', itemId]);
    } else {
      console.error('Attempted to navigate with invalid item ID');
    }
  }

  // Navigation methods
  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToUserDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }
}