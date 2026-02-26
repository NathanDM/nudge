import { Controller, Get } from '@nestjs/common';
import { UserService } from '../../../application/user/user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
