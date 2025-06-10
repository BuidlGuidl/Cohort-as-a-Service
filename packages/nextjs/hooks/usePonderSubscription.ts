// packages/nextjs/hooks/usePonderSubscription.ts
import { useEffect, useState } from "react";

export const usePonderSubscription = (topic: string, callback: (data: any) => void) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_PONDER_WS_URL || "ws://localhost:42069/ws";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ action: "subscribe", topic }));
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = error => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [topic, callback]);

  return { isConnected };
};
