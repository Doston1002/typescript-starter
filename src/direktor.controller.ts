import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Direktor, DirektorDocument } from './direktor.schema';

@Controller('direktors')
export class DirektorController {
  constructor(
    @InjectModel(Direktor.name) private direktorModel: Model<DirektorDocument>,
  ) {}

  // Admin barcha direktorlarni ko'radi
  @Get()
  async findAll(@Query('role') role?: string) {
    if (role === 'admin') {
      return this.direktorModel.find().exec();
    }
    // Default: direktor o'zini ko'radi
    return { error: 'Faqat admin barcha direktorlarni ko‘ra oladi' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.direktorModel.findById(id).exec();
  }

  // Admin direktor qo'shadi
  @Post()
  async create(@Body() createDirektorDto: Partial<Direktor>) {
    if (createDirektorDto.role !== 'direktor') {
      createDirektorDto.role = 'direktor';
    }
    const created = new this.direktorModel(createDirektorDto);
    return created.save();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDirektorDto: Partial<Direktor>) {
    return this.direktorModel.findByIdAndUpdate(id, updateDirektorDto, { new: true }).exec();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.direktorModel.findByIdAndDelete(id).exec();
  }
}
