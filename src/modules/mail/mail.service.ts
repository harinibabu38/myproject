import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendPaymentConfirmationOptions {
  to: string;
  subscriptionId: string;
  priceId: string;
  amount: number;
  currency: string;
  invoiceId: string;
  invoiceNumber: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'sandbox.smtp.mailtrap.io';
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || '2525', 10);
    const user = this.configService.get<string>('SMTP_USER') || 'mailtrap_user_placeholder';
    const pass = this.configService.get<string>('SMTP_PASS') || 'mailtrap_pass_placeholder';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendPaymentConfirmationEmail(options: SendPaymentConfirmationOptions): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || '"AI SaaS Platform" <noreply@aisaassample.com>';
    const appPort = this.configService.get<string>('PORT') || '3000';
    const invoiceDownloadUrl = `http://localhost:${appPort}/invoices/${options.invoiceId}/download`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 1px solid #eeeeee; padding-bottom: 20px; }
          .header h1 { color: #1a56db; margin: 0; }
          .content { padding: 20px 0; color: #333333; line-height: 1.6; }
          .details-card { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .btn { display: inline-block; background-color: #1a56db; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
          .footer { text-align: center; color: #888888; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to AI SaaS Platform!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for subscribing! Your payment has been successfully processed, and your subscription is now active.</p>

            <div class="details-card">
              <h3 style="margin-top: 0; color: #1a56db;">Subscription Summary</h3>
              <p><strong>Plan / Price ID:</strong> ${options.priceId}</p>
              <p><strong>Subscription ID:</strong> ${options.subscriptionId}</p>
              <p><strong>Amount Paid:</strong> $${options.amount.toFixed(2)} ${options.currency.toUpperCase()}</p>
              <p><strong>Invoice Number:</strong> ${options.invoiceNumber}</p>
            </div>

            <p>You can view or download your official PDF invoice anytime using the link below:</p>
            <div style="text-align: center;">
              <a href="${invoiceDownloadUrl}" class="btn" target="_blank">Download PDF Invoice</a>
            </div>
          </div>
          <div class="footer">
            <p>If you have any questions, reply to this email or contact support@aisaassample.com</p>
            <p>&copy; ${new Date().getFullYear()} AI SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: `Payment Confirmation & Welcome - ${options.invoiceNumber}`,
        html: htmlContent,
      });

      this.logger.log(`Payment confirmation email sent to ${options.to} [MessageId: ${info.messageId}]`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send payment confirmation email to ${options.to}: ${err.message}`);
      return false;
    }
  }
}
