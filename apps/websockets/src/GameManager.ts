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

  private generateUniqueGameId(): string {
    let gameId: string;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {

      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 4);
      const uuid = Bun.randomUUIDv7().slice(0, 4);
      
     
      gameId = (timestamp.slice(-2) + random.slice(0, 2)).toUpperCase();
      
   
      if (this.games.has(gameId)) {
        gameId = uuid.toUpperCase();
      }
      
      attempts++;
    } while (this.games.has(gameId) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      gameId = Bun.randomUUIDv7().slice(0, 8).toUpperCase();
    }
    
    console.log(`Generated game ID: ${gameId} (attempts: ${attempts})`);
    return gameId;
  }

  createRoom(admin: User): string {
    const gameId = this.generateUniqueGameId();
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
    
    console.log(`Room created: ${gameId}, Total games: ${this.games.size}`);
    this.broadcast(game, { type: "room_created", roomId: gameId });
    return gameId;
  }

  joinRoom(roomId: string, user: User): boolean {
    console.log(`Attempting to join room: ${roomId}, Available rooms: ${Array.from(this.games.keys())}`);
    
    const game = this.games.get(roomId);
    if (!game || game.active) {
      console.log(`Failed to join room: ${roomId} - ${!game ? 'Room not found' : 'Game already active'}`);
      return false;
    }
    
    game.players.set(user.id, user);
    user.roomId = roomId;
    this.broadcast(game, { 
      type: "user_joined", 
      user: user.name,
      players: Array.from(game.players.values()).map(p => ({ name: p.name, lifes: p.lifes, eliminated: p.eliminated }))
    });
    
    console.log(`User ${user.name} joined room ${roomId}`);
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
    console.log(`Game started in room: ${roomId}`);
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
    
    console.log(`New turn in room ${game.id}: Player ${game.players.get(game.currentTurn!)?.name}, Set: ${game.currentSet}`);
    
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
    console.log(`Word accepted in room ${roomId}: ${normalizedWord} by ${user.name}`);
    this.broadcast(game, { type: "word_accepted", word: normalizedWord, user: user.name });
    this.nextTurn(game);
    return true;
  }

  private failTurn(game: Game) {
    const user = game.players.get(game.currentTurn!);
    if (!user) return;
    
    user.lifes -= 1;
    console.log(`Player ${user.name} failed turn in room ${game.id}, lives remaining: ${user.lifes}`);
    
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
    console.log(`Game ended in room: ${roomId}`);
    this.broadcast(game, { type: "game_ended" });
    this.games.delete(game.id);
    return true;
  }

  removeUserFromGame(roomId: string, userId: string) {
    const game = this.games.get(roomId);
    if (!game) return;
    
    const user = game.players.get(userId);
    if (!user) return;
    
    console.log(`Removing user ${user.name} from room ${roomId}`);
    game.players.delete(userId);
    
    if (game.players.size === 0) {
      if (game.timer) clearTimeout(game.timer);
      console.log(`Deleting empty room: ${roomId}`);
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
      console.log(`New admin assigned: ${newAdmin.name}`);
       //@ts-ignore
      this.broadcast(game, { type: "new_admin", user: newAdmin.name });
    }
    
    // If it was current turn player, move to next turn
    if (game.active && game.currentTurn === userId) {
      console.log(`Current turn player left, moving to next turn`);
      this.nextTurn(game);
    }
  }

  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId);
  }

  // Debug method to see all active games
  listGames() {
    console.log("Active games:", Array.from(this.games.keys()));
    return Array.from(this.games.keys());
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