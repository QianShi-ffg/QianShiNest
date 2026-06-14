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
import { ChangelogService } from './changelog.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';

@Controller('changelog')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  /**
   * 新建更新日志，保存版本号、更新类型、发布时间和变更明细。
   */
  @Post('saveChangelog')
  async create(@Body() createChangelogDto: CreateChangelogDto) {
    const res = await this.changelogService.create(createChangelogDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询更新日志列表，前台日志页和后台日志管理共用该分页接口。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.changelogService.findAll(query);
    const total: any = await this.changelogService.countChangelog();
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(total.count),
    };
  }

  /**
   * 查询单条更新日志详情，后台编辑回显时使用。
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.changelogService.findOne(+id);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 更新日志内容，保持日志 id 不变并覆盖编辑后的字段。
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChangelogDto: UpdateChangelogDto,
  ) {
    const res = await this.changelogService.update(+id, updateChangelogDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除更新日志，后台日志管理列表删除单条或多条记录时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.changelogService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
