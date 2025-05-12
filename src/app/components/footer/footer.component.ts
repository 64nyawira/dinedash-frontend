import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  
  // For animation purposes
  sections: string[] = ['about', 'links', 'hours', 'social'];
  
  ngOnInit() {
    // Apply staggered animation to footer sections
    this.sections.forEach((section, index) => {
      const element = document.querySelector(`.footer-section.${section}`);
      if (element) {
        element.setAttribute('style', `animation-delay: ${index * 0.2}s`);
      }
    });
  }

  // Optional: Add method to handle newsletter subscription
  subscribeToNewsletter(event: Event): void {
    event.preventDefault();
    // Implementation for newsletter subscription would go here
    console.log('Newsletter subscription requested');
  }
}