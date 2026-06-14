import { Injectable, NotFoundException } from '@nestjs/common';
import { findMiniToolDefinition } from '../tools/tool-definitions';
import type { CreateMiniToolTaskDto } from './dto/create-tool-task.dto';

export type MiniToolTaskStatus = 'ready';

export interface MiniToolTask {
  id: string;
  toolKey: string;
  toolTitle: string;
  sourceType: CreateMiniToolTaskDto['sourceType'];
  fileName: string;
  region?: CreateMiniToolTaskDto['region'];
  status: MiniToolTaskStatus;
  createdAt: string;
  result: {
    title: string;
    summary: string;
    exportTypes: string[];
  };
}

@Injectable()
export class MiniToolTaskService {
  private readonly tasks = new Map<string, MiniToolTask>();

  createTask(payload: CreateMiniToolTaskDto): MiniToolTask {
    const tool = findMiniToolDefinition(payload.toolKey);

    if (!tool) {
      throw new NotFoundException(`未知工具: ${payload.toolKey}`);
    }

    const now = new Date().toISOString();
    const task: MiniToolTask = {
      id: `tool_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      toolKey: tool.key,
      toolTitle: tool.title,
      sourceType: payload.sourceType,
      fileName: payload.fileName || this.getDefaultFileName(payload.sourceType),
      region: payload.region,
      status: 'ready',
      createdAt: now,
      result: {
        title: payload.resultTitle || `${tool.title}-${now.slice(0, 10)}`,
        summary: this.getResultSummary(payload),
        exportTypes: this.getExportTypes(payload.toolKey),
      },
    };

    this.tasks.set(task.id, task);
    return task;
  }

  listRecentTasks(): MiniToolTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTask(id: string): MiniToolTask {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundException(`工具任务不存在: ${id}`);
    }

    return task;
  }

  private getDefaultFileName(sourceType: CreateMiniToolTaskDto['sourceType']): string {
    if (sourceType === 'video') {
      return 'sample-video.mp4';
    }

    if (sourceType === 'text') {
      return 'text-input';
    }

    if (sourceType === 'form') {
      return 'form-input';
    }

    return 'sample-image.jpg';
  }

  private getExportTypes(toolKey: string): string[] {
    if (toolKey === 'video-watermark') {
      return ['mp4'];
    }

    if (toolKey === 'translate') {
      return ['txt'];
    }

    return ['jpg', 'png'];
  }

  private getResultSummary(payload: CreateMiniToolTaskDto): string {
    if (payload.outputText) {
      return payload.outputText;
    }

    if (payload.toolKey === 'image-watermark') {
      return `已标记${this.getRegionLabel(payload.region)}，可接入图像修复服务生成无水印图片。`;
    }

    if (payload.toolKey === 'video-watermark') {
      return `已标记${this.getRegionLabel(payload.region)}，可接入视频逐帧修复服务输出无水印视频。`;
    }

    return '任务已完成，可在此接入生产处理服务。';
  }

  private getRegionLabel(region?: CreateMiniToolTaskDto['region']): string {
    if (region === 'top-right') {
      return '右上角水印区域';
    }

    if (region === 'center') {
      return '中间水印区域';
    }

    return '右下角水印区域';
  }
}
