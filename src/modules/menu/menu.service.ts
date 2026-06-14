import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { DEFAULT_MENU_ITEMS } from './menu-defaults';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private MenuRepository: Repository<Menu>,
  ) {}

  private serialize(menu: Menu) {
    if (!menu) return null;
    return {
      id: menu.id,
      key: menu.key,
      name: menu.name,
      icon: menu.icon,
      route: menu.route,
      group: menu.group,
      sort: menu.sort,
      visible: menu.visible,
    };
  }

  async ensureDefaultMenus() {
    for (const item of DEFAULT_MENU_ITEMS) {
      const existed = await this.MenuRepository.findOne({ where: { key: item.key } });
      if (!existed) {
        await this.MenuRepository.save(item);
        continue;
      }

      const patch: Partial<Menu> = {};
      if (!existed.route) patch.route = item.route;
      if (!existed.group) patch.group = item.group;
      if (!existed.icon) patch.icon = item.icon;
      if (existed.sort === null || existed.sort === undefined) patch.sort = item.sort;
      if (Object.keys(patch).length) {
        await this.MenuRepository.update(existed.id, patch);
      }
    }
  }

  async findAll() {
    await this.ensureDefaultMenus();
    const menus = await this.MenuRepository.find({
      order: { sort: 'ASC', id: 'ASC' },
    });
    return menus.map((item) => this.serialize(item));
  }

  async findVisible() {
    await this.ensureDefaultMenus();
    const menus = await this.MenuRepository.find({
      where: { visible: true },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return menus.map((item) => this.serialize(item));
  }

  async update(id: number, data: UpdateMenuDto) {
    const current = await this.MenuRepository.findOne({ where: { id } });
    if (!current) return { code: 500, message: '菜单不存在' };

    const next: Partial<Menu> = {};
    if (data.name !== undefined) next.name = data.name.trim() || current.name;
    if (data.icon !== undefined) next.icon = data.icon.trim() || current.icon;
    if (data.sort !== undefined) next.sort = Number(data.sort);
    if (data.visible !== undefined) next.visible = data.visible;

    await this.MenuRepository.update(id, next);
    const updated = await this.MenuRepository.findOne({ where: { id } });
    return { code: 200, message: '保存成功', data: this.serialize(updated) };
  }

  async updateSort(items: { id: number; sort: number }[]) {
    if (!Array.isArray(items) || !items.length) {
      return { code: 500, message: '排序数据不能为空' };
    }

    await this.MenuRepository.manager.transaction(async (manager) => {
      for (const item of items) {
        await manager.update(Menu, item.id, { sort: Number(item.sort) });
      }
    });

    return { code: 200, message: '排序保存成功' };
  }
}
