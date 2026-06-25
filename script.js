const titleScreen = document.getElementById("title-screen");
const missionScreen = document.getElementById("mission-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("results-screen");

const startBtn = document.getElementById("startBtn");

const river = document.getElementById("river");

const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const healthEl = document.getElementById("health");

const feedback = document.getElementById("feedback");

let score = 0;
let timer = 60;
let riverHealth = 0;

let gameInterval;
let spawnInterval;

let targetScore = 200;
let difficulty = "basic";

startBtn.addEventListener("click", () => {

    titleScreen.classList.remove("active");
    missionScreen.classList.add("active");

});

function selectDifficulty(level){

    difficulty = level;

    if(level === "basic"){
        targetScore = 200;
    }

    if(level === "medium"){
        targetScore = 300;
    }

    if(level === "hard"){
        targetScore = 400;
    }

    missionScreen.classList.remove("active");
    gameScreen.classList.add("active");

    startGame();
}

function startGame(){

    score = 0;
    timer = 60;
    riverHealth = 0;

    updateUI();

    gameInterval = setInterval(() => {

        timer--;

        updateUI();

        if(timer <= 0){
            endGame();
        }

    },1000);

    spawnInterval = setInterval(spawnItem,800);
}

function spawnItem(){

    const item = document.createElement("div");

    const badChance =
        difficulty === "basic"
        ? 0.15
        : difficulty === "medium"
        ? 0.25
        : 0.35;

    const isBad = Math.random() < badChance;

    item.classList.add("item");

    if(isBad){

        item.classList.add("bad");

        const badItems = ["⚡","☁️"];

        item.textContent =
            badItems[Math.floor(Math.random()*badItems.length)];

    }else{

        item.classList.add("good");

        const trashItems =
            ["🍼","🥫","🗑️","📦","🍌"];

        item.textContent =
            trashItems[Math.floor(Math.random()*trashItems.length)];
    }

    item.style.left =
        Math.random() * (river.clientWidth - 80) + "px";

    item.style.top =
        Math.random() * (river.clientHeight - 80) + "px";

    item.addEventListener("click", () => {

        if(isBad){

            score = Math.max(0, score - 5);

            feedback.textContent =
                "Obstacle Hit! -5 Points";

        }else{

            score += 10;

            feedback.textContent =
                "+10 Points!";

            riverHealth =
                Math.min(
                    100,
                    Math.floor(score / targetScore * 100)
                );

            if(score >= targetScore){

                winGame();
            }
        }

        updateUI();

        item.remove();

    });

    river.appendChild(item);

    setTimeout(() => {

        item.remove();

    },2000);
}

function updateUI(){

    scoreEl.textContent = score;
    timerEl.textContent = timer;
    healthEl.textContent = riverHealth;

    if(riverHealth < 30){

        river.style.background =
            "#6b4f2a";

        document.getElementById("river-label")
        .textContent = "Very Polluted";
    }

    else if(riverHealth < 70){

        river.style.background =
            "#5d8f8c";

        document.getElementById("river-label")
        .textContent = "Improving";
    }

    else{

        river.style.background =
            "#2E9DF7";

        document.getElementById("river-label")
        .textContent = "Clean River";
    }
}

function winGame(){

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    confetti({
        particleCount:150,
        spread:90
    });

    showResults(
        true,
        "Mission Complete! River Restored!"
    );
}

function endGame(){

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    if(score >= targetScore){

        winGame();

    }else{

        showResults(
            false,
            "Time's Up! Try Again."
        );
    }
}

function showResults(win,message){

    gameScreen.classList.remove("active");
    resultScreen.classList.add("active");

    document.getElementById("resultTitle")
        .textContent =
        win ? "Mission Complete!" : "Mission Failed";

    document.getElementById("finalScore")
        .textContent = score;

    document.getElementById("finalHealth")
        .textContent = riverHealth;

    document.getElementById("resultMessage")
        .textContent = message;
}

document
.getElementById("resetBtn")
.addEventListener("click", restartGame);

function restartGame(){

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    resultScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    missionScreen.classList.remove("active");

    titleScreen.classList.add("active");

    document
        .querySelectorAll(".item")
        .forEach(item => item.remove());
}