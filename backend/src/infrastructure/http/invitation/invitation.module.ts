import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from '../../../application/invitation/invitation.service';
import { AuthModule } from '../auth/auth.module';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';

@Module({
  imports: [AuthModule],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
})
export class InvitationModule {}
