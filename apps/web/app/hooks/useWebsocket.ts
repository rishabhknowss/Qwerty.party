import { useEffect, useState } from "react";

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");

    setSocket(ws);
    ws.onopen = () => {
      console.log("connected socket");
    };
  }, []);

  return socket;
};
