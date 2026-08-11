import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';

export const RENEWAL_REMINDER_QUEUE = 'renewal-reminder';

export interface RenewalReminderJobData {
  subscriptionId: string;
  stripeSubscriptionId: string;
  userEmail: string;
  currentPeriodEnd: string;
  daysRemaining: number;
}

@Processor(RENEWAL_REMINDER_QUEUE)
export class RenewalReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(RenewalReminderProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<RenewalReminderJobData>): Promise<void> {
    this.logger.log(`Processing BullMQ renewal reminder job #${job.id} for ${job.data.userEmail}`);

    const { userEmail, stripeSubscriptionId, currentPeriodEnd, daysRemaining } = job.data;

    if (!userEmail || userEmail === 'Unknown User') {
      this.logger.warn(`Skipping renewal email job #${job.id}: No valid email found.`);
      return;
    }

    await this.mailService.sendRenewalReminderEmail({
      to: userEmail,
      subscriptionId: stripeSubscriptionId,
      expiryDate: currentPeriodEnd,
      daysRemaining: daysRemaining || 7,
    });

    this.logger.log(`Completed renewal reminder job #${job.id} successfully.`);
  }
}
