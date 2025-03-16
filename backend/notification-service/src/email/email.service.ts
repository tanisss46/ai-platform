import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor(private readonly configService: ConfigService) {
    // Configure email transporter
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    };

    // Check if email settings are configured
    if (
      !emailConfig.host ||
      !emailConfig.auth.user ||
      !emailConfig.auth.pass
    ) {
      this.logger.warn(
        'Email service not fully configured. Using development mode.',
      );
      
      // In development mode, use a test account or ethereal.email
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email', // These won't work - ethereal.email generates test accounts
          pass: 'ethereal.password',
        },
      });
      
      // Alternatively, use the preview option for local development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true, // For development - outputs emails to the console
      });
    } else {
      // For production, use the configured SMTP settings
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetPasswordUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@aiplatform.com'),
        to: email,
        subject: 'Reset Your AI Platform Password',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${frontendUrl}/logo.png" alt="AI Platform Logo" style="max-width: 150px;">
            </div>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
              <p style="margin-bottom: 15px;">We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetPasswordUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p style="margin-bottom: 5px;">If the button doesn't work, you can paste this link into your browser:</p>
              <p style="background-color: #eeeeee; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 14px;">
                <a href="${resetPasswordUrl}" style="color: #4f46e5; text-decoration: none;">${resetPasswordUrl}</a>
              </p>
              <p style="margin-top: 15px;">This password reset link is only valid for 30 minutes.</p>
              <p style="margin-top: 25px; margin-bottom: 5px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} AI Platform. All rights reserved.</p>
              <p>123 AI Street, Tech City, TC 12345</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}: ${info.messageId}`);
      
      // For development - log email preview URL from Ethereal
      if (info.ethereal) {
        this.logger.log(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${email}: ${error.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@aiplatform.com'),
        to: email,
        subject: 'Welcome to AI Platform!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${frontendUrl}/logo.png" alt="AI Platform Logo" style="max-width: 150px;">
            </div>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to AI Platform, ${name}!</h2>
              <p style="margin-bottom: 15px;">Thank you for joining our community of AI enthusiasts and creators.</p>
              <p style="margin-bottom: 15px;">With AI Platform, you can:</p>
              <ul style="margin-bottom: 15px;">
                <li>Access state-of-the-art AI models without local setup</li>
                <li>Store and organize all your AI-generated content</li>
                <li>Create complex workflows combining multiple AI tools</li>
                <li>Collaborate with team members on creative projects</li>
              </ul>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${frontendUrl}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
              </div>
              <p style="margin-top: 15px;">We've credited your account with <strong>50 free credits</strong> to help you get started. Explore our AI tools and start creating!</p>
              <p style="margin-top: 25px; margin-bottom: 5px;">If you have any questions, check out our <a href="${frontendUrl}/help" style="color: #4f46e5; text-decoration: none;">Help Center</a> or contact our support team.</p>
            </div>
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} AI Platform. All rights reserved.</p>
              <p>123 AI Street, Tech City, TC 12345</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}: ${info.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${email}: ${error.message}`);
      return false;
    }
  }
}
