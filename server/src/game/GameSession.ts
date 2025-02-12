import { Server } from 'socket.io';

const playAreaWidth = 500;
export type Status = 'dead' | 'none' | 'isHit' | 'lefthit' | 'righthit' | 'block' | 'forward' | 'backward';
export type Color = 'red' | 'blue';
class Player {
  id: string;
  x: number;
  health: number;
  stamina: number;
  direction: 1 | -1;
  prevStateCheck: {
    timestamp: number;
    status: Status;
  };
  constructor(color: Color) {
    this.id = '';
    this.health = 1000;
    this.stamina = 100;
    this.prevStateCheck = { timestamp: 0, status: 'none' };
    if (color === 'blue') {
      this.x = 48;
      this.direction = 1;
    } else if (color === 'red') {
      this.x = 428;
      this.direction = -1;
    }
  }
  isValidChange(time: number, status: Status): boolean {
    if (this.prevStateCheck.status === 'lefthit' || this.prevStateCheck.status === 'righthit') {
      if (time - this.prevStateCheck.timestamp < 500) {
        return false;
      }
    }
    switch (status) {
      case 'none':
        break;
      case 'forward':
        break;
      case 'backward':
        break;
      case 'lefthit':
        break;
      case 'righthit':
        break;
      case 'block':
        break;
      case 'dead':
        break;
      default:
        break;
    }
    return true;
  }
  updateStatus(server: Server, time: number, status: Status) {

    switch (this.prevStateCheck.status) {
      case 'none':
        break;
      case 'forward':
        break;
      case 'backward':
        break;
      case 'lefthit':
        break;
      case 'righthit':
        break;
      case 'block':
        break;
      case 'dead':
        break;
      default:
        break;
    }
    this.prevStateCheck.status = status;
    this.prevStateCheck.timestamp = time;
    switch (status) {
      case 'none':
        break;
      case 'forward':
        break;
      case 'backward':
        break;
      case 'lefthit':
        break;
      case 'righthit':
        break;
      case 'block':
        break;
      case 'dead':
        break;
      default:
        break;
    }
  }

  update(time: number) {}
}

export class GameSession {
  sessionId: string;
  startTime: number;
  blue: Player;
  red: Player;
  clientToColorMap = new Map<string, Color>();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.blue = new Player('blue');
    this.red = new Player('red');
  }

  update(time: number) {
    this.red.update(time);
    this.blue.update(time);
  }

  updateStatus(server: Server, clientId: string, status: Status): boolean {
    const time = Date.now();
    if (this.clientToColorMap.get(clientId) === 'blue') {
      if (!this.blue.isValidChange(time, status)) return false;
      this.blue.updateStatus(server, time, status);
      server.to(this.red.id).emit('other-status', status);
    } else if (this.clientToColorMap.get(clientId) === 'red') {
      if (!this.red.isValidChange(time, status)) return false;
      server.to(this.blue.id).emit('other-status', status);
      this.red.updateStatus(server, time, status);
    }
    return true;
  }

  addClient(clientId: string): Color {
    if (this.isFull()) return;
    if (this.blue.id) {
      this.red.id = clientId;
      this.clientToColorMap.set(clientId, 'red');
      return 'red';
    } else {
      this.blue.id = clientId;
      this.clientToColorMap.set(clientId, 'blue');
      return 'blue';
    }
  }

  isFull(): string {
    return this.blue.id && this.red.id;
  }

  removeClient(clientId: string) {}
}
