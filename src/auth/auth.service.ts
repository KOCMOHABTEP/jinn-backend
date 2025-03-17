import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from '@/user/user.entity';
import { comparePasswords, hashPassword } from '@/utils/password.utils';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { firstName, lastName, login, email, password } = registerDto;
    const existingUser = await this.userRepository.findOneBy({ login });
    if (existingUser) {
      throw new Error('User with this login already exists');
    }

    const user = this.userRepository.create({
      firstName,
      lastName,
      login,
      email,
      password,
      role: 'user',
    });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<Partial<User>> {
    const { login, password } = loginDto;
    const user = await this.userRepository.findOneBy({ login });

    if (!user || !(await comparePasswords(password, user.password))) {
      throw new UnauthorizedException('Неверный пароль');
    }

    return instanceToPlain(user);
  }

  async createAdmin(adminDto: RegisterDto): Promise<Partial<User>> {
    const hashedPassword = await hashPassword(adminDto.password);

    const admin = this.userRepository.create({
      ...adminDto,
      password: hashedPassword,
      role: 'admin',
    });

    const savedAdmin = this.userRepository.save(admin);
    return instanceToPlain(savedAdmin);
  }
}
