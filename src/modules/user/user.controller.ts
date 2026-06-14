import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 注册后台账号，初始化环境或手动新增登录账号时使用。
   */
  @Post('signUp')
  signUp(@Body() body: any) {
    const { name, password } = body;
    return this.userService.signUp(name, password);
  }

  /**
   * 兼容旧登录入口，校验账号密码后返回登录结果。
   */
  @Post('login')
  login(@Body() body: any) {
    const { name, password } = body;
    return this.userService.login(name, password);
  }

  /**
   * 查询所有后台账号，账号管理列表渲染时使用。
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async findAll() {
    const res = await this.userService.findAll();
    return { code: 200, message: 'success', data: res };
  }

  /**
   * 查询可配置权限选项，角色或账号权限配置下拉/勾选项使用。
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('permissions')
  async getPermissionOptions() {
    return {
      code: 200,
      message: 'success',
      data: await this.userService.getPermissionOptions(),
    };
  }

  /**
   * 新建或更新后台账号，账号管理弹窗提交时使用。
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('account')
  saveAccount(@Body() createUserDto: CreateUserDto) {
    return this.userService.saveAccount(createUserDto);
  }

  /**
   * 根据账号名查询单个用户信息，保留给旧接口兼容。
   */
  @Get(':id')
  findOne(@Param('name') name: string) {
    return this.userService.findOne(name);
  }

  /**
   * 更新指定账号信息，后台账号管理编辑账号时使用。
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * 删除指定后台账号，账号管理列表删除账号时使用。
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
