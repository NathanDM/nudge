import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthRequest } from '../auth/auth.guard';
import { InvitationService } from '../../../application/invitation/invitation.service';

@Controller('api/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(AuthGuard)
  @Post()
  async generate(@Req() req: AuthRequest) {
    const token = await this.invitationService.generate(req.user.id);
    return { token };
  }

  @Get(':token')
  getInviter(@Param('token') token: string) {
    return this.invitationService.verify(token);
  }

  @UseGuards(AuthGuard)
  @Post(':token/accept')
  accept(@Param('token') token: string, @Req() req: AuthRequest) {
    return this.invitationService.accept(token, req.user.id);
  }
}
