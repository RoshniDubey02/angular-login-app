import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Dummy user for demo purpose
  private dummyUser = {
    email: 'admin@test.com',
    password: '123456'
  };

  login(email: string, password: string): boolean {
    if (
      email === this.dummyUser.email &&
      password === this.dummyUser.password
    ) {
      localStorage.setItem('token', 'dummy-token');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}