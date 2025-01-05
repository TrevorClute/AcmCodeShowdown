import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake.query?.token as string | undefined;
    if (!token) {
      throw new WsException('no token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client['user'] = payload;
      return true;
    } catch {
      throw new WsException('invalid jwt');
    }
  }
}
