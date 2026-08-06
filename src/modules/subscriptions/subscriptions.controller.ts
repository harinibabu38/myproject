import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

export class CreateCheckoutDto {
  email!: string;
  priceId!: string;
  successUrl?: string;
  cancelUrl?: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.subscriptionsService.createCheckoutSession(
      dto.email,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Get('user/:userId')
  async getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }
}
