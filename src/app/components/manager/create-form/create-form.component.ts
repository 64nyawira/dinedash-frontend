import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '../../../service/menu.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-create-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.css',
  animations: [
    trigger('slideAnimation', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-100px)'
        }),
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({
          opacity: 0,
          transform: 'translateX(100px)'
        }))
      ])
    ])
  ]
})
export class CreateFormComponent {
  step: number = 1;
  successMessage: string = '';
  showServingTimes: boolean = false;
  showAddOns: boolean = false;
  imageSelected: boolean = false;
  fileName: string = '';

  categories: string[] = ["Appetizers", "Main Course", "Desserts", "Beverages", "Snacks"];
  servingTimes: string[] = ["Breakfast", "Brunch", "Lunch", "Dinner", "All Times"];
  addOnsList: string[] = ["Cheese", "Sauce", "Extra Meat", "Side Salad", "Fries"];

  formData: any = {
    dishName: '',
    description: '',
    category: '',
    ingredients: '',
    allergenInfo: '',
    selectedServingTimes: [],
    selectedAddOns: [],
    servingTimes: '',
    addOns: '',
    image: null,
    price: 0,
    serviceCost: 0,
    total: 0,
    status: 'Available'
  };

  constructor(private router: Router, private menuService: MenuService) {}

  toggleServingTimesDropdown() {
    this.showServingTimes = !this.showServingTimes;
  }

  toggleAddOnsDropdown() {
    this.showAddOns = !this.showAddOns;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (!file) return;
    
    // Set file name and selected state for UI display
    this.fileName = file.name;
    this.imageSelected = true;
  
    const formData = new FormData();
    formData.append('image', file);
  
    this.menuService.uploadImage(formData).subscribe(
      (response: any) => {
        this.formData.image = response.imageUrl; // Store the image URL
        console.log('📷 Image uploaded successfully:', this.formData.image);
      },
      (error) => {
        console.error('❌ Error uploading image:', error);
      }
    );
  }

  selectServingTime(time: string, event: any) {
    if (event.target.checked) {
      this.formData.selectedServingTimes.push(time);
    } else {
      this.formData.selectedServingTimes = this.formData.selectedServingTimes.filter((t: string) => t !== time);
    }
    this.formData.servingTimes = this.formData.selectedServingTimes.length > 0 ? this.formData.selectedServingTimes.join(', ') : null;
  }

  removeServingTime(time: string) {
    this.formData.selectedServingTimes = this.formData.selectedServingTimes.filter((t: string) => t !== time);
    this.formData.servingTimes = this.formData.selectedServingTimes.length > 0 ? this.formData.selectedServingTimes.join(', ') : null;
  }

  selectAddOn(addon: string, event: any) {
    if (event.target.checked) {
      this.formData.selectedAddOns.push(addon);
    } else {
      this.formData.selectedAddOns = this.formData.selectedAddOns.filter((a: string) => a !== addon);
    }
    this.formData.addOns = this.formData.selectedAddOns.length > 0 ? this.formData.selectedAddOns.join(', ') : null;
  }

  removeAddOn(addon: string) {
    this.formData.selectedAddOns = this.formData.selectedAddOns.filter((a: string) => a !== addon);
    this.formData.addOns = this.formData.selectedAddOns.length > 0 ? this.formData.selectedAddOns.join(', ') : null;
  }

  nextStep() {
    this.step = 2;
  }

  prevStep() {
    this.step = 1;
  }

  calculateTotal() {
    this.formData.total = Number(this.formData.price) + Number(this.formData.serviceCost);
  }

  submitForm() {
    this.formData.servingTimes = this.formData.selectedServingTimes.length > 0
      ? this.formData.selectedServingTimes.join(', ') 
      : null;
  
    this.formData.addOns = this.formData.selectedAddOns.length > 0
      ? this.formData.selectedAddOns.join(', ') 
      : null;
  
    // Ensure image is sent correctly
    if (!this.formData.image || Object.keys(this.formData.image).length === 0) {
      this.formData.image = null;
    }
  
    // ✅ Remove fields that don't exist in Prisma
    const { selectedServingTimes, selectedAddOns, ...cleanData } = this.formData;
  
    console.log('🚀 Submitting form with data:', JSON.stringify(cleanData, null, 2));
  
    this.menuService.createMenuItem(cleanData).subscribe(
      response => {
        console.log('✅ Meal Added:', response);
        this.successMessage = 'Meal added successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        this.router.navigate(['/menu']);
      },
      error => {
        console.error('❌ Error adding meal:', error);
      }
    );
  }

  cancelForm() {
    this.router.navigate(['/menu']);
  }
}