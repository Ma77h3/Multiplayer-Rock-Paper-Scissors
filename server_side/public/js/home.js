const socket = io('/');

const storage = sessionStorage.length;

socket.emit('change-session-Storage', storage);

function handleSubmit(){
    const username = document.getElementById("username").value;

    if (username != ""){

        sessionStorage.setItem("USERNAME", username);

        socket.emit('change-session-Storage', sessionStorage.length);
    }

    

    


    return;

    

}


