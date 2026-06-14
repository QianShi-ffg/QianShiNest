import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMenuDto, UpdateMenuSortDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';

@UseGuards(AuthGuard('jwt'))
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 查询后台菜单树，登录后的后台框架用它渲染侧边栏。
   */
  @Get()
  async findAll() {
    const res = await this.menuService.findAll();
    return { code: 200, message: 'success', data: res };
  }

  /**
   * 批量更新菜单排序，后台拖拠菜单后一次性保存新的 sort 值。
   */
  @Patch('sort')
  updateSort(@Body() updateMenuSortDto: UpdateMenuSortDto) {
    return this.menuService.updateSort(updateMenuSortDto.items);
  }

  /**
   * 更新单个菜单配置，后台菜单管理修改名称、图标或可见性时使用。
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(+id, updateMenuDto);
  }
}
