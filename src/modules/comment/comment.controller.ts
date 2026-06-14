import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

/**
 * 从请求头和连接信息里提取客户端 IP，用于评论频率限制和点赞唯一性判断。
 */
const clientIp = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
};

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 提交评论或回复，后端会根据 IP 做频率控制并校验评论目标是否存在。
   */
  @Post('saveComment')
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: Request) {
    const res = await this.commentService.create(createCommentDto, clientIp(req));
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询后台评论管理列表，支持按目标类型、目标 id 等条件筛选。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res = await this.commentService.findAll(query);
    const total: any = await this.commentService.countComment(query);
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(total.count),
    };
  }

  /**
   * 查询前台评论树，并附带当前 IP 对每条评论的点赞状态。
   */
  @Get('tree')
  async findTree(@Query() query: any, @Req() req: Request) {
    const res = await this.commentService.findTree(query, clientIp(req));
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询当前 IP 对某个日记或评论目标的点赞状态。
   */
  @Get('likeStatus')
  async getLikeStatus(@Query() query: any, @Req() req: Request) {
    const res = await this.commentService.getLikeStatus(
      query.targetType || 'diary',
      Number(query.targetId),
      clientIp(req),
    );
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 切换评论点赞状态，同一 IP 对同一评论只保留一条点赞记录。
   */
  @Patch(':id/like')
  async likeComment(@Param('id') id: string, @Req() req: Request) {
    const res = await this.commentService.likeComment(+id, clientIp(req));
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 切换日记点赞状态，同一 IP 对同一日记只保留一条点赞记录。
   */
  @Patch('diary/:id/like')
  async likeDiary(@Param('id') id: string, @Req() req: Request) {
    const res = await this.commentService.likeDiary(+id, clientIp(req));
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除评论，后台评论管理列表删除单条或多条评论时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.commentService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
