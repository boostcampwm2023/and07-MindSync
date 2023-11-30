import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user?.password !== password) return null;
    return { uuid: user.uuid, email: user.email };
  }

  async login(user: any) {
    const payload = { sub: user.uuid, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
