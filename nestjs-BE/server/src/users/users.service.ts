import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

export type User = {
  uuid: string;
  email: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  createOne(email: string) {
    this.users.push({ uuid: v4(), email });
  }
}
