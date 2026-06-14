import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diary } from '../diary/entities/diary.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { LikeRecord } from './entities/like-record.entity';

const ALLOWED_TARGET_TYPES = ['diary', 'article'];
const DEFAULT_AUTHOR = '访客';
const COMMENT_INTERVAL = 10 * 1000;
const COMMENT_HOURLY_LIMIT = 30;

/**
 * 统一清洗 IPv4 映射前缀，保证点赞和评论频控使用稳定的 IP key。
 */
const getIp = (ip: string) => (ip || 'unknown').replace('::ffff:', '');

/**
 * 清理用户输入并限制最大长度，避免评论昵称或正文过长撑爆页面。
 */
const clampText = (value: unknown, max: number) => {
  return String(value || '').trim().slice(0, max);
};

@Injectable()
export class CommentService {
  private readonly commentRecords = new Map<string, number[]>();

  constructor(
    @InjectRepository(Comment)
    private CommentRepository: Repository<Comment>,
    @InjectRepository(LikeRecord)
    private LikeRecordRepository: Repository<LikeRecord>,
    @InjectRepository(Diary)
    private DiaryRepository: Repository<Diary>,
  ) {}

  /**
   * 校验评论目标类型和 id，防止用户提交到不存在的业务对象类型。
   */
  private assertTarget(targetType: string, targetId: number) {
    if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
      throw new BadRequestException('不支持的评论对象');
    }
    if (!Number.isInteger(Number(targetId)) || Number(targetId) <= 0) {
      throw new BadRequestException('评论对象不存在');
    }
  }

  /**
   * 校验评论目标是否真实存在，目前日记评论必须先确认日记有效。
   */
  private async assertTargetExists(targetType: string, targetId: number) {
    if (targetType === 'diary') {
      const diary = await this.DiaryRepository.findOne({ where: { id: targetId } });
      if (!diary) throw new BadRequestException('日记不存在');
    }
  }

  /**
   * 根据 IP 做轻量频率限制，拦截短时间连续评论和单小时过量评论。
   */
  private assertCommentRate(ip: string) {
    const now = Date.now();
    const current = this.commentRecords
      .get(ip)
      ?.filter((time) => now - time < 60 * 60 * 1000) || [];

    if (current.length > 0 && now - current[current.length - 1] < COMMENT_INTERVAL) {
      throw new BadRequestException('评论太频繁，请稍后再试');
    }
    if (current.length >= COMMENT_HOURLY_LIMIT) {
      throw new BadRequestException('评论太频繁，请稍后再试');
    }

    current.push(now);
    this.commentRecords.set(ip, current);
  }

  /**
   * 将数据库评论记录整理成前台需要的结构，并补充当前 IP 的点赞状态。
   */
  private serialize(comment: Comment, likedCommentIds: Set<number> = new Set()) {
    return {
      ...comment,
      liked: likedCommentIds.has(comment.id),
      time: comment.createTime,
      replies: [],
    };
  }

  /**
   * 把扁平评论列表组装成父评论和回复的树形结构。
   */
  private buildTree(rows: Comment[], likedCommentIds: Set<number> = new Set()) {
    const map = new Map<number, any>();
    const roots = [];

    rows.forEach((row) => {
      map.set(row.id, this.serialize(row, likedCommentIds));
    });

    map.forEach((comment) => {
      if (comment.parentId && map.has(comment.parentId)) {
        map.get(comment.parentId).replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }

  /**
   * 查询后台评论列表，支持按评论目标类型和目标 id 筛选。
   */
  async findAll(query) {
    const { targetType, targetId, page, pageSize } = query;
    const builder = this.CommentRepository.createQueryBuilder('comment').orderBy(
      'comment.id',
      'DESC',
    );

    if (targetType) builder.andWhere('comment.targetType = :targetType', { targetType });
    if (targetId) builder.andWhere('comment.targetId = :targetId', { targetId: Number(targetId) });

    if (!page || !pageSize) return builder.getMany();

    return builder
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getMany();
  }

  /**
   * 查询前台评论树，并根据访问者 IP 标记已点赞评论。
   */
  async findTree(query, ip?: string) {
    const targetType = query.targetType || 'diary';
    const targetId = Number(query.targetId);
    this.assertTarget(targetType, targetId);

    const rows = await this.CommentRepository.createQueryBuilder('comment')
      .where('comment.targetType = :targetType', { targetType })
      .andWhere('comment.targetId = :targetId', { targetId })
      .orderBy('comment.id', 'DESC')
      .getMany();

    const likedCommentIds = await this.getLikedCommentIds(rows, getIp(ip));
    return this.buildTree(rows, likedCommentIds);
  }

  /**
   * 统计评论总数，供后台评论列表分页使用。
   */
  countComment(query) {
    const { targetType, targetId } = query;
    const builder = this.CommentRepository.createQueryBuilder('comment').select(
      'COUNT(*) count',
    );
    if (targetType) builder.andWhere('comment.targetType = :targetType', { targetType });
    if (targetId) builder.andWhere('comment.targetId = :targetId', { targetId: Number(targetId) });
    return builder.getRawOne();
  }

  /**
   * 创建评论或回复，写入前会校验目标、频率、正文和父级回复关系。
   */
  async create(createCommentDto: CreateCommentDto, ip: string) {
    const requestIp = getIp(ip);
    const targetType = createCommentDto.targetType || 'diary';
    const targetId = Number(createCommentDto.targetId);
    const parentId = createCommentDto.parentId ? Number(createCommentDto.parentId) : null;
    const author = clampText(createCommentDto.author || DEFAULT_AUTHOR, 20) || DEFAULT_AUTHOR;
    const content = clampText(createCommentDto.content, 500);
    const replyTo = clampText(createCommentDto.replyTo, 20);

    this.assertTarget(targetType, targetId);
    await this.assertTargetExists(targetType, targetId);
    this.assertCommentRate(requestIp);
    if (!content) throw new BadRequestException('评论内容不能为空');

    if (parentId) {
      const parent = await this.CommentRepository.findOne({ where: { id: parentId } });
      if (!parent || parent.targetType !== targetType || parent.targetId !== targetId) {
        throw new BadRequestException('回复对象不存在');
      }
    }

    const saved = await this.CommentRepository.save({
      targetType,
      targetId,
      parentId,
      replyTo,
      author,
      content,
      ip: requestIp,
      status: 'visible',
    });

    if (targetType === 'diary') {
      await this.refreshDiaryCommentCount(targetId);
    }

    return this.serialize(saved);
  }

  /**
   * 切换评论点赞记录，并同步维护评论表中的 likes 数量。
   */
  async likeComment(id: number, ip: string) {
    const requestIp = getIp(ip);
    const comment = await this.CommentRepository.findOne({ where: { id } });
    if (!comment) throw new BadRequestException('评论不存在');

    const result = await this.toggleLikeRecord('comment', id, requestIp);
    if (result.liked) {
      await this.CommentRepository.increment({ id }, 'likes', 1);
    } else if ((comment.likes || 0) > 0) {
      await this.CommentRepository.decrement({ id }, 'likes', 1);
    }

    const next = await this.CommentRepository.findOne({ where: { id } });
    return {
      liked: result.liked,
      likes: next?.likes || 0,
    };
  }

  /**
   * 切换日记点赞记录，并同步维护日记表中的 likes 数量。
   */
  async likeDiary(id: number, ip: string) {
    const requestIp = getIp(ip);
    const diary = await this.DiaryRepository.findOne({ where: { id } });
    if (!diary) throw new BadRequestException('日记不存在');

    const result = await this.toggleLikeRecord('diary', id, requestIp);
    if (result.liked) {
      await this.DiaryRepository.increment({ id }, 'likes', 1);
    } else if ((diary.likes || 0) > 0) {
      await this.DiaryRepository.decrement({ id }, 'likes', 1);
    }

    const next = await this.DiaryRepository.findOne({ where: { id } });
    return {
      liked: result.liked,
      likes: next?.likes || 0,
    };
  }

  /**
   * 查询当前 IP 对指定目标的点赞状态，供前台初始化按钮状态。
   */
  async getLikeStatus(targetType: string, targetId: number, ip: string) {
    const requestIp = getIp(ip);
    this.assertTarget(targetType, targetId);
    if (targetType === 'diary') {
      await this.assertTargetExists(targetType, targetId);
    } else if (targetType === 'comment') {
      const comment = await this.CommentRepository.findOne({ where: { id: targetId } });
      if (!comment) throw new BadRequestException('评论不存在');
    }
    const current = await this.LikeRecordRepository.findOne({
      where: { targetType, targetId, ip: requestIp },
    });
    return { liked: Boolean(current) };
  }

  /**
   * 批量查询当前 IP 已点赞的评论 id，避免前台评论树逐条请求点赞状态。
   */
  private async getLikedCommentIds(rows: Comment[], ip: string) {
    if (!ip || rows.length === 0) return new Set<number>();
    const ids = rows.map((row) => row.id);
    const records = await this.LikeRecordRepository.createQueryBuilder('like_record')
      .where('like_record.targetType = :targetType', { targetType: 'comment' })
      .andWhere('like_record.ip = :ip', { ip })
      .andWhere('like_record.targetId IN (:...ids)', { ids })
      .getMany();
    return new Set(records.map((record) => record.targetId));
  }

  /**
   * 对同一 IP 和目标执行点赞开关逻辑，存在记录则取消，不存在则新增。
   */
  private async toggleLikeRecord(targetType: string, targetId: number, ip: string) {
    const current = await this.LikeRecordRepository.findOne({
      where: { targetType, targetId, ip },
    });
    if (current) {
      await this.LikeRecordRepository.delete(current.id);
      return { liked: false };
    }

    await this.LikeRecordRepository.save({ targetType, targetId, ip });
    return { liked: true };
  }

  /**
   * 批量删除评论，同时删除直接回复并刷新日记评论数。
   */
  async remove(data) {
    const { ids } = data;
    const list = Array.isArray(ids) ? ids : String(ids || '').split(',');
    const idList = list.map((id) => Number(id)).filter(Boolean);
    const comments = await this.CommentRepository.findByIds(idList);
    const diaryIds = Array.from(
      new Set(
        comments
          .filter((comment) => comment.targetType === 'diary')
          .map((comment) => comment.targetId),
      ),
    );
    const allIds = [...idList];

    for (const id of idList) {
      const replies = await this.CommentRepository.find({ where: { parentId: id } });
      allIds.push(...replies.map((reply) => reply.id));
    }

    const res = await this.CommentRepository.delete(allIds);
    for (const diaryId of diaryIds) {
      await this.refreshDiaryCommentCount(diaryId);
    }
    return res;
  }

  /**
   * 重新统计日记评论数量，保证日记列表展示的评论数和评论表一致。
   */
  private async refreshDiaryCommentCount(targetId: number) {
    const total = await this.CommentRepository.count({
      where: { targetType: 'diary', targetId },
    });
    await this.DiaryRepository.update(targetId, { comments: total });
  }
}
