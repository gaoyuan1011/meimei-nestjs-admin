import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class DemoEnvironmentGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isDemoEnvironment =
      this.configService.get<boolean>('isDemoEnvironment');
    if (!isDemoEnvironment) return true;
    const request: Request = context.switchToHttp().getRequest();
    const allowUrlArr = ['/login', '/logout']; //放过的路由
    if (
      request.method.toLocaleLowerCase() != 'get' &&
      !allowUrlArr.includes(request.url)
    )
      throw new ApiException('演示环境,不允许操作');
    return true;
  }
}
