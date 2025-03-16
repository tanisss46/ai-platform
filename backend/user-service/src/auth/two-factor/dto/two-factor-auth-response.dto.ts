import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthSecretResponseDto {
  @ApiProperty({
    description: 'The secret key for two-factor authentication',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'The OTP Auth URL for QR code generation',
    example: 'otpauth://totp/AICloud:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AICloud',
  })
  otpAuthUrl: string;

  @ApiProperty({
    description: 'Data URL of QR code for scanning with authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  qrCodeDataURL: string;
}

export class TwoFactorAuthStatusResponseDto {
  @ApiProperty({
    description: 'Indicates if two-factor authentication is enabled',
    example: true,
  })
  isEnabled: boolean;
}

export class BackupCodesResponseDto {
  @ApiProperty({
    description: 'Backup codes for two-factor authentication',
    example: ['12345678', '23456789', '34567890'],
    type: [String],
  })
  backupCodes: string[];
}
