import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocketService } from '../socket.service';
import { ScannerService } from '../game/scanner/scanner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(readonly socketService:SocketService, readonly scannerService:ScannerService) { }
}
