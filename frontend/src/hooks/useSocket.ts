import { useEffect, useState, useRef } from "react";

const WS_URL = "wss://chess-game-1-k2df.onrender.com";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        const handleOpen = () => {
          console.log("✅ WebSocket connected");
          setSocket(ws);
          setIsConnected(true);
          setReconnectAttempts(0);
        };

        const handleClose = () => {
          console.log(" WebSocket disconnected");
          setIsConnected(false);
          setSocket(null);

          // attempt reconnect if we haven't exceeded max attempts
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log(`Reconnecting in ${RECONNECT_DELAY}ms... (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
            setReconnectAttempts((prev) => prev + 1);

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, RECONNECT_DELAY);
          } else {
            console.error(" Max reconnection attempts reached. Please refresh the page.");
          }
        };

        const handleError = (err: Event) => {
          console.error("WebSocket error:", err);
        };

        ws.addEventListener("open", handleOpen);
        ws.addEventListener("close", handleClose);
        ws.addEventListener("error", handleError);
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        try {
          ws.close();
        } catch {}
      }
    };
  }, []);

  return { socket, isConnected, reconnectAttempts };
};