import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseWithTwoFactorDto {
  @ApiProperty({
    description: 'Indicates whether two-factor authentication is required',
    example: true,
  })
  isTwoFactorRequired: boolean;

  @ApiProperty({
    description: 'The user ID (only provided if two-factor is required)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'JWT access token (only provided if two-factor is not required or already verified)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'Type of authentication token',
    example: 'Bearer',
    required: false,
  })
  tokenType?: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
    required: false,
  })
  expiresIn?: number;

  @ApiProperty({
    description: 'User information (only provided if two-factor is not required or already verified)',
    type: UserResponseDto,
    required: false,
  })
  user?: UserResponseDto;

  constructor(partial: Partial<AuthResponseWithTwoFactorDto>) {
    Object.assign(this, partial);
  }
}
