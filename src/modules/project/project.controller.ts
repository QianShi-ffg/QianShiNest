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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * 新建作品，保存作品基础信息、分类、封面、多媒体和外链配置。
   */
  @Post('saveProject')
  async create(@Body() createProjectDto: CreateProjectDto) {
    const res = await this.projectService.create(createProjectDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询作品列表，后台作品管理和前台作品页共用分页数据。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.projectService.findAll(query);
    const total: any = await this.projectService.countProject();
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(total.count),
    };
  }

  /**
   * 查询作品详情，供前台详情页和后台编辑回显使用。
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.projectService.findOne(+id);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 更新作品详情，保持作品 id 不变并覆盖后台编辑后的字段。
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const res = await this.projectService.update(+id, updateProjectDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除作品，后台作品管理列表删除单篇或多篇作品时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.projectService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
