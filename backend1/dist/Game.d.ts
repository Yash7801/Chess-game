import WebSocket from "ws";
import { Chess } from "chess.js";
export declare class Game {
    player1: WebSocket;
    player2: WebSocket;
    board: Chess;
    private moveCount;
    constructor(player1: WebSocket, player2: WebSocket);
    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }): void;
    handleTimeout(timedOutColor: "white" | "black"): void;
}
//# sourceMappingURL=Game.d.ts.map