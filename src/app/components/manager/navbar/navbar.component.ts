import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  name: string = '';
  isMenuOpen: boolean = false;
  
  // Active link handling
  activeLink: string = 'reports';
  
  constructor(private authService:AuthService) { }
  
    ngOnInit(): void {
      // Get the logged-in user's name from the AuthService
      this.getUserName();
      
      // Check if user is logged in
      if (!this.authService.isLoggedIn()) {
        console.log('No user is currently logged in');
        // You could redirect to login page here if needed
      }
      
      
    }
  
    getUserName(): void {
      // Subscribe to the current user observable
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.name = user.name;
        } else {
          this.name = 'Restaurant Manager'; // Default fallback
        }
        console.log('Current user name:', this.name);
      });
    }
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  setActiveLink(link: string): void {
    this.activeLink = link;
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }

} }
