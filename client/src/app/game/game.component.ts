import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  viewChild,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { animationFrames, Subscription } from 'rxjs';
import { PlayerService } from './player.service';
import { TimeService } from './time.service';
import { canvasWidth } from './constants';
import { ScannerComponent } from './scanner/scanner.component';
import { ScannerService } from './scanner/scanner.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterLink, CommonModule, ScannerComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements AfterViewInit, OnDestroy, OnInit {
  constructor(
    readonly playerService: PlayerService,
    readonly timeService: TimeService,
    readonly scannerService: ScannerService,
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly socketService: SocketService,
  ) {
    this.style.transform = `scale(${innerWidth / canvasWidth})`;
    this.onWindowResize();
  }
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  scanner = viewChild(ScannerComponent);
  ctx!: CanvasRenderingContext2D;
  style: any = { transform: 'scale(1)' };
  sub?: Subscription;
  scannerWidth = 640;
  scannerHeight = 480;
  color: 'Red' | 'Blue' = 'Blue';
  winner = '';

  @HostListener('window:resize', ['$event'])
  async onWindowResize() {
    const ratio = innerWidth / canvasWidth;
    this.style.transform = `scale(${ratio})`;
    this.scannerWidth = innerWidth;
    this.scannerHeight = innerWidth * 0.75;
    if (this.scannerHeight > innerHeight) {
      this.scannerHeight = innerHeight;
      this.scannerWidth = innerHeight * 1.33333;
    }
  }

  returnHome(){
    this.router.navigateByUrl(`/home?forceRefresh=${Date.now()}`)
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.timeService.reset();
    this.playerService.reset();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    if (this.playerService[`set${this.color}Status`](this.scanner()?.status || 'none')) {
      this.socketService.sendStatus(this.playerService[`get${this.color}Status`]());
    }
    this.playerService.update(this.ctx);
    if (this.scanner()?.faceCanvas) {
      this.playerService[`set${this.color}Face`](this.scanner()?.faceCanvas!);
    }
    if (this.timeService.phase === 'gameover' && !this.winner) {
      this.playerService.gameOver();
      if (this.playerService.winner === 'tie') {
        this.winner = 'tie';
      } else {
        this.winner = `${this.playerService.winner} wins!`;
      }
    }
  }

  start() {
    this.sub = animationFrames().subscribe(({ timestamp }) => {
      this.timeService.injectDeltaTime(timestamp, () => {
        this.loop();
      });
    });
  }

  ngOnInit(): void {
    this.color = (this.route.snapshot.queryParamMap.get('color') as 'Red' | 'Blue' | null) || 'Blue';
    this.socketService.onReceiveFace().subscribe((canvas: OffscreenCanvas) => {
      const color = this.color === 'Red' ? 'Blue' : 'Red';
      this.playerService[`set${color}Face`](canvas);
    });
    this.start();
  }
}
