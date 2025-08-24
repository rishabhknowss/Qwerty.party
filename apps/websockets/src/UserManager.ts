// UserManager.ts
import { User } from "./types.js";
import WebSocket from "ws";
import { randomUUID } from "crypto";

export class UserManager {
  private static instance: UserManager;

  private constructor() {}

  static getInstance() {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  createUser(userSocket: WebSocket, name: string): User {
    const user: User = {
      id: randomUUID(),
      socket: userSocket,
      name: name.trim(),
      lifes: 5,
      admin: false,
      eliminated: false,
    };

    return user;
  }
}
