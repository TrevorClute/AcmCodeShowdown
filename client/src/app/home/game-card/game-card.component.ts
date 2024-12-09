import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'game-card',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css',
})
export class GameCardComponent {
  @Input({ required: true }) name!: string;
  @Input() styles: { [key: string]: string } = {};
}
