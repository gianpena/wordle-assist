import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORD_LIST_URL = 'https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt';
let words: string[] = [];

const app = express();
const port = 80;

async function loadWords() {
  const response = await fetch(WORD_LIST_URL);
  const text = await response.text();
  words = text.trim().split('\n');
  words = words.map(word => word.toUpperCase());
}

loadWords();

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

interface LetterStatus {
    value: string,
    status: string
};

type WordleState = Record<string, LetterStatus>;

function filter(word: string,
                gray: Record<number, string[]>,
                yellow: Record<number, string[]>,
                green: Record<number, string[]>): boolean {

    for (const [posStr, letters] of Object.entries(green)) {
        const pos = parseInt(posStr, 10);
        for (const letter of letters) {
            if (word[pos] !== letter) {
                return false;
            }
        }
    }

    for (const [posStr, letters] of Object.entries(yellow)) {
        const pos = parseInt(posStr, 10);
        for (const letter of letters) {
            if (!word.includes(letter) || word[pos] === letter) {
                return false;
            }
        }
    }

    const requiredLetters = new Set<string>();
    for (const letters of [...Object.values(green), ...Object.values(yellow)]) {
        for (const letter of letters) {
            requiredLetters.add(letter);
        }
    }

    for (const [posStr, letters] of Object.entries(gray)) {
        const pos = parseInt(posStr, 10);
        for (const letter of letters) {
            if (word[pos] === letter) {
                return false;
            }
            if (!requiredLetters.has(letter) && word.includes(letter)) {
                return false;
            }
        }
    }

    return true;
}

app.post('/solve', (req, res) => {
    const state = req.body as WordleState;
    let i: number = 0;
    const gray: Record<number, string[]> = {};
    const yellow: Record<number, string[]> = {};
    const green: Record<number, string[]> = {};


    for(; `letter-${i}` in state; ++i) {
        const { value, status } = state[`letter-${i}`];
        const pos = i % 5;
        switch(status){
            case 'gray':
                gray[pos] = gray[pos] ?? [];
                gray[pos].push(value);
                break;
            case 'green':
                green[pos] = green[pos] ?? [];
                green[pos].push(value);
                break;
            case 'yellow':
                yellow[pos] = yellow[pos] ?? [];
                yellow[pos].push(value);
                break;
        }
    }

    const candidates = words.filter(word => filter(word, gray, yellow, green));
    res.json(candidates);

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});