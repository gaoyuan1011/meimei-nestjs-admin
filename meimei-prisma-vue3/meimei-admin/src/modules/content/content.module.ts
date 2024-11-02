import { Module } from '@nestjs/common';
import { TranslateModule } from './translate/translate.module';
import { DynamicRouteModule } from './dynamic/dynamic-route.module';

@Module({
  imports: [
    TranslateModule,
    /** 
    * 注册动态路由
    */
    DynamicRouteModule.register()
  ],
})
export class ContentModule {}
