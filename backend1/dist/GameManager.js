import { INIT_GAME, MOVE } from "./messages.js";
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
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user != socket);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            // 🔥🔥🔥 ADD THESE LOGS HERE (VERY TOP OF HANDLER)
            console.log("\n========== RAW MESSAGE ==========");
            console.log(data.toString());
            const message = JSON.parse(data.toString());
            console.log("========== PARSED MESSAGE ==========");
            console.log(message);
            // 🔥🔥🔥 END OF LOGS
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === MOVE) {
                // 🔥🔥🔥 ADD THIS LOG TOO
                console.log("========== MOVE RECEIVED ==========");
                console.log("payload:", message.payload);
                // 🔥🔥🔥
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload);
                }
            }
        });
    }
}
//# sourceMappingURL=GameManager.js.map