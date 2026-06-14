import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume } from './entities/resume.entity';
import { createReadStream, existsSync } from 'fs';
import { basename, join } from 'path';
import {
  decryptStoredPassword,
  encryptPasswordForStorage,
  isEncryptedPassword,
  verifyStoredPassword,
} from '../../utils/password-crypto';

const listFields = ['skills', 'experiences', 'educations', 'projects'];

/**
 * 解析保存在数据库里的 JSON 列表字段，失败时返回空数组避免页面崩溃。
 */
const parseList = (value: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

/**
 * 生成锁定态简历摘要，避免未解锁时把完整长文本下发给前台。
 */
const toPreviewText = (value?: string | null) => {
  const text = value?.trim() || '';
  if (text.length <= 72) return text;
  return `${text.slice(0, 72)}...`;
};

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private ResumeRepository: Repository<Resume>,
  ) {}

  /**
   * 获取当前最新一条简历配置，后台保存时始终维护最新记录。
   */
  private getCurrentResume() {
    return this.ResumeRepository.createQueryBuilder('resume')
      .orderBy('resume.id', 'DESC')
      .getOne();
  }

  /**
   * 标准化后台提交的简历表单数据，并处理列表字段序列化和密码加密。
   */
  private async normalize(
    data: CreateResumeDto | UpdateResumeDto,
    current?: Resume | null,
  ): Promise<Partial<Resume>> {
    const nextPassword = data.resumePassword?.trim();
    const currentPassword = current?.resumePassword || '';
    if (data.resumeFile && !nextPassword && !currentPassword) {
      throw new BadRequestException('Resume password is required');
    }

    const res: Partial<Resume> = {
      title: data.title,
      subtitle: data.subtitle,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      resumeFile: data.resumeFile,
      resumePassword: nextPassword
        ? encryptPasswordForStorage(nextPassword)
        : currentPassword,
      location: data.location,
      email: data.email,
      summary: data.summary,
    };

    listFields.forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        res[key] = JSON.stringify(value);
      } else if (typeof value === 'string') {
        res[key] = value;
      }
    });

    return res;
  }

  /**
   * 将数据库简历记录转换成前端结构，后台模式会回显解密后的密码。
   */
  private serialize(resume: Resume | null, isAdmin = false) {
    if (!resume) return null;
    const res = {
      ...resume,
      skills: parseList(resume.skills),
      experiences: parseList(resume.experiences),
      educations: parseList(resume.educations),
      projects: parseList(resume.projects),
      hasResumeFile: Boolean(resume.resumeFile),
      resumeProtected: Boolean(resume.resumePassword),
    };

    delete res.resumePassword;

    if (isAdmin) {
      res.resumePassword = decryptStoredPassword(resume.resumePassword);
    } else {
      delete res.resumeFile;
    }

    return res;
  }

  /**
   * 生成前台未解锁时的简历预览，只返回少量公开内容和锁定状态。
   */
  private serializePreview(resume: Resume | null) {
    if (!resume) return null;
    const skills = parseList(resume.skills);

    return {
      title: resume.title,
      subtitle: resume.subtitle,
      name: resume.name,
      role: resume.role,
      avatar: resume.avatar,
      location: resume.location,
      email: '',
      summary: toPreviewText(resume.summary),
      skills: skills.slice(0, 2),
      experiences: [],
      educations: [],
      projects: [],
      hasResumeFile: Boolean(resume.resumeFile),
      resumeProtected: Boolean(resume.resumePassword),
      locked: Boolean(resume.resumePassword),
    };
  }

  /**
   * 查询当前简历；前台未解锁时返回预览，后台或未设置密码时返回完整内容。
   */
  async findCurrent(isAdmin = false) {
    const resume = await this.getCurrentResume();
    if (isAdmin || !resume?.resumePassword) {
      return this.serialize(resume, isAdmin);
    }
    return this.serializePreview(resume);
  }

  /**
   * 保存个人信息和简历配置；已有记录则更新，没有记录则创建。
   */
  async save(data: CreateResumeDto) {
    const current = await this.getCurrentResume();

    if (current) {
      await this.ResumeRepository.update(
        current.id,
        await this.normalize(data, current),
      );
      const next = await this.ResumeRepository.findOne({
        where: { id: current.id },
      });
      return this.serialize(next, true);
    }

    const created = await this.ResumeRepository.save(await this.normalize(data));
    return this.serialize(created, true);
  }

  /**
   * 校验简历访问密码，复用下载校验逻辑确保密码和文件保护规则一致。
   */
  async verifyPassword(password = '') {
    await this.getDownloadFile(password);

    return {
      code: 200,
      message: 'success',
      data: {},
    };
  }

  /**
   * 密码正确后返回完整简历内容，并顺手把历史明文密码迁移为加密存储。
   */
  async findFull(password = '') {
    const resume = await this.getCurrentResume();

    if (!resume) {
      throw new BadRequestException('Resume is not configured');
    }

    if (!resume.resumePassword) {
      return this.serialize(resume);
    }

    const passed = await verifyStoredPassword(password, resume.resumePassword);
    if (!password || !passed) {
      throw new BadRequestException('Resume password is incorrect');
    }

    if (!isEncryptedPassword(resume.resumePassword)) {
      await this.ResumeRepository.update(resume.id, {
        resumePassword: encryptPasswordForStorage(password),
      });
    }

    return this.serialize(resume);
  }

  /**
   * 修改简历访问密码；已有密码时必须先校验旧密码。
   */
  async changePassword(oldPassword = '', newPassword = '') {
    const nextPassword = newPassword.trim();
    if (!nextPassword) {
      throw new BadRequestException('请填写简历下载密码');
    }

    const resume = await this.getCurrentResume();

    if (!resume) {
      throw new BadRequestException('请先保存个人信息');
    }

    if (resume.resumePassword) {
      const passed = await verifyStoredPassword(oldPassword, resume.resumePassword);
      if (!oldPassword || !passed) {
        throw new BadRequestException('旧密码不正确');
      }
    }

    await this.ResumeRepository.update(resume.id, {
      resumePassword: encryptPasswordForStorage(nextPassword),
    });
    const updated = await this.ResumeRepository.findOne({ where: { id: resume.id } });
    return this.serialize(updated, true);
  }

  /**
   * 从完整 URL 或相对路径中提取简历文件 pathname。
   */
  private getResumePathname(resumeFile: string) {
    try {
      return new URL(resumeFile, 'http://local.test').pathname;
    } catch (error) {
      return resumeFile;
    }
  }

  /**
   * 校验简历文件路径只能来自允许目录，并解析出真实磁盘文件位置。
   */
  private resolveResumeFile(resumeFile: string) {
    const pathname = this.getResumePathname(resumeFile);
    const allowedPrefixes = ['/resume/files/', '/uploads/resume/files/'];
    if (!allowedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      throw new BadRequestException('Invalid resume file path');
    }

    const filename = basename(decodeURIComponent(pathname));
    const privatePath = join(
      __dirname,
      '../../../private/uploads/resume/files',
      filename,
    );
    const legacyPublicPath = join(
      __dirname,
      '../../../public/uploads/resume/files',
      filename,
    );
    const filePath = existsSync(privatePath) ? privatePath : legacyPublicPath;

    if (!existsSync(filePath)) {
      throw new BadRequestException('Resume file not found');
    }

    return {
      filename,
      filePath,
    };
  }

  /**
   * 校验下载密码并返回可读文件流，供控制器以附件形式下载。
   */
  async getDownloadFile(password = '') {
    const resume = await this.getCurrentResume();

    if (!resume?.resumeFile) {
      throw new BadRequestException('Resume file is not configured');
    }

    if (!resume.resumePassword) {
      throw new BadRequestException('Resume password is not configured');
    }

    const passed = await verifyStoredPassword(password, resume.resumePassword);
    if (!password || !passed) {
      throw new BadRequestException('Resume password is incorrect');
    }

    if (!isEncryptedPassword(resume.resumePassword)) {
      await this.ResumeRepository.update(resume.id, {
        resumePassword: encryptPasswordForStorage(password),
      });
    }

    const file = this.resolveResumeFile(resume.resumeFile);
    return {
      ...file,
      stream: createReadStream(file.filePath),
    };
  }
}
