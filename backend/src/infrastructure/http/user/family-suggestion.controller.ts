import { Controller, Get, Post, Param, ParseUUIDPipe, HttpCode, UseGuards, Req } from '@nestjs/common';
import { FamilySuggestionService } from '../../../application/user/family-suggestion.service';
import { AuthGuard, AuthRequest } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/users/family/suggestions')
export class FamilySuggestionController {
  constructor(private readonly service: FamilySuggestionService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.service.list(req.user.id);
  }

  @Post(':contactId/accept')
  @HttpCode(204)
  accept(@Req() req: AuthRequest, @Param('contactId', ParseUUIDPipe) contactId: string) {
    return this.service.accept(req.user.id, contactId);
  }

  @Post(':contactId/dismiss')
  @HttpCode(204)
  dismiss(@Req() req: AuthRequest, @Param('contactId', ParseUUIDPipe) contactId: string) {
    return this.service.dismiss(req.user.id, contactId);
  }
}
