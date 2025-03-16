import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException(`User with email "${createUserDto.email}" already exists`);
    }
    
    // Create a new user entity
    const user = this.usersRepository.create(createUserDto);
    
    // Save the user to the database
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Find the user to update
    const user = await this.findById(id);
    
    // Check if email is being updated and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: updateUserDto.email }
      });
      
      if (existingUser) {
        throw new ConflictException(`User with email "${updateUserDto.email}" already exists`);
      }
    }
    
    // Update the user entity
    Object.assign(user, updateUserDto);
    
    // Save the updated user
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async updateCredits(id: string, credits: number): Promise<User> {
    const user = await this.findById(id);
    
    if (credits < 0 && user.credits + credits < 0) {
      throw new BadRequestException('Insufficient credits');
    }
    
    user.credits += credits;
    return this.usersRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = await this.findById(id);
    user.lastLoginAt = new Date();
    return this.usersRepository.save(user);
  }

  async updateSubscription(
    id: string, 
    tier: string, 
    status: string, 
    subscriptionId?: string
  ): Promise<User> {
    const user = await this.findById(id);
    
    user.subscriptionTier = tier;
    user.subscriptionStatus = status;
    
    if (subscriptionId) {
      user.subscriptionId = subscriptionId;
    }
    
    return this.usersRepository.save(user);
  }
}
