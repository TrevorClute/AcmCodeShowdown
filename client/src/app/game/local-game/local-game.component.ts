import { Component, viewChild } from '@angular/core';
import { GameComponent } from '../game.component';
import { CommonModule } from '@angular/common';
import { ScannerComponent } from '../scanner/scanner.component';
import { MultiScannerComponent } from '../scanner/multi-scanner/multi-scanner.component';

@Component({
  selector: 'local-game',
  standalone: true,
  imports: [CommonModule, GameComponent, ScannerComponent, MultiScannerComponent],
  templateUrl: './local-game.component.html',
  styleUrl: './local-game.component.css'
})
export class LocalGameComponent  extends GameComponent{
  override scanner = viewChild(MultiScannerComponent)

  override loop() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.playerService.setBlueStatus(this.scanner()?.status || 'none');
    this.playerService.setRedStatus(this.scanner()?.statusRight || 'none');
    this.playerService.update(this.ctx);
    if(this.timeService.phase === 'gameover' && !this.winner){
      this.winner = this.playerService.winner
    }
  }

  override ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.playerService.reset()
    this.timeService.reset()
  }

}
