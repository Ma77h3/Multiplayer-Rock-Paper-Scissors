const socket = io('/');


const storage = sessionStorage.length;

socket.emit('previous-location');

function handleSubmit_singlePlayer(){
    socket.emit('change-session-Storage', storage);
}

function handleSubmit_create_room(){
    socket.emit('multiplayer');
}

function handleSubmit_join_room(){
    socket.emit('join_existing_Room', document.getElementById("url").value);
}

socket.on('error-message', (type, url) => {
    if (type=='full') document.getElementById('message').innerHTML = `the room "${url}" is full`;
    else document.getElementById('message').innerHTML = `the room "${url}" does not exist`;
})