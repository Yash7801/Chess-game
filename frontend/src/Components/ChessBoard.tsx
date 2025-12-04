import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";

const PIECE_IMAGES: any = {
  p: { w: "/pieces/wP.svg", b: "/pieces/bP.svg" },
  r: { w: "/pieces/wR.svg", b: "/pieces/bR.svg" },
  n: { w: "/pieces/wN.svg", b: "/pieces/bN.svg" },
  b: { w: "/pieces/wB.svg", b: "/pieces/bB.svg" },
  q: { w: "/pieces/wQ.svg", b: "/pieces/bQ.svg" },
  k: { w: "/pieces/wK.svg", b: "/pieces/bK.svg" },
};

export const ChessBoard = ({
  board,
  isMyTurn,
  onMove,
  myColor,
  getMovesForSquare,
}: {
  board: (
    | {
        square: Square;
        type: PieceSymbol;
        color: Color;
      }
    | null
  )[][];
  onMove: (from: Square, to: Square) => void;
  myColor: "white" | "black" | null;
  getMovesForSquare: (sq: Square) => Square[];
  isMyTurn: boolean;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  const getSquare = (i: number, j: number): Square => {
    if (myColor === "white") {
      const file = String.fromCharCode(97 + j);
      const rank = 8 - i;
      return `${file}${rank}` as Square;
    }

    const file = String.fromCharCode(97 + (7 - j));
    const rank = i + 1;
    return `${file}${rank}` as Square;
  };

  const displayedBoard =
    myColor === "white"
      ? board
      : [...board].reverse().map((row) => [...row].reverse());

  return (
    <div className="text-white-200 select-none">
      {displayedBoard.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const sq = getSquare(i, j);

            const isSelected = from === sq;
            const isLegalMove = legalMoves.includes(sq);

            return (
              <div
                key={j}
                onClick={() => {
                  if (!myColor || !isMyTurn) return;

                  // if clicking on a square with a legal move destination
                  if (from && isLegalMove) {
                    onMove(from, sq);
                    setFrom(null);
                    setLegalMoves([]);
                    return;
                  }

                  // if clicking on a square with our own piece, select it (or deselect if same)
                  if (square && square.color === myColor[0]) {
                    if (from === sq) {
                      // deselect if clicking same piece again
                      setFrom(null);
                      setLegalMoves([]);
                    } else {
                      // select new piece (allows switching without completing move)
                      setFrom(sq);
                      setLegalMoves(getMovesForSquare(sq));
                    }
                    return;
                  }

                  // if clicking on opponent's piece or empty square (and no legal move), do nothing
                  setFrom(null);
                  setLegalMoves([]);
                }}
                className={`w-16 h-16 flex items-center justify-center relative
                  ${(i + j) % 2 === 0 ? "bg-[#7a543d]" : "bg-[#e2caa3]"}
                  ${isSelected ? "outline outline-4 outline-yellow-400" : ""}
                `}
              >
                {/* possible moves */}
                {isLegalMove && !square && (
                  <div className="absolute w-5 h-5 rounded-full bg-[rgba(0,0,0,0.3)]"></div>
                )}

                {/* capture move highlight */}
                {isLegalMove && square && (
                  <div className="absolute w-14 h-14 rounded-full border-4 border-[rgba(0,0,0,0.3)]"></div>
                )}

                {square && (
                  <img
                    src={PIECE_IMAGES[square.type][square.color]}
                    className="w-14 h-14 pointer-events-none select-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};