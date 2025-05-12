import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query, state } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dash.component.html',
  styleUrl: './admin-dash.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition(':enter', [
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('tableRowAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(80, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class AdminDashComponent implements OnInit {
  users: any[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  selectedRole: string = '';
  successMessage: string = '';
  showDeleteModal: boolean = false;
  userToDelete: any = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.fetchUsers();
  }
  
  fetchUsers(): void {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      }
    });
  }

  get filteredUsers(): any[] {
    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole ? user.role === this.selectedRole : true;
      return matchesSearch && matchesRole;
    });
  }

  openDeleteConfirmation(user: any): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      const userId = this.userToDelete.id;
      const userName = this.userToDelete.name;
      const adminId = this.authService.getCurrentUserId();
      
      this.authService.deleteUser(adminId, userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
          this.showDeleteModal = false;
          this.userToDelete = null;
          this.showSuccessMessage(`User ${userName} has been successfully removed`);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showDeleteModal = false;
          this.userToDelete = null;
        }
      });
    }
  }

  changeUserRole(userId: string, newRole: 'customer' | 'client'): void {
    const user = this.users.find(u => u.id === userId);
    if (user && user.role === newRole) return;
    
    const adminId = this.authService.getCurrentUserId();
    this.authService.changeRole(adminId, userId, newRole).subscribe({
      next: (response) => {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          const oldRole = this.users[userIndex].role;
          this.users[userIndex].role = newRole;
          this.showSuccessMessage(`User role changed from ${oldRole} to ${newRole}`);
        }
      },
      error: (error) => {
        console.error('Error changing user role:', error);
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}