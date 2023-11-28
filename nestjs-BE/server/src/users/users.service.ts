import { Injectable } from '@nestjs/common';

export type User = {
  uuid: string;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      uuid: '1',
      email: 'john',
      password: 'changeme',
    },
    {
      uuid: '2',
      email: 'maria',
      password: 'guess',
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
