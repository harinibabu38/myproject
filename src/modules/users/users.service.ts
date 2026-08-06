import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { stripeCustomerId } });
  }

  async findOrCreateUser(email: string): Promise<User> {
    let user = await this.findByEmail(email);
    if (!user) {
      user = this.userRepository.create({ email });
      await this.userRepository.save(user);
    }
    return user;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    await this.userRepository.update(userId, { stripeCustomerId });
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }
}
