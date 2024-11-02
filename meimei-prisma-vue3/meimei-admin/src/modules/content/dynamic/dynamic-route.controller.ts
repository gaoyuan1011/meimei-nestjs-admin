import { Controller, Get, Header } from '@nestjs/common';
import { Keep } from 'src/common/decorators/keep.decorator';
import { Public } from 'src/common/decorators/public.decorator';

export function createDynamicController(path: string, handler: () => string) {
  @Controller(path)
  class DynamicController {
    @Get()
    @Public()
    @Keep()
    @Header('Content-Type', 'text/html; charset=UTF-8')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    get() {
      return handler();
    }
  }
  return DynamicController;
}