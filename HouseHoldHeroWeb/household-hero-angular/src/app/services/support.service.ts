// src/app/services/support.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { Message } from './interfaces/support.interface';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  sendMessage(message: Message): Observable<any> {
    // Map frontend 'content' to backend 'message' if needed
    const payload = {
      to: message.to,
      from: message.from,
      subject: message.subject,
      message: message.message || message.content, // Handle both property names
      reply: message.reply || null,
    };

    return this.http.post<any>(`${this.apiUrl}/`, payload);
  }

  getMessages(adminEmail: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${adminEmail}`).pipe(
      map((messages: any[]) => {
        // Ensure each message has an ID
        return messages.map((msg) => ({
          ...msg,
          id: msg.id || msg._id, // Handle different ID property names
          content: msg.message || msg.content, // Map backend 'message' to frontend 'content'
        }));
      })
    );
  }

  // Reply to a message by updating the reply field
  replyToMessage(messageId: string, replyContent: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${messageId}/reply`, {
      reply: replyContent,
    });
  }

  // Optional: Add methods for marking messages as read and deleting messages
  markAsRead(messageId: string): Observable<any> {
    // This would need a corresponding backend endpoint
    return this.http.patch(`${this.apiUrl}/${messageId}/read`, {});
  }

  deleteMessage(messageId: string): Observable<any> {
    // This would need a corresponding backend endpoint
    return this.http.delete(`${this.apiUrl}/${messageId}`);
  }
}
