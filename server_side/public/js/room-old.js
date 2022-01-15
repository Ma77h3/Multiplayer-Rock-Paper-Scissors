// send server our info

const socket = io('/');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

var conn = undefined;

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id);
})

myPeer.on('connection', (conn) =>{
    console.log(`I have been called`);
})



socket.on('user-connected', userId => {
    /* I can get rid of the CSS loading screen here */
    console.log(`User connected: ${userId}`);
    connectToNewUser(userId);
    /* experiment with conn.open('connection' and recieve)
    */
})

function connectToNewUser(userId) {
    const conn = myPeer.connect(userId);
    conn.on('open', () => {
        conn.on('data', (data) => {
            console.log(`Recieved ${data}`);
        })

    })

    conn.send(sessionStorage.getItem('USERNAME'))

}


// For the username part


window.addEventListener('load', () => {

    const username = sessionStorage.getItem('USERNAME');

    document.getElementById('result-username').innerHTML = username;

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

// randomize the computers choice
function getComputerChoice() {
    const choices = ['r', 'p', 's'];
    const random_num = Math.floor(Math.random() * 3);
    return choices[random_num];
}

// convert the word r, p, and s to rock paper and scissors
function convertToWord(letter){
    if (letter == "r") return "Rock";
    if (letter == "p") return "Paper";
    return "Scissors";

}

// function that happens when user wins
function win(user, computer){
    // increasing the value by 1, and updating the variable on the page
    userScore++;
    userScore_span.innerHTML = userScore;
    const smallUserWord = "you".fontsize(3).sub();
    const compUserWord = "comp".fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(user)}${smallUserWord} beats ${convertToWord(computer)}${compUserWord}. You win!`;
    document.getElementById(user).classList.add('green-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('green-glow')}, 300);
}

//function that happens when the user loses
function lose(user, computer){
    compScore++;
    compScore_span.innerHTML = compScore;
    const smallUserWord = "you".fontsize(3).sub();
    const compUserWord = "comp".fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(computer)}${compUserWord} beats ${convertToWord(user)}${smallUserWord}. You lose!`;
    document.getElementById(user).classList.add('red-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('red-glow')}, 300);
}

//function happens when the user draws
function draw(user, computer){
    const smallUserWord = "you".fontsize(3).sub();
    const compUserWord = "comp".fontsize(3).sub();
    result_p.innerHTML = `${convertToWord(computer)}${compUserWord} equals ${convertToWord(user)}${smallUserWord}. Its a draw!`;
    document.getElementById(user).classList.add('grey-glow');
    setTimeout(function() { document.getElementById(user).classList.remove('grey-glow')}, 300);
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
        game("r");
    })

    paper_div.addEventListener('click', function() {
        game("p")
    })

    scissors_div.addEventListener('click', function() {
        game("s");
    })
}

main();