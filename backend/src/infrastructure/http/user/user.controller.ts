import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../../../application/user/user.service';
import { AuthGuard } from '../auth/auth.guard';

type AuthRequest = Request & { user: { id: string; name: string } };

@UseGuards(AuthGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findContacts(@Req() req: AuthRequest) {
    return this.userService.getContactsWithSelf(req.user.id);
  }

  @Post('contacts')
  async addContact(@Req() req: AuthRequest, @Body('phone') phone: string) {
    return this.userService.addContactByPhone(req.user.id, phone);
  }
}
