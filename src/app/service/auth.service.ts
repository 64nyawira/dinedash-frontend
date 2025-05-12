import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://dinedash-app.onrender.com/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    // Load user from localStorage on service initialization
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  // Get current user ID for cart operations
  getCurrentUserId(): string {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      console.error('No user is logged in');
      return '';
    }
    return currentUser.id;
  }

  // Navigate to user-specific route
  navigateToUserRoute(basePath: string): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      if (['user-dash', 'manager'].includes(basePath)) {
        // These routes expect ID in the path
        this.router.navigate([`/${basePath}`, userId]);
      } else if (['reserve', 'myOrders'].includes(basePath)) {
        // These routes can handle the ID via query params or component logic
        this.router.navigate([`/${basePath}`], { queryParams: { userId } });
      } else {
        // Default navigation
        this.router.navigate([`/${basePath}`]);
      }
    } else {
      // Redirect to login if no user is logged in
      this.router.navigate(['/login']);
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Get current user role
  getUserRole(): string {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.role : '';
  }

  // Register User
  register(userData: { name: string; email: string; password: string }): Observable<any> {
    console.log("Sending registration request:", userData);
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login User - Updated to store user info
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token || '');
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Login and navigate to appropriate dashboard based on role
  loginAndNavigate(credentials: { email: string; password: string }): Observable<any> {
    return this.login(credentials).pipe(
      tap(response => {
        if (response && response.user) {
          const role = response.user.role;
          const userId = response.user.id;
          
          if (role === 'client') {
            this.router.navigate(['/manager', userId]);
          } else {
            this.router.navigate(['/user-dash', userId]);
          }
        }
      })
    );
  }

  // Logout User
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Forgot Password
  forgotPassword(email: string): Observable<any> {
    console.log("Forgot Password API Request for:", email);
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // Verify Reset Code
  verifyResetCode(data: { email: string; code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-reset-code`, data);
  }

  // Reset Password
  resetPassword(data: { email: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // Change User Role (Admin only)
  changeRole(adminId: string, userId: string, newRole: 'customer' | 'client'): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-role`, { adminId, userId, newRole });
  }

  // Get All Users (Admin only)
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  // Delete User (Admin only)
  deleteUser(adminId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${adminId}/${userId}`);
  }
}