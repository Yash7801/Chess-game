import { INIT_GAME, MOVE, TIME_OUT } from "./messages.js";
import { Game } from "./Game.js";
export class GameManager {
    games;
    pendingUser;
    users;
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        // avoid registering the same socket twice
        if (this.users.includes(socket)) {
            console.log("addUser: socket already registered, skipping");
            return;
        }
        this.users.push(socket);
        this.addHandler(socket);
        // ensuring cleanup when connection closes
        socket.on("close", () => {
            this.removeUser(socket);
        });
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        // Remove any game the user was part of
        this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket);
        // If the user was waiting in queue, clear it
        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
        // remove any lingering message listeners for safety
        if (typeof socket.removeAllListeners === "function") {
            socket.removeAllListeners("message");
        }
    }
    addHandler(socket) {
        // remove previous message listeners if present
        if (typeof socket.removeAllListeners === "function") {
            socket.removeAllListeners("message");
        }
        socket.on("message", (data) => {
            try {
                console.log("\n========== RAW MESSAGE ==========");
                console.log(data.toString());
                const message = JSON.parse(data.toString());
                if (message.type === INIT_GAME) {
                    // User already in a game → ignore
                    const alreadyInGame = this.games.find(g => g.player1 === socket || g.player2 === socket);
                    if (alreadyInGame) {
                        console.log("User already in a game, ignoring INIT_GAME");
                        return;
                    }
                    // Match with pending user (but not with yourself)
                    if (this.pendingUser && this.pendingUser !== socket) {
                        const game = new Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                    }
                    else {
                        this.pendingUser = socket;
                    }
                }
                if (message.type === MOVE) {
                    console.log("========== MOVE RECEIVED ==========");
                    console.log("payload:", message.payload);
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        game.makeMove(socket, message.payload);
                    }
                }
                if (message.type === TIME_OUT) {
                    console.log("========== TIME_OUT RECEIVED ==========");
                    console.log("payload:", message.payload);
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        game.handleTimeout(message.payload.color);
                    }
                }
            }
            catch (err) {
                console.error("Failed to handle message:", err);
            }
        });
    }
}
//# sourceMappingURL=GameManager.js.map