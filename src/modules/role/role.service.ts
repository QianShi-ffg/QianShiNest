import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_USER_PERMISSIONS } from '../user/user-permissions';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private RoleRepository: Repository<Role>,
  ) {}

  private parsePermissions(value: string | string[] | null | undefined) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  private stringifyPermissions(value: string[] | string | null | undefined) {
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        return JSON.stringify(value.split(',').map((item) => item.trim()).filter(Boolean));
      }
    }
    return JSON.stringify([]);
  }

  private serialize(role: Role) {
    if (!role) return null;
    return {
      ...role,
      permissions: this.parsePermissions(role.permissions),
    };
  }

  private getDefaultPermissions(code: string) {
    if (code === 'admin') return DEFAULT_USER_PERMISSIONS;
    if (code === 'editor') {
      return [
        'overview',
        'creative',
        'diarySetting',
        'projectSetting',
        'changelogSetting',
        'commentSetting',
        'userInfo',
      ];
    }
    return [];
  }

  async ensureDefaultRoles() {
    const defaults = [
      {
        name: '管理员',
        code: 'admin',
        permissions: DEFAULT_USER_PERMISSIONS,
      },
      {
        name: '编辑',
        code: 'editor',
        permissions: this.getDefaultPermissions('editor'),
      },
    ];

    for (const item of defaults) {
      const existed = await this.RoleRepository.findOne({ where: { code: item.code } });
      if (!existed) {
        await this.RoleRepository.save({
          name: item.name,
          code: item.code,
          permissions: JSON.stringify(item.permissions),
        });
        continue;
      }

      if (item.code === 'admin') {
        const permissions = Array.from(
          new Set([...this.parsePermissions(existed.permissions), ...DEFAULT_USER_PERMISSIONS]),
        );
        if (permissions.length !== this.parsePermissions(existed.permissions).length) {
          await this.RoleRepository.update(existed.id, {
            permissions: JSON.stringify(permissions),
          });
        }
      }
    }
  }

  async findAll() {
    await this.ensureDefaultRoles();
    const roles = await this.RoleRepository.find({
      order: { id: 'ASC' },
    });
    return roles.map((item) => this.serialize(item));
  }

  async findByCode(code: string) {
    await this.ensureDefaultRoles();
    const role = await this.RoleRepository.findOne({ where: { code } });
    return this.serialize(role);
  }

  async getPermissionsByCode(code: string) {
    const role = await this.findByCode(code);
    if (role?.permissions?.length) return role.permissions;
    return this.getDefaultPermissions(code);
  }

  async save(data: CreateRoleDto) {
    const name = data.name?.trim();
    if (!name) return { code: 500, message: '角色名称不能为空' };
    const code = data.code?.trim() || name;
    const existed = await this.RoleRepository.findOne({ where: { code } });
    if (existed) return { code: 500, message: '角色标识已存在' };

    const created = await this.RoleRepository.save({
      name,
      code,
      permissions: this.stringifyPermissions(data.permissions),
    });
    return { code: 200, message: '保存成功', data: this.serialize(created) };
  }

  async update(id: number, data: CreateRoleDto) {
    const current = await this.RoleRepository.findOne({ where: { id } });
    if (!current) return { code: 500, message: '角色不存在' };

    const name = data.name?.trim() || current.name;
    const code = data.code?.trim() || current.code || name;
    if (code !== current.code) {
      const existed = await this.RoleRepository.findOne({ where: { code } });
      if (existed && existed.id !== id) return { code: 500, message: '角色标识已存在' };
    }

    await this.RoleRepository.update(id, {
      name,
      code,
      permissions: this.stringifyPermissions(data.permissions),
    });
    const updated = await this.RoleRepository.findOne({ where: { id } });
    return { code: 200, message: '保存成功', data: this.serialize(updated) };
  }

  async remove(id: number) {
    const role = await this.RoleRepository.findOne({ where: { id } });
    if (!role) return { code: 500, message: '角色不存在' };
    if (['admin', 'editor'].includes(role.code)) {
      return { code: 500, message: '默认角色不可删除' };
    }
    await this.RoleRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
