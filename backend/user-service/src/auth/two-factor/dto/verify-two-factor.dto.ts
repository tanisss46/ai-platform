import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorAuthDto {
  @ApiProperty({
    description: 'The 6-digit code from the authenticator app or 8-character backup code',
    example: '123456',
    minLength: 6,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(8)
  token: string;
}
