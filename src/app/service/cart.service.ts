import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://dinedash-app.onrender.com/cart';

  constructor(private http: HttpClient) { }

  // Fixed the URL endpoints to match the backend
  // In cart.service.ts
addToCart(userId: string, menuId: string, quantity: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/add`, {
    userId,
    menuId,  // Make sure this is menuId, not menuItemId
    quantity
  });
}
  
  removeFromCart(userId: string, menuId: string): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/remove`, { userId, menuId });
  }
  
  viewCart(userId: string): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/view/${userId}`);
  }
  
  clearCart(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clear`, { userId });
  }
}