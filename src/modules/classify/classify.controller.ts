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
import { ClassifyService } from './classify.service';
import { CreateClassifyDto } from './dto/create-classify.dto';
import { UpdateClassifyDto } from './dto/update-classify.dto';

@Controller('classify')
export class ClassifyController {
  constructor(private readonly classifyService: ClassifyService) {}

  /**
   * 新建文章分类，后台文章编辑和文章列表筛选会复用该分类。
   */
  @Post('saveClassify')
  async create(@Body() createClassifyDto: CreateClassifyDto) {
    console.log(createClassifyDto, 555);
    const res = await this.classifyService.create(createClassifyDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询文章分类列表，并返回分类总数用于后台分页。
   */
  @Get()
  async findAllClassify(@Query() query: any) {
    const res = await this.classifyService.findAllClassify(query);
    const res1: any = await this.classifyService.countArticle();
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(res1.count),
    };
  }

  /**
   * 查询单个分类详情，后台编辑分类时回显使用。
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classifyService.findOne(+id);
  }

  /**
   * 更新分类信息，保持分类 id 不变并覆盖编辑后的字段。
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassifyDto: UpdateClassifyDto,
  ) {
    const res = await this.classifyService.update(+id, updateClassifyDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除分类，后台分类管理列表删除单条或多条记录时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.classifyService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
