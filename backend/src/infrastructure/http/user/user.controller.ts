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

  @Post('contacts')
  addContact(
    @Req() req: AuthRequest,
    @Body('phone') phone: string,
    @Body('contactType') contactType?: 'family' | 'friend',
  ) {
    return this.userService.addContactByPhone(req.user.id, phone, contactType);
  }

  @Post('children')
  createChild(@Req() req: AuthRequest, @Body('name') name: string) {
    return this.userService.createChild(name, req.user.id);
  }

  @Delete('children/:childId')
  deleteChild(@Req() req: AuthRequest, @Param('childId') childId: string) {
    return this.userService.deleteChild(childId, req.user.id);
  }

  @Delete('contacts/:contactId')
  removeContact(@Req() req: AuthRequest, @Param('contactId') contactId: string) {
    return this.userService.removeContact(req.user.id, contactId);
  }

  @Patch('contacts/:contactId')
  updateContactType(
    @Req() req: AuthRequest,
    @Param('contactId') contactId: string,
    @Body('contactType') contactType: string,
  ) {
    return this.userService.updateContactType(req.user.id, contactId, contactType);
  }

  @Get('share-token')
  getShareToken(@Req() req: AuthRequest) {
    return this.userService.getShareToken(req.user.id);
  }

  @Post('share-token')
  generateShareToken(@Req() req: AuthRequest) {
    return this.userService.generateShareToken(req.user.id);
  }

  @Delete('share-token')
  revokeShareToken(@Req() req: AuthRequest) {
    return this.userService.revokeShareToken(req.user.id);
  }

  @Get('children/:childId/share-token')
  getChildShareToken(@Req() req: AuthRequest, @Param('childId') childId: string) {
    return this.userService.getChildShareToken(childId, req.user.id);
  }

  @Post('children/:childId/share-token')
  generateChildShareToken(@Req() req: AuthRequest, @Param('childId') childId: string) {
    return this.userService.generateChildShareToken(childId, req.user.id);
  }

  @Delete('children/:childId/share-token')
  revokeChildShareToken(@Req() req: AuthRequest, @Param('childId') childId: string) {
    return this.userService.revokeChildShareToken(childId, req.user.id);
  }
}
