import { Module } from '@nestjs/common';
import { MiniToolScannerController } from './scanner/scanner.controller';
import { MiniToolScannerTaskService } from './scanner/scanner-task.service';
import { MiniToolTaskController } from './tool-tasks/tool-task.controller';
import { MiniToolTaskService } from './tool-tasks/tool-task.service';
import { MiniToolToolsController } from './tools/tools.controller';

@Module({
  controllers: [
    MiniToolScannerController,
    MiniToolTaskController,
    MiniToolToolsController,
  ],
  providers: [MiniToolScannerTaskService, MiniToolTaskService],
})
export class MiniToolModule {}
