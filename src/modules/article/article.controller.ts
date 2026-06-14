import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ArticleService } from './article.service';
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * 保存文章草稿，后台编辑器首次保存时创建未发布文章记录。
   */
  @Post('saveDraft')
  async create(@Body() data) {
    const res = await this.articleService.create(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询后台文章列表，包含草稿和已发布文章，并返回分页总数。
   */
  @Get()
  async findAll(@Query() query: any) {
    const res: any = await this.articleService.findAllArticle(query);
    const res1: any = await this.articleService.countArticle('0');
    return {
      code: 200,
      message: 'success',
      data: res,
      total: Number(res1.count),
    };
  }

  /**
   * 查询前台可展示的已发布文章列表。
   */
  @Get('publishArticle')
  async findPublishArticle(@Query() query: any) {
    const res: any = await this.articleService.findPublishArticle(query);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 查询最新发布的文章，供首页“最新文章”等模块展示。
   */
  @Get('latest')
  async findLatestArticles(@Query('limit') limit: string) {
    const res: any = await this.articleService.findLatestArticles(+limit || 3);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 按发布时间排序后查询当前文章相邻的上一篇和下一篇。
   */
  @Get('adjacent/:id')
  async findAdjacentArticles(@Param('id') id: string) {
    const res: any = await this.articleService.findAdjacentArticles(+id);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 文章统计接口，按分类统计已发布文章数量，同时返回文章总数。
   */
  @Get('articleClassifyCount')
  async findArticleCount() {
    const res = await this.articleService.countClassify('1');
    const res1: any = await this.articleService.countArticle('1');
    return {
      code: 200,
      message: 'success',
      data: {
        rows: res,
        total: Number(res1.count),
      },
    };
  }

  /**
   * 查询文章详情，并在进入详情页时累计一次浏览量。
   * @param id 文章id
   */
  @Get(':id')
  async findArticleDetail(@Param('id') id: string) {
    await this.articleService.updateArticleDetailViews(+id);
    const res = await this.articleService.findArticleDetail(+id);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 更新文章基础信息和正文内容，后台编辑已有文章时使用。
   */
  @Patch('update')
  async update(@Body() data) {
    const res = await this.articleService.update(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量发布文章，将草稿状态切换为已发布状态。
   */
  @Patch('publish')
  async publish(@Body() data) {
    const res = await this.articleService.publish(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }

  /**
   * 批量删除文章，后台文章管理列表删除单篇或多篇文章时使用。
   */
  @Delete('delete')
  async remove(@Body() data) {
    const res = await this.articleService.remove(data);
    return {
      code: 200,
      message: 'success',
      data: res,
    };
  }
}
