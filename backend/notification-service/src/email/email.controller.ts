import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendPasswordResetEmailDto } from './dto/send-password-reset-email.dto';
import { SendWelcomeEmailDto } from './dto/send-welcome-email.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @MessagePattern({ cmd: 'send-password-reset-email' })
  async sendPasswordResetEmail(
    @Payload() data: SendPasswordResetEmailDto,
  ): Promise<boolean> {
    return this.emailService.sendPasswordResetEmail(data.email, data.resetToken);
  }

  @MessagePattern({ cmd: 'send-welcome-email' })
  async sendWelcomeEmail(
    @Payload() data: SendWelcomeEmailDto,
  ): Promise<boolean> {
    return this.emailService.sendWelcomeEmail(data.email, data.name);
  }
}
