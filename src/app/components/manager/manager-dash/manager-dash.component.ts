import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from '../../../service/auth.service';
Chart.register(...registerables);

interface MealCategory {
  name: string;
  count: number;
  percentage: number;
}

interface Meal {
  name: string;
  count: number;
  category: string;
}

@Component({
  selector: 'app-manager-dash',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './manager-dash.component.html',
  styleUrl: './manager-dash.component.css'
})

export class ManagerDashComponent implements OnInit {
  // User data
  name: string = '';
  
  // Dashboard data
  todayIncome: number = 0;
  dailyAverage: number = 0;
  monthlyAverage: number = 0;
  yearlyAverage: number = 0;
  Math = Math;
  
  // Order categories
  mealCategories: MealCategory[] = [];
  
  // Top and bottom meals
  topMeals: Meal[] = [];
  bottomMeals: Meal[] = [];
  
  // Loading states
  loading: boolean = true;
  
  constructor(private authService:AuthService) { }

  ngOnInit(): void {
    // Get the logged-in user's name from the AuthService
    this.getUserName();
    
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      console.log('No user is currently logged in');
      // You could redirect to login page here if needed
    }
    
    // Simulate API data loading
    setTimeout(() => {
      this.fetchDashboardData();
      this.loading = false;
    }, 1000);
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

  fetchDashboardData(): void {
    // This would be replaced with actual API calls
    this.todayIncome = 2450.75;
    this.dailyAverage = 2100.50;
    this.monthlyAverage = 63250.25;
    this.yearlyAverage = 754800.50;
    
    this.mealCategories = [
      { name: 'Appetizers', count: 145, percentage: 22 },
      { name: 'Main Course', count: 287, percentage: 43 },
      { name: 'Desserts', count: 98, percentage: 15 },
      { name: 'Beverages', count: 112, percentage: 17 },
      { name: 'Snacks', count: 21, percentage: 3 }
    ];
    
    this.topMeals = [
      { name: 'Grilled Salmon', count: 52, category: 'Main Course' },
      { name: 'Mozzarella Sticks', count: 48, category: 'Appetizers' },
      { name: 'Chocolate Cake', count: 43, category: 'Desserts' },
      { name: 'Chicken Parmesan', count: 38, category: 'Main Course' },
      { name: 'Margarita', count: 36, category: 'Beverages' }
    ];
    
    this.bottomMeals = [
      { name: 'Veggie Burger', count: 8, category: 'Main Course' },
      { name: 'Fruit Platter', count: 7, category: 'Desserts' },
      { name: 'Onion Rings', count: 5, category: 'Appetizers' },
      { name: 'Green Tea', count: 4, category: 'Beverages' },
      { name: 'Trail Mix', count: 3, category: 'Snacks' }
    ];
    
    this.renderCharts();
  }
  
  renderCharts(): void {
    this.renderCategoryChart();
    this.renderIncomeChart();
    this.renderTopMealsChart();
  }
  
  renderCategoryChart(): void {
    const categoryCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCanvas) {
      new Chart(categoryCanvas, {
        type: 'doughnut',
        data: {
          labels: this.mealCategories.map(cat => cat.name),
          datasets: [{
            data: this.mealCategories.map(cat => cat.percentage),
            backgroundColor: [
              '#FF6B6B', // Vibrant red
              '#4ECDC4', // Turquoise
              '#FFD166', // Vibrant yellow
              '#6A0572', // Deep purple
              '#F86624'  // Vibrant orange
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  family: 'Playfair Display'
                }
              }
            },
            title: {
              display: true,
              text: 'Orders by Category (%)',
              font: {
                family: 'Playfair Display',
                size: 16,
                weight: 'bold'
              }
            }
          }
        }
      });
    }
  }
  
  renderIncomeChart(): void {
    const incomeCanvas = document.getElementById('incomeChart') as HTMLCanvasElement;
    if (incomeCanvas) {
      new Chart(incomeCanvas, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Income ($)',
            data: [1820, 2130, 1950, 2450, 2760, 3100, 2150],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                font: {
                  family: 'Lora'
                }
              }
            },
            x: {
              ticks: {
                font: {
                  family: 'Lora'
                }
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'This Week\'s Income',
              font: {
                family: 'Playfair Display',
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              labels: {
                font: {
                  family: 'Lora'
                }
              }
            }
          }
        }
      });
    }
  }
  
  renderTopMealsChart(): void {
    const topMealsCanvas = document.getElementById('topMealsChart') as HTMLCanvasElement;
    if (topMealsCanvas) {
      new Chart(topMealsCanvas, {
        type: 'bar',
        data: {
          labels: this.topMeals.map(meal => meal.name),
          datasets: [{
            label: 'Orders',
            data: this.topMeals.map(meal => meal.count),
            backgroundColor: [
              '#4ECDC4', // Turquoise
              '#FF6B6B', // Vibrant red
              '#FFD166', // Vibrant yellow
              '#6A0572', // Deep purple
              '#F86624'  // Vibrant orange
            ],
            borderColor: '#1A535C',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: 'Top 5 Most Ordered Items',
              font: {
                family: 'Playfair Display',
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              labels: {
                font: {
                  family: 'Lora'
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                font: {
                  family: 'Lora'
                }
              }
            },
            x: {
              ticks: {
                font: {
                  family: 'Lora'
                }
              }
            }
          }
        }
      });
    }
  }
}