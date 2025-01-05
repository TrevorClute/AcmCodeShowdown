import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private path = 'localhost:3000/auth';
  private jwt = '';
  constructor(private http: HttpClient) {}
}
