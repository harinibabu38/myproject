import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

 
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRenewalCheck() {
    this.logger.log('Starting daily scheduled check for expiring subscriptions...');
    await this.checkExpiringSubscriptions(7);
  }

  async checkExpiringSubscriptions(daysAhead: number = 7) {
    const expiringSubs = await this.subscriptionsService.findExpiringSubscriptions(daysAhead);
    this.logger.log(`Found ${expiringSubs.length} subscription(s) expiring within ${daysAhead} days.`);

    for (const sub of expiringSubs) {
      const userEmail = sub.user?.email || 'Unknown User';
      this.logger.log(
        `[Renewal Reminder Event] Subscription ${sub.stripeSubscriptionId} for ${userEmail} expires on ${sub.currentPeriodEnd}`,
      );
      
    }

    return {
      count: expiringSubs.length,
      expiringSubscriptions: expiringSubs,
    };
  }
}
