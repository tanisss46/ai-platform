import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendPasswordResetEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  resetToken: string;
}
