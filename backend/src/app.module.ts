import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/http/auth/auth.module';
import { UserModule } from './infrastructure/http/user/user.module';
import { GiftModule } from './infrastructure/http/gift/gift.module';
import { InvitationModule } from './infrastructure/http/invitation/invitation.module';
import { PublicModule } from './infrastructure/http/public/public.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, GiftModule, InvitationModule, PublicModule],
})
export class AppModule {}
