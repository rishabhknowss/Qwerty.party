import WebSocket from "ws";

export interface User {
  id: string;
  socket: WebSocket;
  name: string;
  lifes: number;
  admin: boolean;
  eliminated: boolean;
  roomId?: string;
}

export interface Game {
  id: string;
  players: Map<string, User>;
  submittedWords: Set<string>;
  currentTurn: string | null;
  active: boolean;
  currentSet: string;
  timer: NodeJS.Timeout | null;
}