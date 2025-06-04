export interface User {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  countryCode?: string;
  role?: 'admin' | 'user';
  createdAt?: Date;
}
