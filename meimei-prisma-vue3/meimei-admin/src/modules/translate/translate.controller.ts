import { Body, Controller, Post } from '@nestjs/common';
import { TranslateService } from "./translate.service";

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {
    
  }

  @Post('text')
  async translate(@Body() params: { query: string, from: string, to: string }) {
    return this.translateService.translate(params)
  }
}