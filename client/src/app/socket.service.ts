import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { PlayerService } from './game/player.service';
import { Router } from '@angular/router';
import { TimeService } from './game/time.service';
import { Status } from './game/Player';
import { Observable } from 'rxjs';

type SessionInfo = { sessionId: string; color: string; startTime: number };

const getOther = { red: 'Blue', blue: 'Red' };

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket;
  sessionInfo?: SessionInfo;
  isActive: boolean = false;

  constructor(
    readonly playerService: PlayerService,
    readonly router: Router,
    readonly timeService: TimeService,
  ) {
    //this.socket = io('http://10.235.4.191:3000');
    this.socket = io('https://10.233.253.76:3000', {
      secure: true,
      rejectUnauthorized: false,
    });
    //this.socket = io('https://localhost:3000');
    this.socket.on('connect', () => {
      this.isActive = true;
    });
  }

  init() {
    this.joinQueue();
    this.onGameStart();
    this.onOtherStatusChange();
  }

  joinQueue() {
    this.socket.emit('queue');
  }

  sendStatus(status: Status) {
    this.socket.emit('status', status, (res: boolean) => {});
  }

  sendFace(canvas: OffscreenCanvas) {
    canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
      blob.arrayBuffer().then((buf) => {
        this.socket.emit('face', buf);
      });
    });
  }

  onReceiveFace() {
    return new Observable<OffscreenCanvas>((sub) => {
      this.socket.on('receive-face', (buf) => {
        const blob = new Blob([buf], { type: 'image/png' });
        createImageBitmap(blob).then((img) => {
          const canvas = new OffscreenCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          sub.next(canvas);
        });
      });
    });
  }

  onGameStart() {
    this.socket.on('game-start', (sessionInfo: SessionInfo) => {
      this.sessionInfo = sessionInfo;
      this.router.navigateByUrl(`/game?color=${sessionInfo.color}`);
      this.timeService.initialTime = sessionInfo.startTime;
    });
  }

  gameEnd() {
    this.socket.on('game-end', (sessionInfo: SessionInfo) => {});
  }

  onOtherStatusChange() {
    this.socket.on('other-status', (status: Status) => {
      if (this.sessionInfo?.color === 'Blue') {
        this.playerService.setRedStatus(status);
      } else if (this.sessionInfo?.color === 'Red') {
        this.playerService.setBlueStatus(status);
      }
    });
  }
}
