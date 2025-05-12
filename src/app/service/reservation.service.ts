import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  reservationTime: Date;
  status: 'active' | 'cancelled';
  table?: {
    id: string;
    name: string;
    capacity: number;
    description: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Table {
  id: string;
  name: string;
  status: 'available' | 'reserved';
  capacity: number;
  description: string;
}

interface MakeReservationRequest {
  userId: string;
  tableId: string;
  reservationTime: Date | string;
}

interface CancelReservationRequest {
  reservationId: string;
}

interface CancelReservationResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'https://dinedash-app.onrender.com/reservation';

  constructor(private http: HttpClient) {}

  // Make a new reservation
  makeReservation(request: MakeReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/make`, request);
  }

  // Cancel an existing reservation
  cancelReservation(reservationId: string): Observable<CancelReservationResponse> {
    return this.http.post<CancelReservationResponse>(`${this.apiUrl}/cancel`, { reservationId });
  }

  // Get all reservations for a specific user
  getUserReservations(userId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get all reservations - admin function
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/all`);
  }
}