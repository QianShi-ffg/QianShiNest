import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { Changelog } from './entities/changelog.entity';

const parseChanges = (value: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'feat', text }));
  }
};

@Injectable()
export class ChangelogService {
  constructor(
    @InjectRepository(Changelog)
    private ChangelogRepository: Repository<Changelog>,
  ) {}

  private normalize(data: CreateChangelogDto | UpdateChangelogDto) {
    return {
      ...data,
      changes: Array.isArray(data.changes)
        ? JSON.stringify(data.changes)
        : data.changes,
    };
  }

  private serialize(changelog: Changelog) {
    return {
      ...changelog,
      changes: parseChanges(changelog.changes),
    };
  }

  create(createChangelogDto: CreateChangelogDto) {
    return this.ChangelogRepository.save(this.normalize(createChangelogDto));
  }

  async findAll(query) {
    const { page, pageSize } = query;
    const builder = this.ChangelogRepository.createQueryBuilder(
      'changelog',
    ).orderBy('id', 'DESC');

    const rows =
      !page || !pageSize
        ? await builder.getMany()
        : await builder
            .skip((Number(page) - 1) * Number(pageSize))
            .take(Number(pageSize))
            .getMany();

    return rows.map((item) => this.serialize(item));
  }

  countChangelog() {
    return this.ChangelogRepository.createQueryBuilder('changelog')
      .select('COUNT(*) count')
      .getRawOne();
  }

  async findOne(id: number) {
    const res = await this.ChangelogRepository.findOne({ where: { id } });
    return res ? this.serialize(res) : null;
  }

  update(id: number, updateChangelogDto: UpdateChangelogDto) {
    return this.ChangelogRepository.update(
      id,
      this.normalize(updateChangelogDto),
    );
  }

  remove(data) {
    const { ids } = data;
    return this.ChangelogRepository.delete(
      Array.isArray(ids) ? ids : ids.split(','),
    );
  }
}
