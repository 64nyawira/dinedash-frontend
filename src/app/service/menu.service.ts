import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'https://dinedash-app.onrender.com/menu';

  constructor(private http: HttpClient) {}

  // Create Menu Item
  createMenuItem(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

uploadImage(formData: FormData) {
  return this.http.post<{message: string, imageUrl: string}>('http://localhost:3000/upload', formData);
}
  

  // Get Menu Item by ID
  getMenuItemById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getone/${id}`);
  }

  // Update Menu Item
  updateMenuItem(id: string, data: Partial<any>): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  // Delete Menu Item
  deleteMenuItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // Get All Menu Items
  getAllMenuItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
}
