import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {
    this.username = '';
    this.coins = 0;
  }
  username: string;
  coins: number;

  loadData(): void {}
}
