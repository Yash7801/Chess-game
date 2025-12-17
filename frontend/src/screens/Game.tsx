import { useEffect, useRef, useState } from "react";
import { Button } from "../Components/Buttons.tsx";
import { ChessBoard } from "../Components/ChessBoard";
import { MoveList } from "../Components/MoveList";
import { TimerPanel } from "../Components/TimerPanel";
import { useSocket } from "../hooks/useSocket.ts";
import { Chess, type Square } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const TIME_OUT = "time_out";

export const Game = () => {
  const { socket, isConnected, reconnectAttempts } = useSocket();

  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState(() => chess.board());
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);

  const [movesList, setMovesList] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [disconnectMessage, setDisconnectMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleTimeout = (timedOutColor: "white" | "black") => {
    socket?.send(
      JSON.stringify({
        type: TIME_OUT,
        payload: { color: timedOutColor },
      })
    );
  };

  // store last move WE sent to server
  const lastMoveRef = useRef<{ from: string; to: string } | null>(null);
  const gameStateRef = useRef<{ chess: Chess; movesList: string[]; myColor: string | null; gameOver: boolean; winner: string | null }>({
    chess,
    movesList,
    myColor,
    gameOver,
    winner,
  });

  // keep gameStateRef in sync
  useEffect(() => {
    gameStateRef.current = { chess, movesList, myColor, gameOver, winner };
  }, [chess, movesList, myColor, gameOver, winner]);

  
  // PLAYER MOVE
  
  const handleMove = (from: string, to: string) => {
    if (!isConnected) {
      alert("Disconnected from server. Please wait for reconnection.");
      return;
    }

    const move = chess.move({ from, to });
    if (!move) return;

    // update board locally
    const fresh = new Chess(chess.fen());
    setChess(fresh);
    setBoard(fresh.board());

    // mark as OUR move
    lastMoveRef.current = { from, to };

    // add to our move list
    setMovesList((prev) => [...prev, `You moved: ${from} → ${to}`]);

    // send to server
    socket?.send(
      JSON.stringify({
        type: MOVE,
        payload: { from, to },
      })
    );
  };

  
  // SOCKET MESSAGE HANDLING
  
  useEffect(() => {
    if (!socket) return;

    // guard to avoid duplicate handlers
    const GLOBAL_KEY = "__game_ws_handler_map__";
    if (!(window as any)[GLOBAL_KEY]) {
      (window as any)[GLOBAL_KEY] = new WeakMap<WebSocket, boolean>();
    }
    const attachedMap: WeakMap<WebSocket, boolean> = (window as any)[GLOBAL_KEY];

    if (attachedMap.get(socket)) {
      console.log("Game: socket already has a message handler attached (skip)");
      return;
    }

    console.log("Game: attaching WS message handler to socket");

    const handler = (event: MessageEvent) => {
      console.log("Game: WS message received");
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (err) {
        console.error("Invalid WS data", err);
        return;
      }

      switch (message.type) {
        case INIT_GAME: {
          const newGame = new Chess();
          setChess(newGame);
          setBoard(newGame.board());
          setMyColor(message.payload.color);
          setMovesList([]);
          setGameStarted(true);
          setDisconnectMessage(null);
          setGameOver(false);
          setWinner(null);
          lastMoveRef.current = null;
          break;
        }

        case MOVE: {
          const { from, to } = message.payload;

          // ignore our own echo
          if (
            lastMoveRef.current &&
            lastMoveRef.current.from === from &&
            lastMoveRef.current.to === to
          ) {
            lastMoveRef.current = null;
            return;
          }

          // apply opponent move using functional updater
          setChess((prevChess) => {
            const fresh = new Chess(prevChess.fen());
            const result = fresh.move({ from, to });
            if (!result) return prevChess;

            setBoard(fresh.board());
            const mover = result.color === "w" ? "White" : "Black";
            setMovesList((prev) => [...prev, `${mover} moved: ${from} → ${to}`]);
            return fresh;
          });

          break;
        }

        case GAME_OVER: {
          setGameOver(true);
          setWinner(message.payload.winner);
          break;
        }
      }
    };

    socket.addEventListener("message", handler);
    attachedMap.set(socket, true);

    return () => {
      try {
        socket.removeEventListener("message", handler);
      } catch {}
      attachedMap.set(socket, false);
    };
  }, [socket]);

  
  // CONNECTION STATUS HANDLER
  
  useEffect(() => {
    if (!isConnected && gameStarted) {
      setDisconnectMessage(
        reconnectAttempts >= 5
          ? " Connection lost. Please refresh the page."
          : ` Disconnected... Reconnecting (attempt ${reconnectAttempts}/5)...`
      );
    } else if (isConnected && disconnectMessage) {
      setDisconnectMessage(null);
    }
  }, [isConnected, gameStarted, reconnectAttempts, disconnectMessage]);

  
  // RENDER UI
  
  if (!isConnected) {
    return (
      <div className="justify-center flex items-center h-screen">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">
            {reconnectAttempts >= 5 ? " Connection Failed" : "🔄 Connecting..."}
          </div>
          <div className="text-gray-400">
            {reconnectAttempts >= 5
              ? "Max reconnection attempts reached. Please refresh the page."
              : `Attempt ${reconnectAttempts}/5`}
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = myColor !== null && chess.turn() === myColor[0] && !gameOver;

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        {/* DISCONNECT WARNING */}
        {disconnectMessage && (
          <div className="bg-red-900 text-white p-3 rounded mb-4 text-center">
            {disconnectMessage}
          </div>
        )}

        {/* GAME OVER MESSAGE */}
        {gameOver && winner && (
          <div className="bg-blue-900 text-white p-3 rounded mb-4 text-center">
            Game Over! Winner: {winner === "draw" ? "Draw" : winner === myColor ? "You" : winner}
          </div>
        )}

        <div className="grid grid-cols-6 gap-4 w-full">
          {/* CHESSBOARD */}
          <div className="col-span-4 margin w-full justify-center">
            <ChessBoard
              board={board}
              onMove={handleMove}
              myColor={myColor}
              isMyTurn={isMyTurn}
              getMovesForSquare={(sq: Square) =>
                chess.moves({ square: sq, verbose: true }).map((m) => (m as any).to as Square)
              }
            />
          </div>

          {/* MOVE LIST + PLAY BUTTON */}
          <div className="col-span-2 bg-[#312E2B] w-full flex flex-col items-center">
            {/* CONNECTION STATUS INDICATOR */}
            <div className="pt-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-white text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => {
                  socket!.send(JSON.stringify({ type: INIT_GAME }));
                }}
                disabled={!isConnected}
              >
                Play Online
              </Button>
            </div>

            {gameStarted && (
              <div className="mt-6 px-4 w-full">
                <TimerPanel
                  turn={chess.turn()}
                  isGameOver={gameOver}
                  initialSeconds={600} // 10 minutes
                  onTimeout={handleTimeout}
                />
              </div>
            )}

            <div className="mt-6 px-4 w-full">
              <MoveList moves={movesList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};