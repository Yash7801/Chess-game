import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on("connection", (ws) => {
    console.log("WS: new connection");
    gameManager.addUser(ws);

    // keep minimal here — GameManager already installs 'close' cleanup
});