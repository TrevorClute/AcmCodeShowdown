import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly url = 'localhost:3000';
  constructor(private http: HttpClient) {
    this.jwt = '';
    this.username = '';
    this.coins = 0;
    let cache: string | null = localStorage.getItem('AcmContestjwt');
    if (cache) {
      let parsedCache = JSON.parse(cache);
      this.jwt = parsedCache.jwt;
    }
  }
  jwt: any;
  username: string;
  coins: number;
  signIn(username: string, password: string): boolean {
    this.http.get(this.url).subscribe((response) => {
      return false;
    });
    return true;
  }
}
