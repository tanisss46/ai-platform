import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthResponseWithTwoFactorDto } from './dto/auth-response-with-2fa.dto';
import { LoginWith2faDto } from './dto/two-factor/login-with-2fa.dto';
import { TwoFactorAuthService } from './two-factor/two-factor-auth.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from '../users/entities/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject(forwardRef(() => TwoFactorAuthService))
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      // Check if password matches
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        return user;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto | AuthResponseWithTwoFactorDto> {
    const { email, password } = loginDto;
    
    // Validate user credentials
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if 2FA is enabled for this user
    const isTwoFactorAuthEnabled = await this.twoFactorAuthService.isTwoFactorAuthEnabled(user.id);
    
    if (isTwoFactorAuthEnabled) {
      // If 2FA is enabled, don't generate a token yet. Return a response indicating 2FA is required.
      return new AuthResponseWithTwoFactorDto({
        isTwoFactorRequired: true,
        userId: user.id,
      });
    }
    
    // If 2FA is not enabled, proceed with normal login
    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);
    
    return this.createAuthResponse(user);
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    // Create the user
    const user = await this.usersService.create(createUserDto);
    
    return this.createAuthResponse(user);
  }

  private createAuthResponse(user: any): AuthResponseDto {
    // Create JWT payload
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    
    // Get token expiration time
    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);
    
    // Generate JWT token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${expiresIn}s`,
    });
    
    return new AuthResponseDto({
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: new UserResponseDto(user),
    });
  }

  async refreshToken(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);
    return this.createAuthResponse(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(email);
      
      // Generate a unique reset token
      const resetToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '30m', secret: this.configService.get<string>('JWT_RESET_SECRET') }
      );
      
      // Calculate expiration date (30 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      // Save the token in the database
      await this.passwordResetTokenRepository.save({
        token: resetToken,
        userId: user.id,
        expiresAt,
        isUsed: false,
      });
      
      // Send reset email
      this.notificationClient.emit('send-password-reset-email', {
        email: user.email,
        resetToken,
      });
      
      return { message: 'If an account with that email exists, a password reset link has been sent' };
    } catch (error) {
      // Don't reveal if email exists or not for security reasons
      if (error instanceof NotFoundException) {
        return { message: 'If an account with that email exists, a password reset link has been sent' };
      }
      
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password, passwordConfirm } = resetPasswordDto;
    
    // Check if passwords match
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    
    try {
      // Verify the token
      const tokenRecord = await this.passwordResetTokenRepository.findOne({
        where: { token, isUsed: false },
        relations: ['user'],
      });
      
      if (!tokenRecord) {
        throw new BadRequestException('Invalid or expired token');
      }
      
      // Check if token is expired
      if (new Date() > tokenRecord.expiresAt) {
        throw new BadRequestException('Token has expired');
      }
      
      // Update user's password
      const user = tokenRecord.user;
      
      // Hash the new password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Update user's password
      await this.usersService.update(user.id, { password: hashedPassword });
      
      // Mark token as used
      tokenRecord.isUsed = true;
      await this.passwordResetTokenRepository.save(tokenRecord);
      
      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  /**
   * Login with 2FA code after initial login
   */
  async loginWith2fa(loginWith2faDto: LoginWith2faDto): Promise<AuthResponseDto> {
    const { userId, twoFactorCode } = loginWith2faDto;
    
    // Verify the 2FA code
    try {
      const isValid = await this.twoFactorAuthService.verifyTwoFactorAuthToken(userId, twoFactorCode);
      
      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
      
      // Get the user
      const user = await this.usersService.findById(userId);
      
      // Update last login timestamp
      await this.usersService.updateLastLogin(user.id);
      
      // Generate a token and return auth response
      return this.createAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid two-factor authentication code');
    }
  }
}
