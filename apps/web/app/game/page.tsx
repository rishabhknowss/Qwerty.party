"use client";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebsocket";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [gameId, setGameId] = useState("");
  const ws = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "created" || data.type === "joined") {
        setGameId(data.gameId);
        setPlayerId(data.userId);
      }
    };
  }, [ws]);

  useEffect(() => {
    if (playerId && gameId) {
      router.push(`/${gameId}`);
    }
  }, [playerId, gameId, router]);

  function handleEnterGame(e: React.KeyboardEvent) {
    if (e.key !== "Enter" || !ws) return;

    if (gameId) {
      ws.send(
        JSON.stringify({
          type: "join",
          gameId: gameId.toUpperCase(),
          name : playerName,
        })
      );
    } else {
      ws.send(JSON.stringify({ type: "create", name : playerName }));
    }
  }

  function createOrJoinGame() {
    if (!ws) return;

    if (gameId) {
      ws.send(
        JSON.stringify({
          type: "join",
          gameId: gameId.toUpperCase(),
          name : playerName,
        })
      );
    } else {
      ws.send(JSON.stringify({ type: "create", name : playerName }));
    }
  }

  if (!ws) return <div>Loading...</div>;

  return (
    <div>
      <h1>Game Page</h1>

      <Input
        placeholder="Your name"
        className="w-48 text-center text-2xl font-bold"
        onChange={(e) => setPlayerName(e.target.value)}
        value={playerName}
        onKeyDown={handleEnterGame}
      />

      <Button onClick={createOrJoinGame} className="mt-4">
        Create new room
      </Button>

      <div className="my-2">or</div>

      <Input
        placeholder="Room Code"
        className="w-48 text-center text-2xl font-bold mt-4"
        onChange={(e) => setGameId(e.target.value)}
        value={gameId}
      />

      <Button onClick={createOrJoinGame} className="mt-4">
        Join Room
      </Button>
    </div>
  );
}
