import { Controller, Get, Post, Body, Param, Delete, Put, Query, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { Direktor, DirektorDocument } from './direktor.schema';

@Controller('students')
export class StudentController {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Direktor.name) private direktorModel: Model<DirektorDocument>,
  ) {}

  // Admin barcha o'quvchilarni ko'radi, direktor faqat o'zini
  @Get()
  async findAll(
    @Query('createdBy') createdBy?: string,
    @Query('role') role?: string,
    @Query('region') region?: string,
    @Query('districtOrCity') districtOrCity?: string,
    @Query('schoolName') schoolName?: string,
  ) {
    const filter: any = {};

    if (role === 'admin') {
      // admin can optionally filter by region/district/school
    } else if (role === 'direktor' && createdBy) {
      filter.createdBy = createdBy;
    } else {
      return [];
    }

    if (region) filter.region = region;
    if (districtOrCity) filter.districtOrCity = districtOrCity;
    if (schoolName) filter.schoolName = schoolName;

    return this.studentModel.find(filter).exec();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentModel.findById(id).exec();
  }

  @Post()
  async create(@Body() createStudentDto: Partial<Student>) {
    if (!createStudentDto.createdBy) {
      throw new BadRequestException('createdBy majburiy');
    }

    // Determine role of the creator: admin (from env) or direktor (from DB)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'polatovdoston1002@gmail.com';

    let role: 'admin' | 'direktor' | 'unknown' = 'unknown';
    if (createStudentDto.createdBy === ADMIN_EMAIL) {
      role = 'admin';
    } else {
      const direktor = await this.direktorModel.findOne({ email: createStudentDto.createdBy }).exec();
      if (direktor) role = 'direktor';
    }

    if (role === 'unknown') {
      throw new BadRequestException('Yaroqsiz createdBy: foydalanuvchi topilmadi');
    }

    createStudentDto.createdByRole = role;
    if (!createStudentDto.createdAt) createStudentDto.createdAt = new Date().toISOString();

    const created = new this.studentModel(createStudentDto);
    return created.save();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStudentDto: Partial<Student>) {
    return this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true }).exec();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.studentModel.findByIdAndDelete(id).exec();
  }
}
