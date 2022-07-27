import { random } from "./random.js";
import { assert } from "./util.js";


class Board {
    constructor(boardDisplay, size){
        this.boardDisplay = boardDisplay;
        this.boardDisplay.style.setProperty("--board-size", size);

        this.active = false;
        this.onStateChangeCallback = (s)=>{};

        this.alive = true;
        this.empty = 0;
        this.size = size;
        this.moveable = 0;
        this.blocks = [];

        this.createBoard();
    }

    generateNumber = (amount)=>{
        if(amount===0) return;
        assert(amount <= this.blocks.length, "amount must be less than blocks.length");
        let randBlock = random.choice(this.blocks);
        if(randBlock.dataset.value==0){
            randBlock.dataset.value = 2;
            if(amount-1 > 0) this.generateNumber(amount-1);
            else this.updateDisplay();
        }else this.generateNumber( amount );
    }

    createBoard = ()=>{
        for(let i=0; i<this.size*this.size; i++){
            let block = document.createElement("div");
            block.classList.add("block", "df", "aic", "jcc");
            block.dataset.value = 0;
            this.boardDisplay.appendChild(block);
            this.blocks.push(block);
        }
    }

    updateStatus = ()=>{
        this.empty = 0;
        this.moveable = this.size*this.size;

        let directions = [-this.size, -1, 1, this.size];
        for(let i=0; i<this.size*this.size; i++){
            let d = [], c = 0;
            if( i>=this.size ) d.push(directions[0]); // up
            if( i%this.size !== 0) d.push(directions[1]); // left
            if( i%this.size !== this.size-1 ) d.push(directions[2]); // right
            if( i<=this.size*(this.size-1) - 1 ) d.push(directions[3]); // down
            for(let j=0; j<d.length; j++){
                c += (
                    this.blocks[ i+d[j] ].dataset.value!==this.blocks[ i ].dataset.value
                ) && ( this.blocks[ i+d[j] ].dataset.value != 0 ) && ( this.blocks[ i ].dataset.value != 0 );
            };

            this.moveable -= (c===d.length);
            this.empty += (this.blocks[ i ].dataset.value==0);
        }
        this.alive = (this.moveable>0||this.empty>0);
        if( !this.alive )this.end();
    }

    moveU = (size)=>{
        for(let i=0; i<size; i++){
            let col = [...Array(size).keys()].map((n)=>this.blocks[i + n*size]);
            let colVal = col.map(block=>parseInt(block.dataset.value));
            let filteredColVal = colVal.filter(n=>n);
            let zeros = Array(size-filteredColVal.length).fill(0);
            let newCol = filteredColVal.concat(zeros);
            col.map((block, t)=>block.dataset.value = newCol[t]);
        }
        for(let i=0; i+size<size*size; i++){
            if(this.blocks[i].dataset.value === this.blocks[i+size].dataset.value){
                let combined = parseInt(this.blocks[i].dataset.value)+parseInt(this.blocks[i+size].dataset.value);
                this.blocks[i].dataset.value = combined;
                this.blocks[i+size].dataset.value = 0;
            }
        }
        for(let i=0; i<size; i++){
            let col = [...Array(size).keys()].map((n)=>this.blocks[i + n*size]);
            let colVal = col.map(block=>parseInt(block.dataset.value));
            let filteredColVal = colVal.filter(n=>n);
            let zeros = Array(size-filteredColVal.length).fill(0);
            let newCol = filteredColVal.concat(zeros);
            col.map((block, t)=>block.dataset.value = newCol[t]);
        }
    }
    moveD = (size)=>{
        for(let i=0; i<size; i++){
            let col = [...Array(size).keys()].map((n)=>this.blocks[i + n*size]);
            let colVal = col.map(block=>parseInt(block.dataset.value));
            let filteredColVal = colVal.filter(n=>n);
            let zeros = Array(size-filteredColVal.length).fill(0);
            let newCol = zeros.concat(filteredColVal);
            col.map((block, t)=>block.dataset.value = newCol[t]);
        }
        for(let i=size*size - 1; i>=size; i--){
            if(this.blocks[i-size].dataset.value === this.blocks[i].dataset.value){
                let combined = parseInt(this.blocks[i].dataset.value)+parseInt(this.blocks[i-size].dataset.value);
                this.blocks[i].dataset.value = combined;
                this.blocks[i-size].dataset.value = 0;
            }
        }
        for(let i=0; i<size; i++){
            let col = [...Array(size).keys()].map((n)=>this.blocks[i + n*size]);
            let colVal = col.map(block=>parseInt(block.dataset.value));
            let filteredColVal = colVal.filter(n=>n);
            let zeros = Array(size-filteredColVal.length).fill(0);
            let newCol = zeros.concat(filteredColVal);
            col.map((block, t)=>block.dataset.value = newCol[t]);
        }
    }


