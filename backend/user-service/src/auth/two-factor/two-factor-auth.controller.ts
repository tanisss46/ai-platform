import { Controller, Post, Body, Get, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { EnableTwoFactorAuthDto } from './dto/enable-two-factor.dto';
import { VerifyTwoFactorAuthDto } from './dto/verify-two-factor.dto';
import { TwoFactorAuthSecretResponseDto, TwoFactorAuthStatusResponseDto, BackupCodesResponseDto } from './dto/two-factor-auth-response.dto';

@ApiTags('two-factor-auth')
@Controller('auth/2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @ApiOperation({ summary: 'Generate a new 2FA secret' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the 2FA secret and QR code', 
    type: TwoFactorAuthSecretResponseDto 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('generate')
  async generateTwoFactorAuthSecret(@Request() req): Promise<TwoFactorAuthSecretResponseDto> {
    return this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user.id);
  }

  @ApiOperation({ summary: 'Enable 2FA for the user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns backup codes for 2FA', 
    type: BackupCodesResponseDto 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('enable')
  @HttpCode(200)
  async enableTwoFactorAuth(
    @Request() req, 
    @Body() enableTwoFactorAuthDto: EnableTwoFactorAuthDto
  ): Promise<BackupCodesResponseDto> {
    await this.twoFactorAuthService.enableTwoFactorAuth(req.user.id, enableTwoFactorAuthDto.token);
    const backupCodes = await this.twoFactorAuthService.getBackupCodes(req.user.id);
    return { backupCodes };
  }

  @ApiOperation({ summary: 'Verify a 2FA token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(200)
  async verifyTwoFactorAuthToken(
    @Request() req, 
    @Body() verifyTwoFactorAuthDto: VerifyTwoFactorAuthDto
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.twoFactorAuthService.verifyTwoFactorAuthToken(
      req.user.id, 
      verifyTwoFactorAuthDto.token
    );
    return { isValid };
  }

  @ApiOperation({ summary: 'Disable 2FA for the user' })
  @ApiResponse({ status: 200, description: '2FA has been disabled' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('disable')
  @HttpCode(200)
  async disableTwoFactorAuth(
    @Request() req, 
    @Body() verifyTwoFactorAuthDto: VerifyTwoFactorAuthDto
  ): Promise<{ success: boolean }> {
    const success = await this.twoFactorAuthService.disableTwoFactorAuth(
      req.user.id, 
      verifyTwoFactorAuthDto.token
    );
    return { success };
  }

  @ApiOperation({ summary: 'Check if 2FA is enabled for the user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns 2FA status', 
    type: TwoFactorAuthStatusResponseDto 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async isTwoFactorAuthEnabled(@Request() req): Promise<TwoFactorAuthStatusResponseDto> {
    const isEnabled = await this.twoFactorAuthService.isTwoFactorAuthEnabled(req.user.id);
    return { isEnabled };
  }

  @ApiOperation({ summary: 'Get backup codes for the user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns backup codes', 
    type: BackupCodesResponseDto 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('backup-codes')
  async getBackupCodes(@Request() req): Promise<BackupCodesResponseDto> {
    const backupCodes = await this.twoFactorAuthService.getBackupCodes(req.user.id);
    return { backupCodes };
  }
}
