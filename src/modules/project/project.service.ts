import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * 解析作品图片和标签列表，兼容 JSON 字符串与历史换行文本。
 */
const parseList = (value: string | null) => {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (error) {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

/**
 * 标准化作品归属类型，只允许个人作品和参与负责作品两种值。
 */
const normalizeProjectType = (value?: string) =>
  value === 'participated' ? 'participated' : 'personal';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private ProjectRepository: Repository<Project>,
  ) {}

  /**
   * 标准化保存入库的数据，将数组字段序列化并兜底作品类型。
   */
  private normalize(data: CreateProjectDto | UpdateProjectDto) {
    const normalized = {
      ...data,
      images: Array.isArray(data.images)
        ? JSON.stringify(data.images)
        : data.images,
      tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags,
    };

    if (data.projectType !== undefined) {
      normalized.projectType = normalizeProjectType(data.projectType);
    }

    return normalized;
  }

  /**
   * 将数据库中的字符串字段恢复成前台和后台组件需要的数组结构。
   */
  private serialize(project: Project) {
    return {
      ...project,
      projectType: normalizeProjectType(project.projectType),
      images: parseList(project.images),
      tags: parseList(project.tags),
    };
  }

  /**
   * 新建作品记录。
   */
  create(createProjectDto: CreateProjectDto) {
    return this.ProjectRepository.save(this.normalize(createProjectDto));
  }

  /**
   * 查询作品列表；带分页参数时分页返回，并统一序列化列表字段。
   */
  async findAll(query) {
    const { page, pageSize } = query;
    const builder = this.ProjectRepository.createQueryBuilder('project').orderBy(
      'id',
      'DESC',
    );

    const rows =
      !page || !pageSize
        ? await builder.getMany()
        : await builder
            .skip((Number(page) - 1) * Number(pageSize))
            .take(Number(pageSize))
            .getMany();

    return rows.map((item) => this.serialize(item));
  }

  /**
   * 统计作品总数，后台分页组件使用。
   */
  countProject() {
    return this.ProjectRepository.createQueryBuilder('project')
      .select('COUNT(*) count')
      .getRawOne();
  }

  /**
   * 查询单个作品详情，并恢复图片和标签数组。
   */
  async findOne(id: number) {
    const res = await this.ProjectRepository.findOne({ where: { id } });
    return res ? this.serialize(res) : null;
  }

  /**
   * 更新指定作品记录，保存前先执行字段标准化。
   */
  update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.ProjectRepository.update(id, this.normalize(updateProjectDto));
  }

  /**
   * 批量删除作品，兼容数组 ids 和逗号分隔字符串 ids。
   */
  remove(data) {
    const { ids } = data;
    return this.ProjectRepository.delete(
      Array.isArray(ids) ? ids : ids.split(','),
    );
  }
}
