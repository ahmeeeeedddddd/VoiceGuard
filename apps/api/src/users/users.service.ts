import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/user.entity';
import { Role } from '@voiceguard/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@voiceguard.ai';
    const existingAdmin = await this.findByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      await this.create('Admin', adminEmail, Role.ADMIN, 'admin123');
    }
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'] // specifically include password for auth
    });
  }

  async create(name: string, email: string, role: Role, password?: string): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = this.userRepository.create({ 
      name, 
      email, 
      role, 
      password: hashedPassword 
    });
    return this.userRepository.save(user);
  }

  async updateRole(id: string, role: Role): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }
}
