import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuService } from '../../../service/menu.service';
import { CartService } from '../../../service/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { OrderService } from '../../../service/order.service';
import { trigger, transition, style, animate } from '@angular/animations';

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

interface AddOn {
  name: string;
  price: number;
  selected: boolean;
}

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class MenuItemComponent implements OnInit {
  menuItem: MenuItem | null = null;
  quantity: number = 1;
  selectedAddOns: AddOn[] = [];
  totalPrice: number = 0;
  loading: boolean = true;
  error: string | null = null;
  addToCartSuccess: boolean = false;
  
  // Cart view properties
  isCartOpen: boolean = false;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  cartSubtotal: number = 0;
  serviceFee: number = 0;
  cartLoading: boolean = false;
  cartError: string | null = null;
  orderSuccess: boolean = false;
  selectedOrderType: 'dine-in' | 'take-away' | 'delivery' = 'dine-in';
  
  // Replace hardcoded userId with a property that will be set from AuthService
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Get the actual user ID from your auth service
    this.userId = this.authService.getCurrentUserId();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMenuItem(id);
    } else {
      this.error = 'Item ID not found';
      this.loading = false;
    }
    
    // Preload cart item count for badge
    this.preloadCartCount();
  }

  preloadCartCount(): void {
    this.cartService.viewCart(this.userId).subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => {
        console.error('Error loading cart count:', err);
      }
    });
  }

  loadMenuItem(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.menuService.getMenuItemById(id).subscribe({
      next: (item) => {
        this.menuItem = item;
        this.parseAddOns();
        this.calculateTotal();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load menu item. Please try again later.';
        this.loading = false;
        console.error('Error loading menu item:', err);
      }
    });
  }

  parseAddOns(): void {
    if (this.menuItem && this.menuItem.addOns) {
      try {
        // First check if it's a comma-separated string
        if (typeof this.menuItem.addOns === 'string' && this.menuItem.addOns.includes(',')) {
          const addOnNames = this.menuItem.addOns.split(',').map(item => item.trim());
          this.selectedAddOns = addOnNames.map(name => ({
            name: name,
            price: 2.00, // Set a default price or determine from elsewhere
            selected: false
          }));
        } else if (typeof this.menuItem.addOns === 'string') {
          // Try to parse as JSON if it doesn't look like a comma-separated list
          try {
            const addOnsData = JSON.parse(this.menuItem.addOns);
            this.selectedAddOns = Array.isArray(addOnsData) ? 
              addOnsData.map((addon: any) => ({
                ...addon,
                selected: false
              })) : 
              [{
                name: this.menuItem.addOns as string,
                price: 2.00,
                selected: false
              }];
          } catch (e) {
            // If JSON parsing fails, treat as a single item
            this.selectedAddOns = [{
              name: this.menuItem.addOns as string,
              price: 2.00, // Default price
              selected: false
            }];
          }
        }
      } catch (e) {
        console.error('Error processing addOns:', e);
        // If all else fails, treat as a single item
        this.selectedAddOns = [{
          name: typeof this.menuItem.addOns === 'string' ? this.menuItem.addOns : 'Extra',
          price: 2.00, // Default price
          selected: false
        }];
      }
    }
  }

  // Add this method to your MenuItemComponent class
