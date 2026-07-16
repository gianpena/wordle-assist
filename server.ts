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
                gray: Set<string>,
                yellow: Record<number, string>,
                green: Record<number, string>): boolean {
    
    const remaining = { ...yellow };

    for(let i: number = 0; i<5; ++i) {
        if(gray.has(word[i])) return false;
        if(i in green && green[i] != word[i]) return false;
        if(i in yellow && yellow[i] == word[i]) return false;

        for (const pos in remaining) {
            if (remaining[pos] === word[i]) {
                delete remaining[pos];
                break;
            }
        }
    }

    return Object.keys(remaining).length === 0;
}

app.post('/solve', (req, res) => {
    const state = req.body as WordleState;
    let i: number = 0;
    const gray: Set<string> = new Set();
    const yellow: Record<number, string> = {};
    const green: Record<number, string> = {};


    for(; `letter-${i}` in state; ++i) {
        const { value, status } = state[`letter-${i}`];
        const pos = i % 5;
        switch(status){
            case 'gray':
                gray.add(value);
                break;
            case 'green':
                green[pos] = value;
                break;
            case 'yellow':
                yellow[pos] = value;
                break;
        }
    }

    const candidates = words.filter(word => filter(word, gray, yellow, green));
    res.json(candidates);

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});