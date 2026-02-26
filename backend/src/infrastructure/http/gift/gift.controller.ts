import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GiftService } from '../../../application/gift/gift.service';
import { CreateGiftDto } from '../../../application/gift/create-gift.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api')
@UseGuards(AuthGuard)
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get('users/:userId/gifts')
  async getGifts(@Param('userId') userId: string, @Req() req: any) {
    return this.giftService.getGiftsForUser(userId, req.user.id);
  }

  @Post('users/:userId/gifts')
  async createGift(
    @Param('userId') userId: string,
    @Body() dto: CreateGiftDto,
    @Req() req: any,
  ) {
    return this.giftService.createGift(userId, req.user.id, dto);
  }

  @Delete('gifts/:giftId')
  async deleteGift(@Param('giftId') giftId: string, @Req() req: any) {
    await this.giftService.deleteGift(giftId, req.user.id);
    return { success: true };
  }

  @Patch('gifts/:giftId/claim')
  async claimGift(@Param('giftId') giftId: string, @Req() req: any) {
    return this.giftService.claimGift(giftId, req.user.id);
  }

  @Patch('gifts/:giftId/unclaim')
  async unclaimGift(@Param('giftId') giftId: string, @Req() req: any) {
    return this.giftService.unclaimGift(giftId, req.user.id);
  }
}
