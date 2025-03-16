import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';
import { Exclude, Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  fullName: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  profilePicture: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'User credits',
    example: 100,
  })
  credits: number;

  @ApiProperty({
    description: 'Subscription tier',
    example: 'free',
  })
  subscriptionTier: string;

  @ApiProperty({
    description: 'Subscription status',
    example: 'active',
  })
  subscriptionStatus: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Account status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Last login date',
    example: '2023-01-01T00:00:00.000Z',
  })
  lastLoginAt: Date;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  stripeCustomerId: string;

  @Exclude()
  subscriptionId: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
