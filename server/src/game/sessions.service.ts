import { Injectable } from '@nestjs/common';
import { GameSession } from '../game/GameSession';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class SessionsService {
  private sessions = new Map<string, GameSession>();
  private activeClients = new Map<string, string>();

  joinSession(server: Server, clientId: string) {
    if (this.activeClients.has(clientId)) {
      return;
    }
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isFull()) continue;

      //found open session
      session.addClient(clientId);
      this.activeClients.set(clientId, sessionId);
      if (session.isFull()) {
        const startTime = Date.now();
        session.startTime = startTime;
        server.to(session.blue.id).emit('game-start', { sessionId, color: 'Blue', startTime });
        server.to(session.red.id).emit('game-start', { sessionId, color: 'Red', startTime });
      }
    }
    //if no sessions open create new session
    this.createNewSession(clientId);
  }

  createNewSession(clientId: string) {
    if (this.activeClients.has(clientId)) {
      return;
    }
    const sessionId = uuidv4();
    this.activeClients.set(clientId, sessionId);
    this.sessions.set(sessionId, new GameSession(sessionId));
    const color = this.sessions.get(sessionId).addClient(clientId);
    return { sessionId, color };
  }

  getSession(clientId: string) {
    return this.sessions.get(this.activeClients.get(clientId));
  }
}
