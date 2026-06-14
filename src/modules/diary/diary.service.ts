import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diary } from './entities/diary.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private DiaryRepository: Repository<Diary>,
  ) {}

  /**
   * 保存新日记记录，正文和媒体字段由后台表单统一提交。
   */
  create(createDiaryDto: CreateDiaryDto) {
    return this.DiaryRepository.save(createDiaryDto);
  }

  /**
   * 查询日记列表；带分页参数时分页返回，不带分页参数时返回全部数据。
   */
  findAll(query) {
    const { page, pageSize } = query;
    const builder = this.DiaryRepository.createQueryBuilder('diary').orderBy(
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

  /**
   * 统计日记总数，后台分页组件使用。
   */
  countDiary() {
    return this.DiaryRepository.createQueryBuilder('diary')
      .select('COUNT(*) count')
      .getRawOne();
  }

  /**
   * 查询单篇日记详情。
   */
  findOne(id: number) {
    return this.DiaryRepository.findOne({ where: { id } });
  }

  /**
   * 更新指定日记记录。
   */
  update(id: number, updateDiaryDto: UpdateDiaryDto) {
    return this.DiaryRepository.update(id, updateDiaryDto);
  }

  /**
   * 批量删除日记，兼容数组 ids 和逗号分隔字符串 ids。
   */
  remove(data) {
    const { ids } = data;
    return this.DiaryRepository.delete(Array.isArray(ids) ? ids : ids.split(','));
  }
}
