import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { CreateMiniToolTaskDto } from './dto/create-tool-task.dto';
import { MiniToolTaskService } from './tool-task.service';

@Controller('minitool/tool-tasks')
export class MiniToolTaskController {
  constructor(private readonly toolTaskService: MiniToolTaskService) {}

  @Post()
  createTask(@Body() payload: CreateMiniToolTaskDto) {
    return this.toolTaskService.createTask(payload);
  }

  @Get()
  getRecentTasks() {
    return this.toolTaskService.listRecentTasks();
  }

  @Get(':id')
  getTask(@Param('id') id: string) {
    return this.toolTaskService.getTask(id);
  }
}
