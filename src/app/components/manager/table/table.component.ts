import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TableService } from '../../../service/table.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface Table {
  id: string;
  name: string;
  capacity: number;
  description: string;
  status: 'available' | 'reserved';
  image?: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class TableComponent implements OnInit {
  tables: Table[] = [];
  tableForm: FormGroup;
  selectedTable: Table | null = null;
  isEditMode = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  isCreateFormVisible = false;
  errorMessage: string | null = null;
  notification: Notification | null = null;
  isLoading = false;

  constructor(
    private tableService: TableService,
    private fb: FormBuilder
  ) {
    this.tableForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50)
      ]],
      capacity: [1, [
        Validators.required, 
        Validators.min(1), 
        Validators.max(20)
      ]],
      description: ['', [
        Validators.maxLength(200)
      ]],
      image: [null]
    });
  }

  ngOnInit() {
    this.loadTables();
  }

  // Form validation helper methods
  hasError(controlName: string, errorType: string): boolean {
    const control = this.tableForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  loadTables() {
    this.isLoading = true;
    this.tableService.getAllTables().subscribe({
      next: (tables) => {
        this.tables = tables.map(table => ({
          ...table,
          image: table.image ? `/assets/${table.image}` : '/assets/8-seater-table.webp'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.showNotification('Failed to load tables', 'error');
        this.isLoading = false;
        console.error('Error loading tables', err);
      }
    });
  }

  toggleCreateForm() {
    this.isCreateFormVisible = !this.isCreateFormVisible;
    if (!this.isCreateFormVisible) {
      this.resetForm();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.showNotification('Invalid file type. Please upload a JPEG, PNG, or WebP image.', 'error');
        return;
      }

      if (file.size > maxSize) {
        this.showNotification('File is too large. Maximum size is 5MB.', 'error');
        return;
      }

      this.imageFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.tableForm.patchValue({ image: file.name });
      };
      reader.readAsDataURL(file);
    }
  }

  createTable() {
    if (this.tableForm.valid) {
      this.isLoading = true;
      const tableData = { ...this.tableForm.value };
      
      // If an image was selected, include its filename
      if (this.imageFile) {
        tableData.image = this.imageFile.name;
      }

      this.tableService.createTable(tableData).subscribe({
        next: (newTable) => {
          // Ensure the image path is correct
          newTable.image = `/assets/${newTable.image || 'default-table.jpg'}`;
          this.tables.push(newTable);
          this.showNotification('Table created successfully!');
          this.resetForm();
          this.isCreateFormVisible = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.showNotification('Failed to create table', 'error');
          console.error('Error creating table', err);
          this.isLoading = false;
        }
      });
    } else {
      this.tableForm.markAllAsTouched();
      this.showNotification('Please fix form errors', 'error');
    }
  }

  editTable(table: Table) {
    this.selectedTable = table;
    this.isEditMode = true;
    this.isCreateFormVisible = true;
    this.tableForm.patchValue({
      name: table.name,
      capacity: table.capacity,
      description: table.description
    });
    this.imagePreview = table.image || null;
  }

  updateTable() {
    if (this.tableForm.valid && this.selectedTable) {
      this.isLoading = true;
      const updateData = this.tableForm.value;
      
      this.tableService.updateTable(this.selectedTable.id, updateData).subscribe({
        next: (updatedTable) => {
          const index = this.tables.findIndex(t => t.id === updatedTable.id);
          if (index !== -1) {
            // Preserve the image path
            updatedTable.image = this.tables[index].image;
            this.tables[index] = updatedTable;
          }
          this.showNotification('Table updated successfully!');
          this.resetForm();
          this.isLoading = false;
        },
        error: (err) => {
          this.showNotification('Failed to update table', 'error');
          console.error('Error updating table', err);
          this.isLoading = false;
        }
      });
    } else {
      this.tableForm.markAllAsTouched();
      this.showNotification('Please fix form errors', 'error');
    }
  }

  deleteTable(tableId: string) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this table?')) {
      return;
    }

    this.isLoading = true;
    this.tableService.deleteTable(tableId).subscribe({
      next: () => {
        this.tables = this.tables.filter(t => t.id !== tableId);
        this.showNotification('Table deleted successfully!');
        this.isLoading = false;
      },
      error: (err) => {
        this.showNotification('Failed to delete table', 'error');
        console.error('Error deleting table', err);
        this.isLoading = false;
      }
    });
  }

  changeTableStatus(table: Table, status: 'available' | 'reserved') {
    this.isLoading = true;
    this.tableService.changeTableStatus(table.id, status).subscribe({
      next: (updatedTable) => {
        const index = this.tables.findIndex(t => t.id === updatedTable.id);
        if (index !== -1) {
          // Preserve the image path
          updatedTable.image = this.tables[index].image;
          this.tables[index] = updatedTable;
        }
        this.showNotification(`Table status changed to ${status}`);
        this.isLoading = false;
      },
      error: (err) => {
        this.showNotification('Failed to change table status', 'error');
        console.error('Error changing table status', err);
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.isEditMode = false;
    this.selectedTable = null;
    this.tableForm.reset();
    this.imageFile = null;
    this.imagePreview = null;
    this.isCreateFormVisible = false;
    this.errorMessage = null;
  }
}