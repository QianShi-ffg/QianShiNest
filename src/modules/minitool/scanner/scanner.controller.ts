import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { findMiniToolDefinition } from '../tools/tool-definitions';
import type { CreateMiniToolScanTaskDto } from './dto/create-scan-task.dto';
import { MiniToolScannerTaskService } from './scanner-task.service';

@Controller('minitool/scanner')
export class MiniToolScannerController {
  constructor(private readonly scannerTaskService: MiniToolScannerTaskService) {}

  @Get('tools')
  getTools() {
    return [findMiniToolDefinition('file-scan')].filter(Boolean);
  }

  @Get('tools/:key')
  getTool(@Param('key') key: string) {
    const tool = findMiniToolDefinition(key);
    return tool?.key === 'file-scan' ? tool : null;
  }

  @Post('tasks')
  createTask(@Body() payload: CreateMiniToolScanTaskDto) {
    return this.scannerTaskService.createTask(payload);
  }

  @Get('tasks')
  getRecentTasks() {
    return this.scannerTaskService.listRecentTasks();
  }

  @Get('tasks/:id')
  getTask(@Param('id') id: string) {
    return this.scannerTaskService.getTask(id);
  }
}
