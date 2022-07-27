import { Board } from "./2048.js";
import { initBackground } from "./background.js";
import { Server, Client } from "./socket.js";


const boardSize = 4;


document.addEventListener("DOMContentLoaded", ()=>{
    initBackground(".background");

    const display = {
        joinSection: document.querySelector("#join"),
        menuSection: document.querySelector("#menu"),
        roomSection: document.querySelector("#room"),
        gameSection: document.querySelector("#game"),
    }
    const server = new Server( display );
    const client = new Client( server, display );
})