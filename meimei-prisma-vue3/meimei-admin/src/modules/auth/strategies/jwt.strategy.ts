import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { jwtConstants } from '../auth.constants';
import { Payload } from 'src/modules/login/login.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true, //设置回调的第一个参数是  request
    });
  }

  async validate(request: Request, payload: Payload) {
    const { userId, pv } = payload;
    const authorization = (request.headers as any).authorization || '';
    const token = authorization.slice(7);
    const user = await this.authService.validateToken(userId, pv, token);
    //返回值会被守卫的handleRequest方法接收
    return user || { userId };
  }
}
