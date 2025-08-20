import WebSocket from "ws";

export interface User {
  id: string;
  socket: WebSocket;
  name: string;
  lifes: number;
}

export interface Room {
  id: string;
  players: Map<string, User>;
}

export class UserManager {
  private static instance: UserManager;
  private rooms: Map<string, Room> = new Map();

  private constructor() {}

  public static getInstance() {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  public joinRoom(roomId: string, user: User) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        players: new Map(),
      });
    }

    this.rooms.get(roomId)!.players.set(user.id, user);

    this.broadcast({
      roomId,
      message: { type: "player_joined", id: user.id, name: user.name },
    });
  }

  public leaveRoom({ roomId, userId }: { roomId: string; userId: string }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(userId);

    this.broadcast({
      roomId,
      message: { type: "player_left", id: userId },
    });

    if (room.players.size === 0) {
      this.rooms.delete(roomId); 
    }
  }

  public broadcast({ roomId, message }: { roomId: string; message: any }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const player of room.players.values()) {
      player.socket.send(JSON.stringify(message));
    }
  }


  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getUser(roomId: string, userId: string): User | undefined {
    return this.rooms.get(roomId)?.players.get(userId);
  }
}