    moveL = (size)=>{
        for(let i=0; i<size*size; i++){
            if(i%size == 0){
                let row = [...Array(size).keys()].map((n)=>this.blocks[i+n]);
                let rowVal = row.map(block=>parseInt(block.dataset.value));
                let filteredRowVal = rowVal.filter(n=>n);
                let zeros = Array(size-filteredRowVal.length).fill(0);
                let newRow = filteredRowVal.concat(zeros);
                row.map((block, t)=>block.dataset.value = newRow[t]);
            }
        }
        for(let i=0; i+1<size*size; i++){
            if(this.blocks[i].dataset.value === this.blocks[i+1].dataset.value){
                let combined = parseInt(this.blocks[i].dataset.value)+parseInt(this.blocks[i+1].dataset.value);
                this.blocks[i].dataset.value = combined;
                this.blocks[i+1].dataset.value = 0;
            }
        }
        for(let i=0; i<size*size; i++){
            if(i%size == 0){
                let row = [...Array(size).keys()].map((n)=>this.blocks[i+n]);
                let rowVal = row.map(block=>parseInt(block.dataset.value));
                let filteredRowVal = rowVal.filter(n=>n);
                let zeros = Array(size-filteredRowVal.length).fill(0);
                let newRow = filteredRowVal.concat(zeros);
                row.map((block, t)=>block.dataset.value = newRow[t]);
            }
        }
    }
    moveR = (size)=>{
        for(let i=0; i<size*size; i++){
            if(i%size == 0){
                let row = [...Array(size).keys()].map((n)=>this.blocks[i+n]);
                let rowVal = row.map(block=>parseInt(block.dataset.value));
                let filteredRowVal = rowVal.filter(n=>n);
                let zeros = Array(size-filteredRowVal.length).fill(0);
                let newRow = zeros.concat(filteredRowVal);
                row.map((block, t)=>block.dataset.value = newRow[t]);
            }
        }
        for(let i=size*size - 1; i>1; i--){
            if(this.blocks[i-1].dataset.value === this.blocks[i].dataset.value){
                let combined = parseInt(this.blocks[i-1].dataset.value)+parseInt(this.blocks[i].dataset.value);
                this.blocks[i].dataset.value = combined;
                this.blocks[i-1].dataset.value = 0;
            }
        }
        for(let i=0; i<size*size; i++){
            if(i%size == 0){
                let row = [...Array(size).keys()].map((n)=>this.blocks[i+n]);
                let rowVal = row.map(block=>parseInt(block.dataset.value));
                let filteredRowVal = rowVal.filter(n=>n);
                let zeros = Array(size-filteredRowVal.length).fill(0);
                let newRow = zeros.concat(filteredRowVal);
                row.map((block, t)=>block.dataset.value = newRow[t]);
            }
        }
    }


    keyControl = (e)=>{
        let moved = false;
        if(e.keyCode === 38){
            this.moveU(this.size);
            moved = true;
        }else if(e.keyCode === 40){
            this.moveD(this.size);
            moved = true;
        }else if(e.keyCode === 37){
            this.moveL(this.size);
            moved = true;
        }else if(e.keyCode === 39){
            this.moveR(this.size);
            moved = true;
        }
        if(moved) this.generateNumber( Math.min(2, Math.max(0, this.empty)) );
        this.updateStatus();
        this.updateDisplay();
    }

    onStateChange = (f)=>{
        this.onStateChangeCallback = f;
    }

    set = (value)=>{
        console.log(value);
        assert(value.length === this.blocks.length, "Invalid value length");
        for(let i=0; i<this.size*this.size; i++){
            this.blocks[i].dataset.value = value[i];
        }
        this.updateStatus();
        this.updateDisplay();
    }

    end = ()=>{
        this.alive = false;
        document.removeEventListener("keyup", this.keyControl);
    }

    updateDisplay = ()=>{
        if( !this.active )return;
        let state = this.blocks.map(b=>parseInt(b.dataset.value));
        this.onStateChangeCallback(this.alive, state);
        for(let i=0; i<this.size*this.size; i++){
            if(this.blocks[i].dataset.value == 0){
                this.blocks[i].innerHTML = '';
            }else{
                this.blocks[i].innerHTML = this.blocks[i].dataset.value;
            }
        }
    }
}


class Game {
    constructor(gameDisplay, local, players, boardSize){
        this.local = local;
        this.players = players;
        this.boards = {};
        this.difficulty = boardSize;
        this.gameDisplay = gameDisplay;
        this.gameDisplay.innerHTML = "";
        assert(this.local !== undefined, "no local player");
    }

    start = (updateCallback)=>{
        this.boards[this.local.uid].board.onStateChange(updateCallback);
        for(let playerUid of Object.keys(this.boards)){
            this.boards[playerUid].board.active = true;
        }
        this.boards[this.local.uid].board.generateNumber(2);
        document.addEventListener("keyup", this.boards[this.local.uid].board.keyControl);
    }
    end = ()=>{
        for(let playerUid of Object.keys(this.boards)){
            this.boards[playerUid].board.end();
        }
    }

    checkPlayerJoined = (uid)=>{
        return this.boards[uid] !== undefined;
    }

    addPlayer = (playerData)=>{
        if( this.checkPlayerJoined(playerData.uid) ) return;
        console.log("Adding player ", playerData)
        let [ playerDisplay, boardDisplay ] = this.makePlayer(playerData.id, playerData.uid, playerData.uid === this.local.uid);
        this.gameDisplay.appendChild(playerDisplay);
        let board = new Board(boardDisplay, this.difficulty);
        this.boards[playerData.uid] = {board:board, display:playerDisplay};
    }

    removePlayer = (playerData)=>{
        this.gameDisplay.removeChild(this.boards[playerData.uid].display);
        delete this.boards[playerData.uid];
    }

    makePlayer = (id, uid, isLocal)=>{
        let player = document.createElement("section");
        player.classList.add("df", "aic", "jcc", "player");
        player.dataset.uid = uid;
        if(isLocal) player.classList.add("local");
        let boardDisplay = document.createElement("div");
        boardDisplay.classList.add("df", "board");
        boardDisplay.style.setProperty("--block-size", "100px");
        player.appendChild(boardDisplay);
        return [player, boardDisplay];
    }

    updateDisplay = (uid, state)=>{
        this.boards[uid].board.set(state);
    }
}


export { Board, Game };