import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleService } from '../role/role.service';
import { MenuService } from '../menu/menu.service';
import {
  decryptStoredPassword,
  encryptPasswordForStorage,
  isEncryptedPassword,
  verifyStoredPassword,
} from '../../utils/password-crypto';

export type User1 = any;
@Injectable()
export class UserService {
  private readonly users: User1[];
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly menuService: MenuService,
  ) {
    this.users = [
      {
        userId: 1,
        username: 'qqq',
        password: 'aaa',
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async getPermissionsByRole(role: string) {
    return this.roleService.getPermissionsByCode(role || 'editor');
  }

  private async serialize(user: User, showPassword = false) {
    if (!user) return null;
    const { password, permissions, ...rest } = user;
    return {
      ...rest,
      ...(showPassword ? { password: decryptStoredPassword(password) } : {}),
      permissions: await this.getPermissionsByRole(user.role),
    };
  }

  getPermissionOptions() {
    return this.menuService.findAll();
  }

  /**
   * 注册
   * @param name 账户名
   * @param password 密码
   * @returns 返回当前注册账户信息
   */
  async signUp(name, password) {
    const res: any = await this.UserRepository.find({
      where: { name: name },
    });
    if (res.length === 0) {
      const res1: any = await this.UserRepository.save({
        name: name,
        password: encryptPasswordForStorage(password),
        role: 'admin',
      });
      // const res: any = await this.UserRepository.createQueryBuilder()
      //   .insert()
      //   .into('user')
      //   .values([{ name: name, password: password }])
      //   .execute()
      return { code: 200, data: res1, message: '注册成功' };
    } else {
      return { code: 500, message: '该名称已被注册' };
    }
  }

  /**
   * 登录接口
   * @param name 账户名
   * @param password 密码
   * @returns 返回当前账户基本信息
   */
  async login(name, password) {
    const user = await this.UserRepository.findOne({ where: { name } });
    const passed = await this.verifyUserPassword(user, password);
    const res: any = passed ? [await this.serialize(user)] : [];
    console.log(res, 'resresresresres');
    let msg: any = '';
    let code = 200;
    if (res.length === 0) {
      code = 500;
      msg = '账户密码不正确,请重新输入';
    } else {
      msg = '登录成功';
    }
    return { code: code, message: msg, data: res };
  }

  async findAll() {
    const users = await this.UserRepository.find({
      order: { id: 'ASC' },
    });
    return Promise.all(users.map((item) => this.serialize(item, true)));
  }

  async findOne(name: string): Promise<User1 | undefined> {
    console.log(name);
    return await this.UserRepository.find({
      where: { name: name },
      select: ['id', 'name', 'password', 'photo', 'role', 'permissions'],
    });
  }

  async verifyUserPassword(user: User | null, password: string) {
    if (!user || !(await verifyStoredPassword(password, user.password))) {
      return false;
    }

    if (!isEncryptedPassword(user.password)) {
      user.password = encryptPasswordForStorage(password);
      await this.UserRepository.update(user.id, { password: user.password });
    }

    return true;
  }

  async findById(id: number) {
    const user = await this.UserRepository.findOne({ where: { id } });
    return this.serialize(user);
  }

  async saveAccount(createUserDto: CreateUserDto) {
    const name = createUserDto.name?.trim();
    const password = createUserDto.password?.trim();
    if (!name || !password) {
      return { code: 500, message: '账号和密码不能为空' };
    }

    const existed = await this.UserRepository.findOne({ where: { name } });
    if (existed) {
      return { code: 500, message: '该名称已被注册' };
    }

    const created = await this.UserRepository.save({
      name,
      password: encryptPasswordForStorage(password),
      photo: createUserDto.photo || '',
      role: createUserDto.role || 'editor',
    });
    return { code: 200, message: '保存成功', data: await this.serialize(created) };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const current = await this.UserRepository.findOne({ where: { id } });
    if (!current) {
      return { code: 500, message: '账号不存在' };
    }

    const next: Partial<User> = {
      name: updateUserDto.name?.trim() || current.name,
      photo: updateUserDto.photo ?? current.photo,
      role: updateUserDto.role || current.role,
    };

    if (updateUserDto.password?.trim()) {
      next.password = encryptPasswordForStorage(updateUserDto.password);
    }

    if (next.name !== current.name) {
      const existed = await this.UserRepository.findOne({ where: { name: next.name } });
      if (existed && existed.id !== id) {
        return { code: 500, message: '该名称已被注册' };
      }
    }

    await this.UserRepository.update(id, next);
    const updated = await this.UserRepository.findOne({ where: { id } });
    return { code: 200, message: '保存成功', data: await this.serialize(updated) };
  }

  async remove(id: number) {
    const total = await this.UserRepository.count();
    if (total <= 1) {
      return { code: 500, message: '至少保留一个账号' };
    }
    await this.UserRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
