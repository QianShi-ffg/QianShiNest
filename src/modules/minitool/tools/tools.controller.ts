import { Controller, Get, Param } from '@nestjs/common';
import { findMiniToolDefinition, miniToolDefinitions } from './tool-definitions';

@Controller('minitool/tools')
export class MiniToolToolsController {
  @Get()
  getTools() {
    return miniToolDefinitions;
  }

  @Get(':key')
  getTool(@Param('key') key: string) {
    return findMiniToolDefinition(key) ?? null;
  }
}
