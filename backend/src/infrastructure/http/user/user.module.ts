import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FamilySuggestionController } from './family-suggestion.controller';
import { UserService } from '../../../application/user/user.service';
import { FamilySuggestionService } from '../../../application/user/family-suggestion.service';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { FAMILY_SUGGESTION_REPOSITORY } from '../../../domain/user/family-suggestion.repository';
import { DrizzleUserRepository } from '../../repositories/drizzle-user.repository';
import { DrizzleFamilySuggestionRepository } from '../../repositories/drizzle-family-suggestion.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController, FamilySuggestionController],
  providers: [
    UserService,
    FamilySuggestionService,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: FAMILY_SUGGESTION_REPOSITORY, useClass: DrizzleFamilySuggestionRepository },
  ],
})
export class UserModule {}
