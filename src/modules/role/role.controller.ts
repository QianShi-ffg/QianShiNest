import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleService } from './role.service';

@UseGuards(AuthGuard('jwt'))
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 查询后台角色列表，账号管理页用它展示和选择账号角色。
   */
  @Get()
  async findAll() {
    const res = await this.roleService.findAll();
    return { code: 200, message: 'success', data: res };
  }

  /**
   * 新建角色并保存角色权限，后台角色管理新增角色时使用。
   */
  @Post('saveRole')
  save(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.save(createRoleDto);
  }

  /**
   * 更新角色名称、编码和权限集合，保持角色 id 不变。
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.update(+id, createRoleDto);
  }

  /**
   * 删除指定角色，后台角色管理列表删除角色时使用。
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
