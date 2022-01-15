const socket = io('/');
let player = undefined;
let selection_confirmed = false;
const loader = document.querySelector('.wrapper-loader');
const disconnect = document.querySelector('.disconnected-message')
const loader_text = document.querySelector('.loading-message')
const main_body = document.querySelector('.main')


window.addEventListener('load', () => {

    username = sessionStorage.getItem('USERNAME');

    document.getElementById('result-username').innerHTML = username;

})


socket.on('connect', ()=>{
    socket.emit('addRoom-to-active', ROOM_ID, username, socket.id);
    
})

socket.on('player-one', () => {
    console.log('one person in the room');
    player = 1;
    initLoad();
})

socket.on('room-full', () => {
    console.log('room is full');
    if (player == undefined) player = 2;
    if (player == 1) loading();
    socket.emit('get-opponent-username', ROOM_ID, player)
})

socket.on('send-opponent-username', (username) => {
    document.getElementById('result-username-opponent').innerHTML = username;
})

socket.on('win', (myOption, opponentOption, playerNo) => {
    if (player==playerNo){
        win(myOption, opponentOption);
    }
    else{
        lose(opponentOption, myOption);
    }
    
})

socket.on('draw', (myOption, opponentOption) => {
    draw(myOption, opponentOption);
})

socket.on('option-confirmed', (myOption) => {
    selection_confirmed = true;
    document.getElementById('action-message').innerHTML = `You have chosen ${convertToWord(myOption)}`
})

socket.on('opponent-selection', () => {
    document.getElementById('hidden-message').style.display = "inline-flex";
})

socket.on('player-disconnected', () => {
    main_body.style.opacity = 0;
    main_body.style.display = 'none';

    disconnect.style.opacity = 1;
    disconnect.style.display = 'grid';
})

// For the game part

// this is intializing the score to zero, don't make it const as we are not changing it
let userScore = 0;
let compScore = 0;

// getting the value in the html document that has the id user-score and computer-score
const userScore_span = document.getElementById("user-score");
const compScore_span = document.getElementById("computer-score");

// get the element with class scoreboard and  result
const Scoreboard_div = document.querySelector(".scoreboard");
const userName = document.getElementById('result-username');
const result_p = document.querySelector(".result > p");

// get the elements for the buttons (rock, paper and scissors)
const rock_div = document.getElementById("r");
const paper_div = document.getElementById("p");
const scissors_div = document.getElementById("s");


// convert the word r, p, and s to rock paper and scissors
function convertToWord(letter){
    if (letter == "r") return "Rock";
    if (letter == "p") return "Paper";
    return "Scissors";

}

// function that happens when user wins
function win(user, opponent){
    // increasing the value by 1, and updating the variable on the page
    userScore++;
    userScore_span.innerHTML = userScore;
    const smallUserWord = 'you'.fontsize(3).sub();
    const compUserWord = 'opponent'.fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(user)}${smallUserWord} beats ${convertToWord(opponent)}${compUserWord}. You win!`;
    document.getElementById(user).classList.add('green-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('green-glow')}, 300);
    document.getElementById('hidden-message').style.display = "none";
    setTimeout(() => {
        document.getElementById('action-message').innerHTML = "Make your move";
    }, 2000)
    selection_confirmed = false;
}

//function that happens when the user loses
function lose(user, opponent){
    compScore++;
    compScore_span.innerHTML = compScore;
    const smallUserWord = 'you'.fontsize(3).sub();
    const compUserWord = 'opponent'.fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(user)}${smallUserWord} loses to ${convertToWord(opponent)}${compUserWord}. You lose!`;
    document.getElementById(user).classList.add('red-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('red-glow')}, 300);
    document.getElementById('hidden-message').style.display = "none";
    setTimeout(() => {
        document.getElementById('action-message').innerHTML = "Make your move";
    }, 2000)
    selection_confirmed = false;
}

//function happens when the user draws
function draw(user, opponent){
    const smallUserWord = 'you'.fontsize(3).sub();
    const compUserWord = 'opponent'.fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(user)}${smallUserWord} equals ${convertToWord(opponent)}${compUserWord}. Its a draw!`;
    document.getElementById(user).classList.add('grey-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('grey-glow')}, 300);
    document.getElementById('hidden-message').style.display = "none";
    setTimeout(() => {
        document.getElementById('action-message').innerHTML = "Make your move";
    }, 2000)
    selection_confirmed = false;
}

// function to intialize the game and determine the result
function game(userChoice) {
    const computerChoice = getComputerChoice();
    switch (userChoice + computerChoice) {
        case "rs":
        case "pr":
        case "sp":
            win(userChoice, computerChoice);
            break;

        case "rp":
        case "ps":
        case "sr":
            lose(userChoice, computerChoice);
            break;

        case "rr":
        case "pp":
        case "ss":
            draw(userChoice, computerChoice);
            break;
    }
}

// add event listeners, to know when the users clicks
function main(){
    rock_div.addEventListener('click', function() {
        if (selection_confirmed==false) socket.emit('get-option', 'r', player, ROOM_ID);
    })

    paper_div.addEventListener('click', function() {
        if (selection_confirmed==false) socket.emit('get-option', 'p', player, ROOM_ID);
    })

    scissors_div.addEventListener('click', function() {
        if (selection_confirmed==false) socket.emit('get-option', 's', player, ROOM_ID);
    })
}

function loading(){

    loader_text.innerHTML = "Found an opponent. Connecting to Game"
    setTimeout(()=> {
        loader.style.opacity = 0;
        loader.style.display = 'none';

        main_body.style.display = 'block';
        setTimeout(() => (main_body.style.opacity=1), 50);
    }, 1000);
    
}

function initLoad(){
    main_body.style.opacity = 0;
    main_body.style.display = 'none';

    loader.style.opacity = 1;
    loader.style.display = 'grid';
}

function options(){
    socket.emit('change-session-Storage', sessionStorage.length);
}


main();