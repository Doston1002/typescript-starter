import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Direktor, DirektorDocument } from './direktor.schema';

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @InjectModel(Direktor.name) private direktorModel: Model<DirektorDocument>,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'polatovdoston1002@gmail.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Doston1002!';

    if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
      return { email: body.email, role: 'admin' };
    }

    const direktor = await this.direktorModel.findOne({ email: body.email, password: body.password }).exec();
    if (direktor) {
      return { email: direktor.email, role: 'direktor' };
    }

    throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
  }
}