hasSelectedAddOns(): boolean {
  return this.selectedAddOns.filter(addon => addon.selected).length > 0;
}

  toggleAddOn(addon: AddOn, event?: Event): void {
    // Prevent event bubbling if event is provided
    if (event) {
      event.stopPropagation();
    }
    
    addon.selected = !addon.selected;
    this.calculateTotal();
  }

  calculateTotal(): void {
    if (!this.menuItem) return;
    
    const basePrice = this.menuItem.price;
    const addOnsTotal = this.selectedAddOns
      .filter(addon => addon.selected)
      .reduce((sum, addon) => sum + addon.price, 0);
    
    const subtotal = basePrice + addOnsTotal;
    const serviceCost = this.menuItem.serviceCost || 0;
    
    this.totalPrice = (subtotal + serviceCost) * this.quantity;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculateTotal();
    }
  }

  increaseQuantity(): void {
    this.quantity++;
    this.calculateTotal();
  }

  addToCart(): void {
    if (!this.menuItem) return;
    
    // Reset states
    this.addToCartSuccess = false;
    
    // Get selected add-ons
    const selectedAddOns = this.selectedAddOns
      .filter(addon => addon.selected)
      .map(addon => ({ name: addon.name, price: addon.price }));
    
    console.log('Adding to cart:', {
      menuId: this.menuItem.id,
      quantity: this.quantity,
      selectedAddOns: selectedAddOns
    });
    
    this.cartService.addToCart(this.userId, this.menuItem.id, this.quantity).subscribe({
      next: (response) => {
        console.log('Cart response:', response);
        this.addToCartSuccess = true;
        
        // Update cart count
        this.preloadCartCount();
        
        // Auto-hide success message after delay
        setTimeout(() => {
          this.addToCartSuccess = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Error response from server:', err);
        this.error = err.error?.message || 'Failed to add item to cart. Please try again.';
        
        // Auto-hide error message after delay
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/umenu']);
  }

  goToCart(): void {
    this.openCart();
  }

  openCart(): void {
    this.isCartOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    this.loadCartItems();
  }

  closeCart(): void {
    this.isCartOpen = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  loadCartItems(): void {
    this.cartLoading = true;
    this.cartError = null;
    
    this.cartService.viewCart(this.userId).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateCartTotal();
        this.cartLoading = false;
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
        this.cartError = 'Failed to load your cart. Please try again.';
        this.cartLoading = false;
      }
    });
  }

  calculateCartTotal(): void {
    this.cartSubtotal = this.cartItems.reduce((total, item) => {
      const itemTotal = item.menu.price * item.quantity;
      return total + itemTotal;
    }, 0);
    
    // Calculate service fee (5%)
    this.serviceFee = this.cartSubtotal * 0.05;
    
    // Calculate total with service fee
    this.cartTotal = this.cartSubtotal + this.serviceFee;
  }

  removeCartItem(menuId: string): void {
    this.cartService.removeFromCart(this.userId, menuId).subscribe({
      next: () => {
        // Filter out the removed item
        this.cartItems = this.cartItems.filter(item => item.menuId !== menuId);
        this.calculateCartTotal();
      },
      error: (err) => {
        console.error('Error removing item from cart:', err);
        this.cartError = 'Failed to remove item. Please try again.';
        
        // Auto-hide error after delay
        setTimeout(() => {
          this.cartError = null;
        }, 3000);
      }
    });
  }

  clearCart(): void {
    if (this.cartItems.length === 0) return;
    
    this.cartService.clearCart(this.userId).subscribe({
      next: () => {
        this.cartItems = [];
        this.cartTotal = 0;
        this.cartSubtotal = 0;
        this.serviceFee = 0;
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
        this.cartError = 'Failed to clear cart. Please try again.';
        
        // Auto-hide error after delay
        setTimeout(() => {
          this.cartError = null;
        }, 3000);
      }
    });
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.cartError = 'Your cart is empty. Add items before placing an order.';
      setTimeout(() => {
        this.cartError = null;
      }, 3000);
      return;
    }
    
    this.orderService.placeOrder(this.userId, this.selectedOrderType).subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.orderSuccess = true;
        
        // Clear the cart after successful order
        this.cartItems = [];
        this.cartTotal = 0;
        this.cartSubtotal = 0;
        this.serviceFee = 0;
        
        setTimeout(() => {
          this.orderSuccess = false;
          this.closeCart();
        }, 3000);
      },
      error: (err) => {
        console.error('Error placing order:', err);
        this.cartError = 'Failed to place your order. Please try again.';
        this.orderSuccess = false;
        
        // Auto-hide error after delay
        setTimeout(() => {
          this.cartError = null;
        }, 4000);
      }
    });
  }
}