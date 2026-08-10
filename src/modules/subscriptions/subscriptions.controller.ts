import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

export class CreateCheckoutDto {
  email!: string;
  priceId!: string;
  successUrl?: string;
  cancelUrl?: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionSchedulerService: SubscriptionSchedulerService,
  ) {}

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

  @Post('trigger-renewal-check')
  async triggerRenewalCheck(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days, 10) : 7;
    return this.subscriptionSchedulerService.checkExpiringSubscriptions(daysAhead);
  }
}
