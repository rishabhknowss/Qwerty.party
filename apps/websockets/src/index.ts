import  { WebSocketServer } from "ws";
import { UserManager } from "./UserManager.js";
import { GameManager } from "./GameManager.js";

const wss = new WebSocketServer({ port: 8080 });
const userManager = UserManager.getInstance();
const gameManager = GameManager.getInstance();

console.log("WebSocket server started on port 8080");

wss.on("connection", (ws) => {
  let currentUser: any = null;

  console.log("New client connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log("Received message:", data);

      switch (data.type) {
        case "create":
          if (!data.name?.trim()) {
            ws.send(JSON.stringify({ type: "error", message: "Name is required" }));
            return;
          }
          
          currentUser = userManager.createUser(ws, data.name);
          const gameId = gameManager.createRoom(currentUser);
          ws.send(JSON.stringify({ 
            type: "created", 
            gameId, 
            userId: currentUser.id,
            name: currentUser.name
          }));
          break;

        case "join":
          if (!data.gameId || !data.name?.trim()) {
            ws.send(JSON.stringify({ type: "error", message: "Game ID and name are required" }));
            return;
          }
          
          currentUser = userManager.createUser(ws, data.name);
          const joined = gameManager.joinRoom(data.gameId, currentUser);
          
          if (joined) {
            ws.send(JSON.stringify({ 
              type: "joined", 
              gameId: data.gameId, 
              userId: currentUser.id,
              name: currentUser.name
            }));
          } else {
            ws.send(JSON.stringify({ type: "error", message: "Could not join game" }));
          }
          break;

        case "start":
          if (!currentUser?.roomId) {
            ws.send(JSON.stringify({ type: "error", message: "Not in a game" }));
            return;
          }
          
          const started = gameManager.startGame(currentUser.roomId, currentUser.id);
          if (!started) {
            ws.send(JSON.stringify({ type: "error", message: "Could not start game" }));
          }
          break;

        case "submit":
          if (!currentUser?.roomId || !data.word) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid submission" }));
            return;
          }
          
          gameManager.submitWord(currentUser.roomId, currentUser.id, data.word);
          break;

        case "end":
          if (!currentUser?.roomId) {
            ws.send(JSON.stringify({ type: "error", message: "Not in a game" }));
            return;
          }
          
          gameManager.endGame(currentUser.roomId, currentUser.id);
          break;

        default:
          ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (currentUser?.roomId) {
      gameManager.removeUserFromGame(currentUser.roomId, currentUser.id);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.close();
  process.exit(0);
});