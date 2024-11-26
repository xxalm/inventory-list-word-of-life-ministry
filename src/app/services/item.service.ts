import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obter lista de itens
  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }

  // Enviar itens selecionados
  submitSelection(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }
}
