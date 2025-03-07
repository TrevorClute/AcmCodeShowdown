import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageBody } from '@nestjs/websockets';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  test(@MessageBody() body:string){
    return "ok no go back to https://stick-fight.vercel.app/home"
  }
} 
