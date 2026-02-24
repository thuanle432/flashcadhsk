let flashcards = [];
let currentIndex = 0;
let currentHSK = "hsk1";

const card = document.getElementById("card");
const front = document.getElementById("front");
const back = document.getElementById("back");

async function loadHSK(level) {
    try {
        const response = await fetch(level + ".json");
        flashcards = await response.json();
        currentIndex = 0;
        showCard();
    } catch (error) {
        alert("Hiên tại chưa học " + level);
    }
}

function showCard() {
    if (flashcards.length === 0) return;

    front.textContent = flashcards[currentIndex].hanzi;
    back.innerHTML = `
        <p><strong>${flashcards[currentIndex].pinyin}</strong></p>
        <p>${flashcards[currentIndex].meaning}</p>
    `;
    card.classList.remove("flip");
}

function nextCard() {
    currentIndex = (currentIndex + 1) % flashcards.length;
    showCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    showCard();
}

function randomCard() {
    currentIndex = Math.floor(Math.random() * flashcards.length);
    showCard();
}

function changeHSK() {
    currentHSK = document.getElementById("hskSelect").value;
    loadHSK(currentHSK);
}

card.addEventListener("click", () => {
    card.classList.toggle("flip");
});

loadHSK(currentHSK);
