import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { ScannerComponent } from './game/scanner/scanner.component';
import { MultiScannerComponent } from './game/scanner/multi-scanner/multi-scanner.component';
import { LocalGameComponent } from './game/local-game/local-game.component';
import { QueueComponent } from './queue/queue.component';
import { LearnToPlayComponent } from './learn-to-play/learn-to-play.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: 'scanner', component: ScannerComponent },
  { path: 'multi-scanner', component: MultiScannerComponent },
  { path: 'local-game', component: LocalGameComponent },
  { path: 'queue', component: QueueComponent },
  { path: 'learn-to-play', component: LearnToPlayComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
