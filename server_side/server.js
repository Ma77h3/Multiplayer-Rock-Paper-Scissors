
// setup the express server, imports
const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server);
const port = 3000;
const {v4: uuidV4} = require('uuid');
let session_Storage = 0;
let multiplayer=0;
let waitingRoom = undefined;
let rooms = [];
let result = [];
let roomFound = false;
let success = true;
let url = undefined;
let previous = undefined;

//static files, allow to access public folders
app.use(express.static('public'));
app.use('css', express.static(__dirname + 'public/css'));
app.use('js', express.static(__dirname + 'public/js'));
app.use('img', express.static(__dirname + 'public/img'));

//Listen on port 3000

server.listen(3000, ()=> {
    console.info(`Listening on port ${port}`);
});

app.set('views', './views');
app.set('view engine', 'ejs');

// displaying the index file


app.get('/home', (req, res) =>{
    res.render('home');

})

app.get('/options', (req, res) => {
    if (session_Storage == 1) {
        res.render('options');
        session_Storage = 0;
    }
    else{
        res.redirect('/home');
    }
})

app.get('/computer', (req, res) => {
    if (session_Storage == 1) {
        res.render('computer');
        session_Storage = 0;
    }
    else{
        res.redirect('/home');
    }

})

app.get('/waitingRoom', (req, res) => {
    console.log(`multiplayer: ${multiplayer} after waiting room`);
    if (waitingRoom == undefined) {
        waitingRoom = 'multiplayer-' + uuidV4();
        res.redirect(waitingRoom);
    }
    else{
        res.redirect(waitingRoom);
        waitingRoom = undefined;
    }
})
app.get('/joinRoom', (req, res) => {
    if (multiplayer == 1){
        if(success==true && roomFound==true) res.redirect(url);
        else {
            session_Storage = 1;
            previous = 'options';
            res.redirect('/options');
        }
    }

    else{
        res.redirect('/home');
    }
})

app.get('/room', (req, res) => {
    if (multiplayer == 1){
        url = 'multiplayer-' + uuidV4();
        res.redirect(url);
    }

    else{
        res.redirect('/home');
    }
    
})

app.get('/:room', (req, res) => {
    if (multiplayer==1){
        res.render('room', {roomId:req.params.room});
        multiplayer = 0;
    }
    
    else{
        res.redirect('/home');
    }
})



io.on('connection', socket => {
    socket.on('change-session-Storage', (session_length) => {
        session_Storage = session_length;
        return;
    })

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
    })

    socket.on('multiplayer' , () => {
        multiplayer = 1;
        console.log(`multiplayer: ${multiplayer} after emit`);
    })

    socket.on('join_existing_Room', (extension) => {
        url = extension;
        roomFound = false;
        success = true;
        multiplayer = 1;
        for (let i=0; i<rooms.length; i++){
            if (rooms[i][0] == extension){
                roomFound = true;
                if (rooms[i][3] == 'full'){
                    success = false;
                    const message = `The room extension ${extension} is full`;
                    console.log('called error message, room was full');
                }
            }
        }
        if (roomFound==false) {
            console.log('called error message, room does not exist');
            const type = 'full';
            console.log('sent message');
        }
    })

    socket.on('addRoom-to-active', (roomId, username, userId) => {
        let addition = false;
        for (let i=0; i<rooms.length; i++) {
            if (rooms[i][0] == roomId){
                addition = true;
                rooms[i].push([username, userId])
                rooms[i].push('full');
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('room-full');
                break;
            }
        }
        if (addition == false) {
            rooms.push([roomId, [username, userId]]);
            socket.emit('player-one');
            socket.join(roomId);
        }

        if (addition==true) {
            socket.emit('room-full');
        }
        console.log(rooms);
        

    })
    socket.on('get-opponent-username', (roomId, playerNo) => {
        console.log(`request from player: ${playerNo} from roomId: ${roomId}`)
        for (let i=0; i<rooms.length; i++) {
            if (rooms[i][0] == roomId){
                if (playerNo == 1) socket.emit('send-opponent-username', rooms[i][2][0]);
                else socket.emit('send-opponent-username', rooms[i][1][0]);
            }
        }
    })

    socket.on('get-option', (option, playerNo, roomId) => {
        console.log(`player: ${playerNo} from roomId: ${roomId} has chosen option: ${option}`);
        result.push([option, playerNo])
        socket.emit('option-confirmed', option);
        socket.broadcast.to(roomId).emit('opponent-selection');
        console.log(result)
        if (result.length==2){
            console.log('the game function has begun')

            console.log(`Player one option: ${result[1][0]}`)
            console.log(`Player one option: ${result[0][0]}`)

            switch (result[1][0] + result[0][0]) {
                case "rs":
                case "pr":
                case "sp":
                    socket.emit('win', result[1][0], result[0][0], result[1][1]);
                    socket.broadcast.to(roomId).emit('win', result[1][0], result[0][0], result[1][1]);
                    break;
        
                case "rp":
                case "ps":
                case "sr":
                    socket.emit('win', result[0][0], result[1][0], result[0][1]);
                    socket.broadcast.to(roomId).emit('win', result[0][0], result[1][0], result[0][1]);
                    break;
        
                case "rr":
                case "pp":
                case "ss":
                    socket.emit('draw', result[1][0], result[0][0]);
                    socket.broadcast.to(roomId).emit('draw', result[1][0], result[0][0]);
                    break;
            }
            result = [];
        }
        else{
            /* send a message in the html that you have select option, and message to other player that opponent has selected*/
        }
    })

    socket.on('previous-location', ()=>{
        if (previous=='options'){
            if (roomFound == true)socket.emit('error-message', 'full', url);
            else socket.emit('error-message', 'empty', url);
            previous = undefined;
        }
    })

    socket.on('disconnect', ()=>{
        let inRoom = false;
        let i = 0;
        while (i<rooms.length){
            for (let j=1; j<rooms[i].length; j++){
                if (rooms[i][j][1] == socket.id){
                    socket.to(rooms[i][0]).emit('player-disconnected');
                    console.log(`socket ${socket.id} was in a room`);
                    inRoom = true;
                    break;
                }
            }
            if (inRoom==true) break;
            i++;
        }
        if (inRoom==false) console.log(`socket ${socket.id} was not in a room`);
        else rooms.splice(i, 1);
        console.log(rooms);
    })
})




