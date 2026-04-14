import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../../../application/user/user.service';
import { AuthGuard } from '../auth/auth.guard';

type AuthRequest = Request & { user: { id: string; name: string } };

@UseGuards(AuthGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('children')
  getChildren(@Req() req: AuthRequest) {
    return this.userService.getChildren(req.user.id);
  }

  @Get('family')
  getFamilyContacts(@Req() req: AuthRequest) {
    return this.userService.getFamilyContacts(req.user.id);
  }

  @Get('friends')
  getFriendContacts(@Req() req: AuthRequest) {
    return this.userService.getFriendContacts(req.user.id);
  }

  @Post('children')
  createChild(@Req() req: AuthRequest, @Body('name') name: string) {
    return this.userService.createChild(name, req.user.id);
  }

  @Delete('children/:childId')
  deleteChild(@Req() req: AuthRequest, @Param('childId') childId: string) {
    return this.userService.deleteChild(childId, req.user.id);
  }

  @Patch('contacts/:contactId')
  updateContactType(
    @Req() req: AuthRequest,
    @Param('contactId') contactId: string,
    @Body('contactType') contactType: string,
  ) {
    return this.userService.updateContactType(req.user.id, contactId, contactType);
  }
}
