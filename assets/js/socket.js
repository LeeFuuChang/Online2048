import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getDatabase, ref, set, off, get, onDisconnect, onValue, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

import { Game } from "./2048.js";

const firebaseConfig = {
  apiKey: "AIzaSyCShIhBZxWpipebJesOHcyGX_uffGpX3B8",
  authDomain: "multiplayer-demo-5759f.firebaseapp.com",
  databaseURL: "https://multiplayer-demo-5759f-default-rtdb.firebaseio.com",
  projectId: "multiplayer-demo-5759f",
  storageBucket: "multiplayer-demo-5759f.appspot.com",
  messagingSenderId: "692262581872",
  appId: "1:692262581872:web:4e2c90e5f75bc288a9a6b5"
};


class Room {
    constructor(display, local, database, roomRef, roomData){
        this.display = display;

        this.display.roomSection.querySelector("#room-id").innerText = roomData.roomId;

        this.local = local;

        this.database = database;
        this.ref = roomRef;
        this.roomData = roomData;
        this.game = new Game(this.display.gameSection, this.local, this.roomData.players, this.roomData.difficulty);

        for(let playerUid of Object.keys(this.roomData.players)){
            this.game.addPlayer(this.roomData.players[playerUid]);
        }

        this.updateDisplay();
    }
    bindCallbacks = (callbacks)=>{
        this.callbacks = {
            ...callbacks,
            proc: function(cbn){
                ((callbacks[cbn]!==undefined) ? callbacks[cbn] : ()=>{throw new Error(`Missing callback: ${cbn}`)})();
            }
        };
    }
    updateDisplay = ()=>{
        if(this.roomData.host.uid === this.local.uid){
            if(!this.display.roomSection.classList.contains("host")){
                this.display.roomSection.classList.add("host");
            }
        }else{
            this.display.roomSection.classList.remove("host");
        }

        this.display.roomSection.querySelector("#room-id").innerText = this.roomData.roomId;

        let playerDisplayBlock = this.display.roomSection.querySelector("#room-participants-block");
        playerDisplayBlock.innerHTML = "";
        let playerUids = Object.keys(this.roomData.players);
        for(let i=0; i<playerUids.length; i++){
            let playerDisplay = document.createElement("div");
            playerDisplay.classList.add("player", "df", "aic");
            playerDisplay.innerHTML = `
            <div class="player-order df aic jcc">P${i+1}</div>
            <h1 class="player-id df aic">${this.roomData.players[playerUids[i]].id}</h1>`;
            playerDisplayBlock.appendChild(playerDisplay);
        }
    }
    updateFull = ()=>{
        if( Object.keys(this.game.boards).length === 2){
            set(ref(this.database, `rooms/${this.roomData.roomId}/full`), true);
        }else{
            set(ref(this.database, `rooms/${this.roomData.roomId}/full`), false);
        };
    }
    updateParticipants = (evt)=>{
        let participant = evt.val();
        if( participant.uid === undefined ) return;
        if( !this.game.checkPlayerJoined(participant.uid) ){
            this.game.addPlayer(participant);
            this.roomData.players[participant.uid] = participant;
            this.updateDisplay();
            this.updateFull();
        };
        this.game.updateDisplay(participant.uid, participant.state);
    }
    updateParticipantDisconnect = (evt)=>{
        let participant = evt.val();
        if( participant.uid === undefined ) return;
        if( participant.uid === this.roomData.host.uid ){
            this.game.end();
            this.callbacks.proc("gameEndCallback");
            alert(`host jumped`);
        }else{
            this.game.removePlayer(participant);
            this.updateFull();
            alert(`${participant.uid} jumped`);
        }
        this.updateDisplay();
    }
    updateRoom = (evt)=>{
        if(evt.key===this.roomData.roomId && evt.val().started){
            off(this.ref, "value");
            onChildChanged(ref(this.database, `rooms/${this.roomData.roomId}/players`), this.updateParticipants);
            this.callbacks.proc("gameStartCallback");
            this.game.start((alive, state)=>{
                set(ref(this.database, `rooms/${this.roomData.roomId}/players/${this.local.uid}/alive`), alive);
                set(ref(this.database, `rooms/${this.roomData.roomId}/players/${this.local.uid}/state`), state);
            })
        };
    }
    setStart = ()=>{
        this.roomData.started = true;
        set(ref(this.database, `rooms/${this.roomData.roomId}/started`), true);
    }
}


class Server {
    constructor(display){
        this.display = display;

        this.appConfig = firebaseConfig;
        this.app = initializeApp(this.appConfig);
        this.auth = getAuth(this.app);
        this.database = getDatabase(this.app);

        this.localRef = undefined;

        this.local = {
            uid: undefined,
            isLocal: true
        }

        onAuthStateChanged(this.auth, (user)=>{
            if(user){
                this.localRef = ref(this.database, `users/${user.uid}`);

                this.local.uid = user.uid;

                set(this.localRef, this.local);

                onDisconnect(this.localRef).remove();
            }
        });
    }

