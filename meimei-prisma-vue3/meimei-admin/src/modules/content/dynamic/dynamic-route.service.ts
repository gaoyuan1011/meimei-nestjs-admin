import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamicRouteService {
  async getRoutes() {
    // 从数据库获取路由信息
    return [
      { path: '/', method: 'get', handler: () => 'Home' },
      { path: '/dynamic-route-1', method: 'get', handler: () => 'Dynamic Route 1' },
      { path: '/dynamic-route-2', method: 'get', handler: () => 'Dynamic Route 2' },
      { path: '/dynamic-route-2/:id', method: 'get', handler: () => 'Dynamic Route 2 id' },
    ];
  }
}