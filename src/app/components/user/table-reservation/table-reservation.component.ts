import { Component, OnInit } from '@angular/core';
import {  FormsModule } from '@angular/forms';
import { ReservationService } from '../../../service/reservation.service';
import { TableService } from '../../../service/table.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { UserNavbarComponent } from "../user-navbar/user-navbar.component";

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
  image?: string;
}

interface MakeReservationRequest {
  userId: string;
  tableId: string;
  reservationTime: Date | string;
}
@Component({
  selector: 'app-table-reservation',
  standalone: true,
  imports: [FormsModule, CommonModule, UserNavbarComponent],
  providers: [DatePipe], 
  templateUrl: './table-reservation.component.html',
  styleUrl: './table-reservation.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate('400ms ease-in-out')),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
    trigger('tableHover', [
      state('normal', style({
        transform: 'scale(1)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      })),
      state('hovered', style({
        transform: 'scale(1.05)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      })),
      transition('normal <=> hovered', animate('200ms ease-in-out'))
    ])
  ]
})

  export class TableReservationComponent implements OnInit {
    currentUserId: string | null = null;
  
    // Table data
    tables: Table[] = [];
    filteredTables: Table[] = [];
    
    // Reservation data
    userReservations: Reservation[] = [];
    
    // UI states
    activeView: 'tables' | 'history' = 'tables';
    reservationDate: string = '';
    reservationTime: string = '';
    selectedTableId: string | null = null;
    capacityFilter: number | null = null;
    isLoading: boolean = false;
    bookingSuccess: boolean = false;
    showSuccessMessage: boolean = false;
    hoveredTableId: string | null = null;
    message: { text: string; type: 'success' | 'error' } | null = null;
    
    // Current date for min date in datepicker
    currentDate: string;
    
    constructor(
      private reservationService: ReservationService,
      private tableService: TableService,
      private datePipe: DatePipe
    ) {
      // Set current date in YYYY-MM-DD format for the date picker
      const today = new Date();
      this.currentDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
      
      // Initialize with today's date
      this.reservationDate = this.currentDate;
      
      // Set default time to current hour rounded up
      const hours = today.getHours();
      const minutes = today.getMinutes();
      const roundedHour = minutes > 30 ? hours + 1 : hours;
      this.reservationTime = `${roundedHour.toString().padStart(2, '0')}:00`;
    }
    
    ngOnInit(): void {
      // ✅ Get the logged-in user's ID from localStorage
      this.currentUserId = localStorage.getItem('userId');
      console.log(this.currentUserId);
  
      if (!this.currentUserId) {
        this.showMessage('User ID not found. Please log in again.', 'error');
        return;
      }
  
      this.loadTables();
      this.loadUserReservations();
    }
    
    loadTables(): void {
      this.isLoading = true;
      this.tableService.getAvailableTables().subscribe({
        next: (tables) => {
          this.tables = tables;
          this.filteredTables = [...tables];
          this.isLoading = false;
        },
        error: () => this.showMessage('Error loading tables', 'error'),
      });
    }
  
    
    loadUserReservations(): void {
      if (!this.currentUserId) return;
  
      this.isLoading = true;
      this.reservationService.getUserReservations(this.currentUserId).subscribe({
        next: (reservations) => {
          this.userReservations = reservations;
          this.isLoading = false;
        },
        error: () => this.showMessage('Error loading reservations', 'error'),
      });
    }
    
    setActiveView(view: 'tables' | 'history'): void {
      this.activeView = view;
      if (view === 'history') {
        this.loadUserReservations();
      } else {
        this.loadTables();
      }
    }
    
    selectTable(tableId: string): void {
      this.selectedTableId = this.selectedTableId === tableId ? null : tableId;
    }
    
    makeReservation(): void {
      if (!this.currentUserId || !this.selectedTableId) {
        this.showMessage('User ID and Table ID are required!', 'error');
        return;
      }
  
      const reservationDateTime = new Date(`${this.reservationDate}T${this.reservationTime}`);
      const request = {
        userId: this.currentUserId, 
        tableId: this.selectedTableId,
        reservationTime: reservationDateTime,
      };
  
      this.isLoading = true;
      this.reservationService.makeReservation(request).subscribe({
        next: () => {
          this.isLoading = false;
          this.showMessage('Reservation successful!', 'success');
          this.loadTables();
          this.selectedTableId = null;
        },
        error: () => this.showMessage('Failed to make reservation. Try again.', 'error'),
      });
    }
  
    showMessage(text: string, type: 'success' | 'error'): void {
      this.message = { text, type };
      setTimeout(() => (this.message = null), 3000);
    }
    
    cancelReservation(reservationId: string): void {
      if (confirm('Are you sure you want to cancel this reservation?')) {
        this.isLoading = true;
        this.reservationService.cancelReservation(reservationId).subscribe({
          next: (response) => {
            this.loadUserReservations();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error cancelling reservation:', error);
            this.isLoading = false;
            alert('Failed to cancel reservation. Please try again.');
          }
        });
      }
    }
    
    filterTablesByCapacity(): void {
      if (this.capacityFilter === null) {
        this.filteredTables = [...this.tables];
      } else {
        // Use the non-null assertion operator or explicitly cast to number
        this.filteredTables = this.tables.filter(table => table.capacity >= this.capacityFilter!);
        
        
      }
    }
    
    showSuccessAnimation(): void {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
        this.bookingSuccess = false;
      }, 3000);
    }
    
    setTableHoverState(tableId: string, isHovered: boolean): void {
      this.hoveredTableId = isHovered ? tableId : null;
    }
    
    isTableHovered(tableId: string): boolean {
      return this.hoveredTableId === tableId;
    }
    
    getTableState(tableId: string): string {
      return this.isTableHovered(tableId) ? 'hovered' : 'normal';
    }
    
    formatReservationTime(date: Date): string {
      return this.datePipe.transform(date, 'MMM d, y, h:mm a') || '';
    }
}
