import { Component, viewChild } from '@angular/core';
import { GameComponent } from '../game.component';
import { CommonModule } from '@angular/common';
import { ScannerComponent } from '../scanner/scanner.component';
import { MultiScannerComponent } from '../scanner/multi-scanner/multi-scanner.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'local-game',
  standalone: true,
  imports: [CommonModule, GameComponent, ScannerComponent, MultiScannerComponent, RouterLink],
  templateUrl: './local-game.component.html',
  styleUrl: './local-game.component.css'
})
export class LocalGameComponent  extends GameComponent{
  override scanner = viewChild(MultiScannerComponent)

  override loop() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.playerService.setBlueStatus(this.scanner()?.status || 'none');
    this.playerService.setRedStatus(this.scanner()?.statusRight || 'none');
    if(this.scanner()?.faceCanvas){
      this.playerService.setBlueFace(this.scanner()?.faceCanvas!)
    }
    if(this.scanner()?.faceCanvasRight){
      this.playerService.setRedFace(this.scanner()?.faceCanvasRight!)
    }
    this.playerService.update(this.ctx);
    if(this.timeService.phase === 'gameover' && !this.winner){
      this.playerService.gameOver()
      if(this.playerService.winner !== 'tie'){
        this.winner = `${this.playerService.winner} wins!`
        return;
      }
      this.winner = this.playerService.winner
    }
  }

  override ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.playerService.reset()
    this.timeService.reset()
  }

  playAgain(){
    this.playerService.reset()
    this.timeService.reset()
    this.scanner()?.reset()
  }

}
