import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
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

  async login(phone: string, pin: string): Promise<LoginResponseDto> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const user = await this.userRepo.findByPhone(lastEight);
    if (!user || user.pin !== pin) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, name: user.name };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user: { id: user.id, name: user.name } };
  }

  async register(name: string, phone: string, pin: string): Promise<LoginResponseDto> {
    const lastEight = phone.replace(/\D/g, '').slice(-8);
    const existing = await this.userRepo.findByPhone(lastEight);
    if (existing) throw new ConflictException('Phone already in use');
    const user = await this.userRepo.create(name, phone, pin);
    const payload = { sub: user.id, name: user.name };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user: { id: user.id, name: user.name } };
  }
}
