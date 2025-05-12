import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://dinedash-app.onrender.com/order';

  constructor(private http: HttpClient) {}

  // Place a new order
  placeOrder(userId: string, orderType: 'dine-in' | 'take-away' | 'delivery'): Observable<any> {
    return this.http.post(`${this.apiUrl}/place`, { userId, orderType });
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, { orderId });
  }

  // Get orders for a specific user
  getOrdersByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/view/${userId}`);
  }

  // Get all orders (admin functionality)
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Update order status
  updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-status`, { orderId, status });
  }

  // Calculate total amount for an order
  calculateOrderTotal(orderId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/totalAmount`, { 
      params: { orderId }
    });
  }

  // Get loyalty points (could also be in a separate LoyaltyService)
  getUserLoyaltyPoints(userId: string): Observable<any> {
    return this.http.get(`http://localhost:3000/loyalty/points/${userId}`);
  }
}