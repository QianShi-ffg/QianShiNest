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
import { FriendShipService } from './friend-ship.service';
import { CreateFriendShipDto } from './dto/create-friend-ship.dto';
import { UpdateFriendShipDto } from './dto/update-friend-ship.dto';

@Controller('friendShip')
export class FriendShipController {
  constructor(private readonly friendShipService: FriendShipService) {}

  /**
   * 后台新建友链，管理员手动录入并可直接设置展示状态。
   */
  @Post('saveFriendShip')
  async create(@Body() createFriendShipDto: CreateFriendShipDto) {
    const res = await this.friendShipService.create(createFriendShipDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 前台友链申请入口，访客提交后进入待处理状态等待后台处理。
   */
  @Post('apply')
  async apply(@Body() createFriendShipDto: CreateFriendShipDto) {
    const res = await this.friendShipService.apply(createFriendShipDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询友链列表，后台可按状态筛选，前台只读取可展示数据。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.friendShipService.findAll(query);
    const res1: any = await this.friendShipService.countFriendShip(query);
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(res1.count),
    };
  }

  /**
   * 查询单个友链详情，后台编辑弹窗回显时使用。
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendShipService.findOne(+id);
  }

  /**
   * 更新友链信息和审核状态，后台处理申请或维护站点信息时使用。
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFriendShipDto: UpdateFriendShipDto,
  ) {
    const res = await this.friendShipService.update(+id, updateFriendShipDto);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除友链，后台友链列表删除单条或多条记录时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.friendShipService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
