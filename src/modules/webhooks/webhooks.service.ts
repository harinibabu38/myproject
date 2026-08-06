import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { SubscriptionStatus } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
  ) {}

  async handleStripeWebhook(rawBody: Buffer | string, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe Webhook Event: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (session.mode !== 'subscription') return;

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const userIdFromMeta = session.metadata?.userId;

    let user = userIdFromMeta
      ? await this.usersService.findById(userIdFromMeta)
      : await this.usersService.findByStripeCustomerId(customerId);

    if (!user) {
      this.logger.error(`User not found for customerId: ${customerId}`);
      return;
    }

    const stripeSub = await this.stripeService.retrieveSubscription(subscriptionId);
    const item = stripeSub.items.data[0];

    const subAny = stripeSub as any;
    await this.subscriptionsService.saveOrUpdateSubscription({
      userId: user.id,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status as SubscriptionStatus,
      priceId: item?.price.id || 'unknown',
      currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : undefined,
      currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : undefined,
    });

    this.logger.log(`Successfully processed subscription checkout for user ${user.id}`);
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
    const customerId = stripeSub.customer as string;
    const user = await this.usersService.findByStripeCustomerId(customerId);

    if (!user) {
      this.logger.error(`User not found for customerId: ${customerId}`);
      return;
    }

    const item = stripeSub.items.data[0];
    const subAny = stripeSub as any;

    await this.subscriptionsService.saveOrUpdateSubscription({
      userId: user.id,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status as SubscriptionStatus,
      priceId: item?.price.id || 'unknown',
      currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : undefined,
      currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : undefined,
    });

    this.logger.log(`Updated subscription ${stripeSub.id} to status ${stripeSub.status}`);
  }
}
