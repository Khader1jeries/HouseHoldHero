import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Message } from './interfaces/support.interface';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  getMessagesForAdmin(adminEmail: string) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.apiUrl}/messages`;
  constructor(private http: HttpClient) {}

  sendMessage(message: Message): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, message);
  }
  getMessages(adminEmail: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${adminEmail}`);
  }
}
