import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages.js";
export class Game {
    player1;
    player2;
    board;
    moveCount = 0;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: { color: "white" }
        }));
        player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: { color: "black" }
        }));
    }
    makeMove(socket, move) {
        console.log("========== makeMove() CALLED ==========");
        console.log("move =", move);
        // correct turn validation
        if (this.moveCount % 2 === 0 && socket !== this.player1)
            return; // white move
        if (this.moveCount % 2 === 1 && socket !== this.player2)
            return; // black move
        const result = this.board.move(move);
        if (!result) {
            console.log(" INVALID CHESS MOVE:", move);
            return;
        }
        const opponent = socket === this.player1 ? this.player2 : this.player1;
        // only send if opponent connection is open
        try {
            if (opponent.readyState === opponent.OPEN) {
                opponent.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            }
            else {
                console.log("Opponent socket not open, skipping send");
            }
        }
        catch (err) {
            console.error("Failed to send move to opponent:", err);
        }
        this.moveCount++;
        if (this.board.isGameOver()) {
            let winner = "draw";
            if (this.board.isCheckmate()) {
                winner = this.moveCount % 2 === 0 ? "black" : "white";
            }
            const msg = JSON.stringify({
                type: GAME_OVER,
                payload: { winner }
            });
            this.player1.send(msg);
            this.player2.send(msg);
        }
    }
    handleTimeout(timedOutColor) {
        const winner = timedOutColor === "white" ? "black" : "white";
        const msg = JSON.stringify({
            type: GAME_OVER,
            payload: { winner }
        });
        this.player1.send(msg);
        this.player2.send(msg);
    }
}
//# sourceMappingURL=Game.js.map