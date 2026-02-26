import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository';
import { LoginResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(userId: string, pin: string): Promise<LoginResponseDto> {
    const user = await this.userRepo.findByIdWithPin(userId);
    if (!user || user.pin !== pin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, name: user.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, name: user.name },
    };
  }
}
