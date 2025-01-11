import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { animationFrames, Subscription } from 'rxjs';
import { PlayerService } from './player.service';
import { TimeService } from './time.service';
import { canvasWidth } from './globals';
import { Status } from './Player';
import { ScannerComponent } from './scanner/scanner.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterLink, CommonModule, ScannerComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements AfterViewInit, OnDestroy, OnInit{
  constructor(
    private readonly playerService: PlayerService,
    readonly timeService: TimeService,
  ) {
    //scale to screen
    this.style.transform = `scale(${innerWidth / canvasWidth})`;
  }
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  style: any = { transform: 'scale(1)' };
  sub?: Subscription;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.style.transform = `scale(${innerWidth / canvasWidth})`;
  }

  //test ---
  keys: [string] = ['n'];
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    this.execute(event.key);
  }
  @HostListener('window:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    this.execute('n');
  }
  execute(key: string) {
    const keyMap: Record<string, Status> = {
      d: this.playerService?.user.getDirection() === 'right' ? 'forward' : 'backward',
      a: this.playerService?.user.getDirection() === 'left' ? 'forward' : 'backward',
      r: 'righthit',
      l: 'lefthit',
      b: 'block',
      n: 'none',
    };
    this.playerService.setOppStatus(keyMap[key]);
  }
  //---

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = animationFrames().subscribe(({ timestamp }) => {
      this.timeService.injectDeltaTime(timestamp, () => {
        //main game loop
        this.ctx.clearRect(
          0,
          0,
          this.canvas.nativeElement.width,
          this.canvas.nativeElement.height,
        );
        this.playerService.update(this.ctx);
      });
    });
  }
}
