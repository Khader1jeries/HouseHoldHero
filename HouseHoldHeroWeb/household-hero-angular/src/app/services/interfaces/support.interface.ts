// src/app/services/interfaces/support.interface.ts
export interface Message {
  id?: string; // Optional ID from Firestore
  to: string; // Recipient email
  from: string; // Sender email
  subject: string; // Message subject
  message?: string; // Message content (backend expects 'message')
  content?: string; // Alternative property for frontend use
  reply: string | null; // Reply content
  createdAt: any; // Timestamp
  read?: boolean; // Read status
  sender?: string; // Display name of sender
  timestamp?: Date; // Converted timestamp for display
}
