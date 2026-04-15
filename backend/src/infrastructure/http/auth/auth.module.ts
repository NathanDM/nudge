import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../application/auth/auth.service';
import { AuthGuard } from './auth.guard';
import { OptionalAuthGuard } from './optional-auth.guard';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nudge-dev-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    OptionalAuthGuard,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
  exports: [JwtModule, AuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
