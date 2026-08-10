import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { UsersService } from '../users/users.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
  ) {}

  async createCheckoutSession(email: string, priceId: string, successUrl?: string, cancelUrl?: string) {
    const user = await this.usersService.findOrCreateUser(email);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripeService.createCustomer(email);
      customerId = customer.id;
      await this.usersService.updateStripeCustomerId(user.id, customerId);
    }

    const defaultSuccess = successUrl || 'http://localhost:3000/success';
    const defaultCancel = cancelUrl || 'http://localhost:3000/cancel';

    const session = await this.stripeService.createCheckoutSession(
      customerId,
      priceId,
      defaultSuccess,
      defaultCancel,
      { userId: user.id },
    );

    return { sessionId: session.id, url: session.url };
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({ where: { stripeSubscriptionId } });
  }

  async saveOrUpdateSubscription(data: {
    userId: string;
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    priceId: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }): Promise<Subscription> {
    let subscription = await this.findByStripeSubscriptionId(data.stripeSubscriptionId);
    if (!subscription) {
      subscription = this.subscriptionRepository.create(data);
    } else {
      Object.assign(subscription, data);
    }
    return this.subscriptionRepository.save(subscription);
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ where: { userId } });
  }

  async findExpiringSubscriptions(daysAhead: number = 7): Promise<Subscription[]> {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysAhead);

    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: Between(now, targetDate),
      },
      relations: { user: true },
    });
  }
}
