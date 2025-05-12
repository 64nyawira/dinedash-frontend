import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyRewardService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Reward Management Methods
  createReward(rewardData: { 
    name: string, 
    description: string, 
    pointsCost: number 
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reward/create`, rewardData);
  }

  getAllRewards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reward/all`);
  }

  updateReward(
    rewardId: string, 
    rewardData: { 
      name?: string, 
      description?: string, 
      pointsCost?: number 
    }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/reward/update/${rewardId}`, rewardData);
  }

  deleteReward(rewardId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reward/delete/${rewardId}`);
  }

  // Loyalty Points Management Methods
  addPoints(userId: string, totalAmount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/loyalty/points`, { userId, totalAmount });
  }

  getUserPoints(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/loyalty/points/${userId}`);
  }

  redeemReward(redeemData: {
    userId: string, 
    rewardId: string
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/loyalty/redeem`, redeemData);
  }
}
