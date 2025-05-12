import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private apiUrl = 'http://localhost:3000/loyalty';
  private rewardUrl = 'http://localhost:3000/reward';

  constructor(private http: HttpClient) {}

  // Get user loyalty points
  getUserPoints(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/points/${userId}`);
  }

  // Redeem a reward
  redeemReward(userId: string, rewardId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/redeem`, { userId, rewardId });
  }

  // Create a new reward
  createReward(data: any): Observable<any> {
    return this.http.post(`${this.rewardUrl}/create`, data);
  }

  // Get reward by ID
  getRewardById(id: string): Observable<any> {
    return this.http.get(`${this.rewardUrl}/getone/${id}`);
  }

  // Update reward
  updateReward(id: string, data: Partial<any>): Observable<any> {
    return this.http.put(`${this.rewardUrl}/update/${id}`, data);
  }

  // Delete reward
  deleteReward(id: string): Observable<any> {
    return this.http.delete(`${this.rewardUrl}/delete/${id}`);
  }

  // Get all rewards
  getAllRewards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.rewardUrl}/all`);
  }
}