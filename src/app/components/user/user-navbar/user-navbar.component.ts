import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.css'
})
export class UserNavbarComponent implements OnInit {
  isMenuOpen = false;
  userId: string | null = null;
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to the currentUser$ observable to keep userId updated
    this.authService.currentUser$.subscribe(user => {
      this.userId = user?.id || null;
      this.isLoggedIn = !!user;
      console.log('Current user ID:', this.userId); // Debug log
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}