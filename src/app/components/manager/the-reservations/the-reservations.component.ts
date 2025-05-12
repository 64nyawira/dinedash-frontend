import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ReservationService } from '../../../service/reservation.service';
import { NavbarComponent } from "../navbar/navbar.component";

interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  reservationTime: Date;
  status: 'active' | 'cancelled' | 'completed';
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

@Component({
  selector: 'app-the-reservations',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './the-reservations.component.html',
  styleUrl: './the-reservations.component.css'
})
export class TheReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  isLoading: boolean = true;
  todayDate: Date = new Date();
Math: any;
  
  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadAllReservations();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterReservations(searchValue);
    });
  }

  loadAllReservations(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        // Sort reservations from newest to oldest
        this.reservations = data.sort((a, b) => 
          new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime()
        );
        
        // Automatically mark past reservations as 'completed'
        this.reservations = this.reservations.map(reservation => {
          const reservationDate = new Date(reservation.reservationTime);
          if (reservationDate < this.todayDate && reservation.status === 'active') {
            return { ...reservation, status: 'completed' };
          }
          return reservation;
        });
        
        this.filteredReservations = [...this.reservations];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching reservations:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  filterReservations(searchValue: string): void {
    if (!searchValue.trim()) {
      this.filteredReservations = [...this.reservations];
      return;
    }
    
    const lowerCaseSearch = searchValue.toLowerCase();
    this.filteredReservations = this.reservations.filter(reservation => 
      (reservation.user?.name?.toLowerCase().includes(lowerCaseSearch) || 
      reservation.table?.name?.toLowerCase().includes(lowerCaseSearch))
    );
  }

  cancelReservation(reservation: Reservation): void {
    if (reservation.status !== 'active') {
      return; // Only active reservations can be cancelled
    }
    
    this.reservationService.cancelReservation(reservation.id).subscribe({
      next: (response) => {
        // Update the local reservation object
        reservation.status = 'cancelled';
        console.log(`Reservation ${reservation.id} cancelled`);
      },
      error: (error) => {
        console.error('Error cancelling reservation:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  isUpcoming(reservationTime: Date): boolean {
    return new Date(reservationTime) > this.todayDate;
  }

  formatReservationTime(time: Date): string {
    // Format date as "Mon, Apr 4, 2025 at 7:30 PM"
    return new Date(time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getTimeFromNow(time: Date): string {
    const reservationDate = new Date(time);
    const now = new Date();
    const diffTime = Math.abs(reservationDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      if (reservationDate > now) {
        const diffHours = Math.floor((reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor((reservationDate.getTime() - now.getTime()) / (1000 * 60));
          return `In ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        }
        return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        return 'Earlier today';
      }
    } else if (diffDays === 1) {
      return reservationDate > now ? 'Tomorrow' : 'Yesterday';
    } else if (diffDays < 7) {
      return reservationDate > now ? `In ${diffDays} days` : `${diffDays} days ago`;
    } else {
      return reservationDate > now ? 'More than a week away' : 'More than a week ago';
    }
  }
  
  // Helper methods for template binding
  getActiveUpcomingCount(): number {
    return this.reservations.filter(r => r.status === 'active' && this.isUpcoming(r.reservationTime)).length;
  }

  getCompletedCount(): number {
    return this.reservations.filter(r => r.status === 'completed').length;
  }

  getCancelledCount(): number {
    return this.reservations.filter(r => r.status === 'cancelled').length;
  }

  getUpcomingGuestsCount(): number {
    return this.filteredReservations.reduce((sum, r) => 
      r.status === 'active' && this.isUpcoming(r.reservationTime) ? sum + (r.table?.capacity || 0) : sum, 0);
  }
}