import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { UserService } from './user.service';

export interface Family {
  id?: string;
  name: string;
  admin: string;
  members?: string[];
  createdAt?: Date;
  familyCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  private apiUrl = `${environment.apiUrl}/families`;

  constructor(private http: HttpClient, private userService: UserService) {}

  // Create a new family
  createFamily(familyName: string): Observable<any> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.uid) {
      return of({ success: false, message: 'User not logged in' });
    }

    return this.http
      .post<any>(`${this.apiUrl}/create`, {
        name: familyName,
        admin: currentUser.uid,
      })
      .pipe(
        catchError((error) => {
          console.error('Error creating family:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to create family',
          });
        })
      );
  }

  // Join an existing family
  joinFamily(familyCode: string): Observable<any> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.uid) {
      return of({ success: false, message: 'User not logged in' });
    }

    return this.http
      .post<any>(`${this.apiUrl}/join`, {
        familyCode,
        userId: currentUser.uid,
      })
      .pipe(
        catchError((error) => {
          console.error('Error joining family:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to join family',
          });
        })
      );
  }

  // Get family details
  getFamilyDetails(familyId?: string): Observable<Family> {
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      return new Observable((observer) => {
        observer.error('No family ID available');
      });
    }

    return this.http.get<Family>(`${this.apiUrl}/${targetFamilyId}`).pipe(
      catchError((error) => {
        console.error('Error fetching family details:', error);
        throw error;
      })
    );
  }

  // Update family details
  updateFamily(familyId: string, updates: Partial<Family>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${familyId}`, updates).pipe(
      catchError((error) => {
        console.error('Error updating family:', error);
        return of({
          success: false,
          message: error.error?.message || 'Failed to update family',
        });
      })
    );
  }

  // Leave family
  leaveFamily(familyId?: string): Observable<any> {
    const currentUser = this.userService.getCurrentUser();
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!currentUser?.uid || !targetFamilyId) {
      return of({ success: false, message: 'Invalid user or family ID' });
    }

    return this.http
      .post<any>(`${this.apiUrl}/${targetFamilyId}/leave`, {
        userId: currentUser.uid,
      })
      .pipe(
        catchError((error) => {
          console.error('Error leaving family:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to leave family',
          });
        })
      );
  }

  // Delete family (admin only)
  deleteFamily(familyId?: string): Observable<any> {
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      return of({ success: false, message: 'No family ID available' });
    }

    return this.http.delete<any>(`${this.apiUrl}/${targetFamilyId}`).pipe(
      catchError((error) => {
        console.error('Error deleting family:', error);
        return of({
          success: false,
          message: error.error?.message || 'Failed to delete family',
        });
      })
    );
  }

  // Get family members
  getFamilyMembers(familyId?: string): Observable<any[]> {
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      return new Observable((observer) => {
        observer.error('No family ID available');
      });
    }

    return this.http
      .get<any[]>(`${this.apiUrl}/${targetFamilyId}/members`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching family members:', error);
          throw error;
        })
      );
  }

  // Invite member to family
  inviteMember(email: string, familyId?: string): Observable<any> {
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      return of({ success: false, message: 'No family ID available' });
    }

    return this.http
      .post<any>(`${this.apiUrl}/${targetFamilyId}/invite`, {
        email,
      })
      .pipe(
        catchError((error) => {
          console.error('Error inviting member:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to invite member',
          });
        })
      );
  }

  // Remove member from family (admin only)
  removeMember(memberId: string, familyId?: string): Observable<any> {
    const targetFamilyId = familyId || this.userService.getFamilyId();

    if (!targetFamilyId) {
      return of({ success: false, message: 'No family ID available' });
    }

    return this.http
      .post<any>(`${this.apiUrl}/${targetFamilyId}/remove-member`, {
        memberId,
      })
      .pipe(
        catchError((error) => {
          console.error('Error removing member:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to remove member',
          });
        })
      );
  }
}
