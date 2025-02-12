import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.css',
})
export class QueueComponent implements OnInit , OnDestroy{
  timer:number = 0
  intervalId:any
  constructor(readonly socketService: SocketService) { }

  ngOnDestroy(): void {
    clearInterval(this.intervalId)
  }

  ngOnInit(): void {
    this.socketService.init()
    this.intervalId = setInterval(()=>{
      this.timer += 1
    },1000)
  }
}
