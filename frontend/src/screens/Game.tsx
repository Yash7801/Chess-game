import { useEffect, useState } from "react";
import { Button } from "../Components/Buttons.tsx";
import { ChessBoard } from "../Components/ChessBoard";
import { useSocket } from "../hooks/useSocket.ts";
import { Chess, type Square } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";

export const Game = () => {
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);

  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  const handleMove = (from: string, to: string) => {
    const move = chess.move({ from, to });

    if (!move) {
      console.log("Illegal move", from, to);
      return;
    }

    // agr new join kra toh new board
    
    const fresh = new Chess(chess.fen());

    setChess(fresh);
    setBoard(fresh.board());

    setLastMove({ from, to });

    socket!.send(
      JSON.stringify({
        type: MOVE,
        payload: { from, to },
      })
    );
  };


  useEffect(() => {
    if (!socket) return;
    

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME: {
          const newGame = new Chess();
          setChess(newGame);
          setBoard(newGame.board());
          setMyColor(message.payload.color);
          break;
        }

        case MOVE: {
          const { from, to } = message.payload;

          
          if (lastMove && lastMove.from === from && lastMove.to === to) {
            setLastMove(null);
            return;
          }

          setChess((prev) => {
            const fresh = new Chess(prev.fen());
            fresh.move({ from, to });
            setBoard(fresh.board());
            return fresh;
          });

          break;
        }
      }
    };
  }, [socket, lastMove]);

  if (!socket) return <div>Connecting…</div>;
  const isMyTurn = myColor !== null && chess.turn() === myColor[0];


  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 margin w-full justify-center">
            <ChessBoard
              board={board}
              onMove={handleMove}
              myColor={myColor}
              isMyTurn={isMyTurn}
              getMovesForSquare={(sq: Square) =>
                chess.moves({ square: sq, verbose: true }).map((m) => m.to as Square)
              }
            />

          </div>

          <div className="col-span-2 bg-[#312E2B] w-full flex justify-center">
            <div className="pt-8">
              <Button
                onClick={() => {
                  socket!.send(JSON.stringify({ type: INIT_GAME }));
                }}
              >
                Play Online
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
