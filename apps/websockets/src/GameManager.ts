import { User, Game } from "./types.js";


export class GameManager {
  private static instance: GameManager;
  private games: Map<string, Game> = new Map();

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  private generateLetterSet(): string {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const len = Math.floor(Math.random() * 3) + 2;
    let set = "";
    for (let i = 0; i < len; i++) {
      set += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return set;
  }

  createRoom(admin: User): string {
    const gameId =Bun.randomUUIDv7().slice(0, 4);
    const game: Game = {
      id: gameId,
      players: new Map([[admin.id, admin]]),
      submittedWords: new Set(),
      currentTurn: null,
      active: false,
      currentSet: "",
      timer: null,
    };
    admin.roomId = gameId;
    admin.admin = true;
    this.games.set(gameId, game);
    this.broadcast(game, { type: "room_created", roomId: gameId });
    return gameId;
  }

  joinRoom(roomId: string, user: User): boolean {
    const game = this.games.get(roomId);
    if (!game || game.active) return false;
    
    game.players.set(user.id, user);
    user.roomId = roomId;
    this.broadcast(game, { 
      type: "user_joined", 
      user: user.name,
      players: Array.from(game.players.values()).map(p => ({ name: p.name, lifes: p.lifes, eliminated: p.eliminated }))
    });
    return true;
  }

  startGame(roomId: string, userId: string): boolean {
    const game = this.games.get(roomId);
    if (!game) return false;
    
    const user = game.players.get(userId);
    if (!user || !user.admin) return false;
    
    if (game.players.size < 2) {
      this.broadcastToUser(user, { type: "error", message: "Need at least 2 players to start" });
      return false;
    }
    
    game.active = true;
    this.nextTurn(game);
    return true;
  }

  private nextTurn(game: Game) {
    if (game.timer) clearTimeout(game.timer);

    const alivePlayers = Array.from(game.players.values()).filter(
      (u) => !u.eliminated && u.lifes > 0
    );
    
    if (alivePlayers.length <= 1) {
      this.broadcast(game, {
        type: "game_over",
        winner: alivePlayers[0]?.name || "No one",
      });
      game.active = false;
      return;
    }

    if (!game.currentTurn) {
      //@ts-ignore
      game.currentTurn = alivePlayers[0].id;
    } else {
      const idx = alivePlayers.findIndex((u) => u.id === game.currentTurn);
      //@ts-ignore
      game.currentTurn = alivePlayers[(idx + 1) % alivePlayers.length].id;
    }

    game.currentSet = this.generateLetterSet();
    game.submittedWords.clear(); // Reset submitted words for new turn
    
    this.broadcast(game, {
      type: "new_turn",
      playerId: game.currentTurn,
      playerName: game.players.get(game.currentTurn!)?.name,
      set: game.currentSet,
      timeLimit: 6000
    });

    game.timer = setTimeout(() => {
      this.failTurn(game);
    }, 6000);
  }

  submitWord(roomId: string, userId: string, word: string): boolean {
    const game = this.games.get(roomId);
    if (!game || !game.active || game.currentTurn !== userId) return false;

    const user = game.players.get(userId);
    if (!user) return false;

    const normalizedWord = word.toLowerCase().trim();
    
    if (!normalizedWord) {
      this.broadcastToUser(user, { type: "error", message: "Word cannot be empty" });
      return false;
    }

    if (game.submittedWords.has(normalizedWord)) {
      this.broadcastToUser(user, { type: "error", message: "Word already used" });
      return false;
    }

    if (!normalizedWord.includes(game.currentSet.toLowerCase())) {
      this.broadcastToUser(user, { type: "error", message: `Word must contain "${game.currentSet}"` });
      return false;
    }

    // Add basic word validation (you might want to integrate with a dictionary API)
    if (normalizedWord.length < 3) {
      this.broadcastToUser(user, { type: "error", message: "Word must be at least 3 letters" });
      return false;
    }

    game.submittedWords.add(normalizedWord);
    this.broadcast(game, { type: "word_accepted", word: normalizedWord, user: user.name });
    this.nextTurn(game);
    return true;
  }

  private failTurn(game: Game) {
    const user = game.players.get(game.currentTurn!);
    if (!user) return;
    
    user.lifes -= 1;
    if (user.lifes <= 0) {
      user.eliminated = true;
      this.broadcast(game, {
        type: "player_eliminated",
        user: user.name,
      });
    } else {
      this.broadcast(game, {
        type: "life_lost",
        user: user.name,
        lifes: user.lifes,
      });
    }
    this.nextTurn(game);
  }

  endGame(roomId: string, userId: string): boolean {
    const game = this.games.get(roomId);
    if (!game) return false;
    
    const user = game.players.get(userId);
    if (!user || !user.admin) return false;
    
    if (game.timer) clearTimeout(game.timer);
    this.broadcast(game, { type: "game_ended" });
    this.games.delete(game.id);
    return true;
  }

  removeUserFromGame(roomId: string, userId: string) {
    const game = this.games.get(roomId);
    if (!game) return;
    
    const user = game.players.get(userId);
    if (!user) return;
    
    game.players.delete(userId);
    
    if (game.players.size === 0) {
      if (game.timer) clearTimeout(game.timer);
      this.games.delete(roomId);
      return;
    }
    
    this.broadcast(game, { 
      type: "user_left", 
      user: user.name,
      players: Array.from(game.players.values()).map(p => ({ name: p.name, lifes: p.lifes, eliminated: p.eliminated }))
    });
    
    // If the leaving user was admin, assign new admin
    if (user.admin && game.players.size > 0) {
      const newAdmin = Array.from(game.players.values())[0];
      //@ts-ignore
      newAdmin.admin = true;
      //@ts-ignore
      this.broadcast(game, { type: "new_admin", user: newAdmin.name });
    }
    
    // If it was current turn player, move to next turn
    if (game.active && game.currentTurn === userId) {
      this.nextTurn(game);
    }
  }

  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId);
  }

  private broadcast(game: Game, message: any) {
    game.players.forEach((player) => {
      if (player.socket.readyState === player.socket.OPEN) {
        player.socket.send(JSON.stringify(message));
      }
    });
  }

  private broadcastToUser(user: User, message: any) {
    if (user.socket.readyState === user.socket.OPEN) {
      user.socket.send(JSON.stringify(message));
    }
  }
}

