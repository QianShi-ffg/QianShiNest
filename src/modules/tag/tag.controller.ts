import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * 新建标签，供后台文章、作品等内容选择复用。
   */
  @Post('saveTag')
  async create(@Body() createTagDto: CreateTagDto) {
    const res = await this.tagService.create(createTagDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询标签列表，后台标签管理和内容编辑下拉选项共用。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.tagService.findAll(query);
    const total: any = await this.tagService.countTag();
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(total.count),
    };
  }

  /**
   * 查询单个标签详情，后台编辑标签时回显使用。
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.tagService.findOne(+id);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 更新标签名称等基础信息，保持标签 id 不变。
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const res = await this.tagService.update(+id, updateTagDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除标签，后台标签管理列表删除单条或多条记录时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.tagService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
