import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';
import { TwoFactorAuth } from '../../users/entities/two-factor-auth.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    // Configure OTP library
    otplib.authenticator.options = {
      digits: 6,
      step: 30,
      window: 1, // Allow 1 step before and after for time drift
    };
  }

  /**
   * Generate a new 2FA secret for a user
   */
  async generateTwoFactorAuthSecret(userId: string): Promise<{ secret: string; otpAuthUrl: string; qrCodeDataURL: string }> {
    // First, make sure the user exists
    const user = await this.usersService.findById(userId);

    // Generate a new secret
    const secret = otplib.authenticator.generateSecret();

    // Create the URL for the QR code
    const appName = this.configService.get<string>('APP_NAME', 'AICloud');
    const otpAuthUrl = otplib.authenticator.keyuri(user.email, appName, secret);

    // Generate the QR code
    const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);

    // Check if user already has 2FA
    let twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });

    if (twoFactorAuth) {
      // Update the existing record
      twoFactorAuth.secret = secret;
      await this.twoFactorAuthRepository.save(twoFactorAuth);
    } else {
      // Create a new record
      twoFactorAuth = this.twoFactorAuthRepository.create({
        userId,
        secret,
        isEnabled: false,
      });
      await this.twoFactorAuthRepository.save(twoFactorAuth);
    }

    return {
      secret,
      otpAuthUrl,
      qrCodeDataURL,
    };
  }

  /**
   * Enable 2FA for a user
   */
  async enableTwoFactorAuth(userId: string, token: string): Promise<boolean> {
    // Find the 2FA record
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });

    if (!twoFactorAuth) {
      throw new NotFoundException('Two-factor authentication not set up for this user');
    }

    // Verify the token
    const isValid = otplib.authenticator.verify({
      token,
      secret: twoFactorAuth.secret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid authentication code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Enable 2FA
    twoFactorAuth.isEnabled = true;
    twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return true;
  }

  /**
   * Verify a 2FA token
   */
  async verifyTwoFactorAuthToken(userId: string, token: string): Promise<boolean> {
    // Find the 2FA record
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });

    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      throw new NotFoundException('Two-factor authentication not enabled for this user');
    }

    // Check if this is a backup code
    if (token.length === 8) {
      return this.verifyBackupCode(userId, token);
    }

    // Verify the token
    const isValid = otplib.authenticator.verify({
      token,
      secret: twoFactorAuth.secret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    return true;
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactorAuth(userId: string, token: string): Promise<boolean> {
    // Verify the token first
    await this.verifyTwoFactorAuthToken(userId, token);

    // Find the 2FA record
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });
    
    if (!twoFactorAuth) {
      throw new NotFoundException('Two-factor authentication not found for this user');
    }

    // Disable 2FA
    twoFactorAuth.isEnabled = false;
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return true;
  }

  /**
   * Check if 2FA is enabled for a user
   */
  async isTwoFactorAuthEnabled(userId: string): Promise<boolean> {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });
    return twoFactorAuth?.isEnabled || false;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup code
      const code = crypto.randomBytes(4).toString('hex');
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify a backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });
    
    if (!twoFactorAuth || !twoFactorAuth.backupCodes) {
      return false;
    }

    const backupCodes = JSON.parse(twoFactorAuth.backupCodes);
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      throw new UnauthorizedException('Invalid backup code');
    }

    // Remove the used backup code
    backupCodes.splice(codeIndex, 1);
    twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return true;
  }

  /**
   * Get backup codes for a user
   */
  async getBackupCodes(userId: string): Promise<string[]> {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({ where: { userId } });
    
    if (!twoFactorAuth || !twoFactorAuth.backupCodes) {
      throw new NotFoundException('No backup codes found for this user');
    }

    return JSON.parse(twoFactorAuth.backupCodes);
  }
}
