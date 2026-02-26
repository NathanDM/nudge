import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../../application/auth/auth.service';
import { LoginDto } from '../../../application/auth/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.userId, dto.pin);
  }
}
