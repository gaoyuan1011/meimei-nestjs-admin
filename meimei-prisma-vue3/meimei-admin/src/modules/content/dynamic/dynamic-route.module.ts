import { Module, DynamicModule } from '@nestjs/common';
import { DynamicRouteService } from './dynamic-route.service';
import { createDynamicController } from './dynamic-route.controller';

@Module({})
export class DynamicRouteModule {
  static async register(): Promise<DynamicModule> {
    const routeService = new DynamicRouteService();
    const routes = await routeService.getRoutes();

    const dynamicControllers = routes.map(route => 
      createDynamicController(route.path, route.handler)
    );

    return {
      module: DynamicRouteModule,
      controllers: dynamicControllers,
    };
  }
}