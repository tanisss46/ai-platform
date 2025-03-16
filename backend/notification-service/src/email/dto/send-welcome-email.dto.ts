import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendWelcomeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
