import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  username: string;
  password: string;
  coins: number;
};

@Injectable()
export class UsersService {
  users: User[] = [
    { id: 1, username: 'bob', password: 'bob', coins: 100 },
    { id: 2, username: 'help', password: 'help', coins: 105 },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => {
      return user.username == username;
    });
  }
}
