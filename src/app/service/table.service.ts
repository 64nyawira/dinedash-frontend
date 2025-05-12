import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Table {
  id: string;
  name: string;
  capacity: number;
  description: string;
  status: 'available' | 'reserved';
  image?: string;
}

interface CreateTableRequest {
  name: string;
  capacity: number;
  description: string;
  image?: string;
}

interface UpdateTableRequest {
  name?: string;
  capacity?: number;
  description?: string;
  image?: string;
}

interface ChangeStatusRequest {
  tableId: string;
  status: 'available' | 'reserved';
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = 'https://dinedash-app.onrender.com/table';

  constructor(private http: HttpClient) {}

  // Create a new table
  createTable(data: CreateTableRequest): Observable<Table> {
    return this.http.post<Table>(`${this.apiUrl}/create`, data);
  }

  // Get all tables
  getAllTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/all`);
  }

  // Get available tables only
  getAvailableTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/available`);
  }

  // Update table details
  updateTable(tableId: string, data: UpdateTableRequest): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/update/${tableId}`, data);
  }

  // Delete a table
  deleteTable(tableId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${tableId}`);
  }

  // Change table status (available/reserved)
  changeTableStatus(tableId: string, status: 'available' | 'reserved'): Observable<Table> {
    const request: ChangeStatusRequest = { tableId, status };
    return this.http.post<Table>(`${this.apiUrl}/change-status`, request);
  }

  // Upload table image (if needed)
  uploadTableImage(formData: FormData): Observable<{message: string, imageUrl: string}> {
    return this.http.post<{message: string, imageUrl: string}>('http://localhost:3000/upload', formData);
  }
}