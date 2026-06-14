import { Injectable, NotFoundException } from '@nestjs/common';
import { findMiniToolDefinition } from '../tools/tool-definitions';
import type { CreateMiniToolScanTaskDto } from './dto/create-scan-task.dto';

export type MiniToolScanTaskStatus = 'queued' | 'processing' | 'ready';

export interface MiniToolScanTask {
  id: string;
  toolKey: string;
  toolTitle: string;
  sourceType: CreateMiniToolScanTaskDto['sourceType'];
  fileNames: string[];
  pageCount: number;
  status: MiniToolScanTaskStatus;
  createdAt: string;
  result: {
    previewName: string;
    exportTypes: string[];
    note: string;
  };
}

@Injectable()
export class MiniToolScannerTaskService {
  private readonly tasks = new Map<string, MiniToolScanTask>();

  createTask(payload: CreateMiniToolScanTaskDto): MiniToolScanTask {
    const tool = findMiniToolDefinition(payload.toolKey);

    if (!tool || tool.key !== 'file-scan') {
      throw new NotFoundException(`未知文件扫描工具: ${payload.toolKey}`);
    }

    const now = new Date().toISOString();
    const task: MiniToolScanTask = {
      id: `scan_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      toolKey: tool.key,
      toolTitle: tool.title,
      sourceType: payload.sourceType,
      fileNames: payload.fileNames ?? [],
      pageCount: this.resolvePageCount(payload),
      status: 'ready',
      createdAt: now,
      result: {
        previewName: `${tool.title}-${now.slice(0, 10)}`,
        exportTypes: ['pdf', 'jpg'],
        note: '已创建扫描任务，后续可在此接入自动切边、透视矫正、OCR 和 PDF 引擎。',
      },
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): MiniToolScanTask {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundException(`扫描任务不存在: ${id}`);
    }

    return task;
  }

  listRecentTasks(): MiniToolScanTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private resolvePageCount(payload: CreateMiniToolScanTaskDto): number {
    if (payload.pageCount && payload.pageCount > 0) {
      return payload.pageCount;
    }

    return Math.max(payload.fileNames?.length ?? 0, 1);
  }
}
