import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  /**
   * 新建日记，保存 Markdown 正文、媒体资源、天气和定位等日记展示信息。
   */
  @Post('saveDiary')
  async create(@Body() createDiaryDto: CreateDiaryDto) {
    const res = await this.diaryService.create(createDiaryDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询日记列表，后台管理和前台日记列表共用分页数据。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.diaryService.findAll(query);
    const total: any = await this.diaryService.countDiary();
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(total.count),
    };
  }

  /**
   * 查询单篇日记详情，供前台详情页和后台编辑回显使用。
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.diaryService.findOne(+id);
    console.log(res);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 更新单篇日记内容，后台编辑日记时保持原 id 不变。
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDiaryDto: UpdateDiaryDto) {
    const res = await this.diaryService.update(+id, updateDiaryDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除日记，后台日记管理列表删除单篇或多篇日记时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.diaryService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