    signIn = (nickname)=>{
        this.local.id = nickname;
        signInAnonymously(this.auth);
    }

    hostRoom = ()=>{
        let difficulty = 4;
        let roomId = this.local.uid;
        let roomRef = ref(this.database, `rooms/${roomId}`);
        let roomData = {
            full: false,
            started: false,
            roomId: roomId,
            host: this.local,
            players: {},
            difficulty: difficulty,
        };
        set(roomRef, roomData);
        onDisconnect(roomRef).remove();
        return new Promise((resolve, reject)=>{
            this.joinRoom(roomId).then(res => {
                if(res !== null){
                    resolve(res);
                }else{
                    reject(null);
                }
            })
        });
    }

    joinRoom = (roomId)=>{
        console.log("Join", roomId);
        return new Promise((resolve, reject)=>{
            let roomRef = ref(this.database, `rooms/${roomId}`);
            get(roomRef).then((snapshot)=>{
                if(snapshot.exists()){
                    let roomData = snapshot.val();
                    if(roomData.started){
                        alert("Game started!");
                        return;
                    }
                    if(roomData.full){
                        alert("Room fulled!");
                        return;
                    }
                    let allPlayersRef = ref(this.database, `rooms/${roomId}/players`);
                    let playerRef = ref(this.database, `rooms/${roomId}/players/${this.local.uid}`);
                    let playerData = {
                        id: this.local.id,
                        uid: this.local.uid,
                        alive: true,
                        state: Array(roomData.difficulty*roomData.difficulty).fill(0)
                    };
                    if( roomData.players === undefined) roomData.players = {};
                    roomData.players[this.local.uid] = playerData;
                    let room = new Room(this.display, this.local, this.database, roomRef, roomData);
                    onValue(roomRef, room.updateRoom);
                    onChildAdded(allPlayersRef, room.updateParticipants);
                    onChildRemoved(allPlayersRef, room.updateParticipantDisconnect);
                    set(playerRef, playerData);
                    onDisconnect(playerRef).remove();
                    resolve(room);
                }else{
                    reject(null);
                }
            })
        });
    }
}


class Client {
    constructor(server, display){
        this.server = server;
        this.display = display;


        this.joinButtonClicked = ()=>{
            let nickname = this.display.joinSection.querySelector("#nickname").value;
            if( !nickname ) nickname = "unnamed player";
            this.server.signIn(nickname);
            this.switchDisplaySection("menu");
        }
        this.display.joinSection.querySelector("#play-button").addEventListener("click", this.joinButtonClicked)


        this.gameRoom = null;
        this.joinRoomButtonClicked = ()=>{
            let roomIdInput = this.display.menuSection.querySelector("#room-id-input");
            this.server.joinRoom(roomIdInput.value).then(res=>{
                if(res !== null){
                    this.gameRoom = res;
                    this.gameRoom.bindCallbacks({
                        gameStartCallback: this.gameStartCallback,
                        gameEndCallback: this.gameEndCallback,
                    })
                    this.switchDisplaySection("room");
                }
            });
        }
        this.display.menuSection.querySelector("#join-button").addEventListener("click", this.joinRoomButtonClicked);
        this.hostButtonClicked = ()=>{
            this.server.hostRoom().then(res=>{
                if(res !== null){
                    alert(res.roomData.roomId);
                    this.gameRoom = res;
                    this.gameRoom.bindCallbacks({
                        gameStartCallback: this.gameStartCallback,
                        gameEndCallback: this.gameEndCallback,
                    })
                    this.switchDisplaySection("room");
                }
            });
        }
        this.display.menuSection.querySelector("#host-button").addEventListener("click", this.hostButtonClicked);



        this.startButtonClicked = ()=>{
            if(this.gameRoom !== null){
                this.gameRoom.setStart();
            }
        }
        this.display.roomSection.querySelector("#start-button").addEventListener("click", this.startButtonClicked);



        this.displaySections = [this.gameSection, this.menuSection, this.roomSection];
    }

    gameStartCallback = ()=>{
        this.switchDisplaySection("game");
    }
    gameEndCallback = ()=>{
        this.switchDisplaySection("menu");
    }

    switchDisplaySection = (showIdSelector)=>{
        for(let section of Object.keys(this.display)){
            if(this.display[section].id === showIdSelector){
                this.display[section].style.display = "flex";
            }else{
                this.display[section].style.display = "none";
            }
        }
    }
}


export { Server, Client };
