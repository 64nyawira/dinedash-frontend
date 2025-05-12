import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/payment';

  constructor(private http: HttpClient) {}

  // Initiate M-Pesa Payment
  initiatePayment(data: {
    userId: string;
    orderId: string;
    phoneNumber: string;
    amount: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/initiate`, data);
  }

  // Check Payment Status
  checkPaymentStatus(checkoutRequestId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${checkoutRequestId}`);
  }

  // Cancel a Transaction (Reversal)
  cancelTransaction(data: {
    transactionId: string;
    amount: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, data);
  }

  // Get All Transactions
  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
  
  // Get Transaction Receipt
  getTransactionReceipt(transactionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/receipt/${transactionId}`);
  }

  // Get Transaction History for a User
  getUserTransactions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get Transactions by Order
  getOrderTransactions(orderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/order/${orderId}`);
  }
  
  // Get Transaction Statistics
  getTransactionStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}