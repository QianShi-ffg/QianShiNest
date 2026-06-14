import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagList } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagList)
    private TagRepository: Repository<TagList>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const doc = await this.TagRepository.findOne({ where: { name } });
    if (doc) {
      throw new HttpException('标签已存在', 401);
    }
    return this.TagRepository.save(createTagDto);
  }

  findAll(query) {
    const { page, pageSize } = query;
    const builder = this.TagRepository.createQueryBuilder('tag_list').orderBy(
      'id',
      'DESC',
    );

    if (!page || !pageSize) {
      return builder.getMany();
    }

    return builder
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getMany();
  }

  countTag() {
    return this.TagRepository.createQueryBuilder('tag_list')
      .select('COUNT(*) count')
      .getRawOne();
  }

  findOne(id: number) {
    return this.TagRepository.findOne({ where: { id } });
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.TagRepository.update(id, updateTagDto);
  }

  remove(data) {
    const { ids } = data;
    return this.TagRepository.delete(Array.isArray(ids) ? ids : ids.split(','));
  }
}
