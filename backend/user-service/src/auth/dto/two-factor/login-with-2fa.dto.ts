import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWith2faDto {
  @ApiProperty({
    description: 'User ID from the initial login step',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The 6-digit code from authenticator app or 8-character backup code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 8)
  twoFactorCode: string;
}
