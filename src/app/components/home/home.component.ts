import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NavbarComponent, FooterComponent,FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'restaurant-app';
  
  
  storyTemplates = [
    {
      id: 1,
      title: 'THE RECIPE',
      subtext: 'Check out our exclusive recipe of the month.',
      imageUrl: '/assets/recipe-bowl.jpeg',
      buttonText: 'Learn More'
    },
    {
      id: 2,
      title: 'MIRACLE TASTE',
      subtext: 'These are our exclusive premium dishes.',
      imageUrl: '/assets/steak-asparagus.jpeg',
      buttonText: 'View Menu'
    },
    {
      id: 3,
      title: 'DISCOUNT THIS WEEK:',
      subtext: 'UP TO 50%',
      description: 'Check out what special dishes on discount this week.',
      imageUrl: '/assets/curry-dish.webp',
      buttonText: 'See Details'
    },
    {
      id: 4,
      title: 'SPECIAL MENU',
      subtext: '',
      imageUrl: '/assets/stake-plate.jpeg',
      buttonText: 'Discover'
    },
    {
      id: 5,
      title: 'YUMMY FOOD.',
      subtext: 'Exclusive taste and premium service.',
      imageUrl: '/assets/food-spread.jpg',
      buttonText: 'Order Now'
    },
    {
      id: 6,
      title: 'FAVORITE MENU',
      subtext: 'Check out what others love from our menu.',
      imageUrl: '/assets/egg-salad.jpeg',
      buttonText: 'See Menu'
    },
    {
      id: 7,
      title: 'PROMO ONLY TODAY.',
      subtext: 'Special lunch promotions today.',
      imageUrl: '/assets/chicken-dish.jpg',
      buttonText: 'Get Promo'
    },
    {
      id: 8,
      title: 'WE ARE OPEN.',
      subtext: 'Visit us for an exclusive premium experience.',
      imageUrl: '/assets/soup-vegetable.jpg',
      buttonText: 'Book Now'
    },
    {
      id: 9,
      title: 'GET PREMIUM TASTE.',
      subtext: 'Visit us for an exclusive premium experience.',
      imageUrl: '/assets/charcuterie.jpg',
      buttonText: 'Reserve'
    }
  ];

}
