import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { OrderService } from '../../../service/order.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  isLoading: boolean = true;
  
  statusOptions = ['pending', 'completed', 'cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadAllOrders();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterOrders(searchValue);
    });
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.isLoading = false;
      }
    });
  }
  updateStatus(order: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    
    this.orderService.updateOrderStatus(order.id, newStatus as any).subscribe({
      next: (response) => {
        order.status = newStatus;
        console.log(`Order ${order.id} status updated to ${newStatus}`);
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  getTotalItems(order: any): number {
    if (!order.orderItems) return 0;
    return order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  filterOrders(searchValue: string): void {
    if (!searchValue.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }
    
    const lowerCaseSearch = searchValue.toLowerCase();
    this.filteredOrders = this.orders.filter(order => 
      order.user?.name?.toLowerCase().includes(lowerCaseSearch)
    );
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

}