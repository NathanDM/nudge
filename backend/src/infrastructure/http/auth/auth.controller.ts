import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../../application/auth/auth.service';
import { LoginDto, RegisterDto } from '../../../application/auth/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.pin);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.phone, dto.pin);
  }
}
