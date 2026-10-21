import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 80;

app.use(express.json());

app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

interface LetterStatus {
    value: string,
    status: string
};

type WordleState = Record<string, LetterStatus>;

import type { LetterIndexMap } from './utils';
import { getCandidates } from './utils';
app.post('/solve', (req, res) => {
    const state = req.body as WordleState; 

    let finalCandidates: Set<string> = new Set<string>();

    for(let i=0; i<30 && state[`letter-${i}`]; i += 5) {
        const gray = new Set<string>();
        const green = {} as LetterIndexMap;
        const yellow = {} as LetterIndexMap;
        
        for(let j=0;j<5;++j) {
            const { value, status } = state[`letter-${i+j}`]
            switch(status) {
                case "gray":
                    gray.add(value);
                    break;
                case "yellow":
                    yellow[value] = yellow[value] ?? [];
                    yellow[value].push(j);
                    break;
                case "green":
                    green[value] = green[value] ?? [];
                    green[value].push(j);
                    break;
            }
        }

        const candidates = getCandidates(gray, green, yellow);
        if(!finalCandidates.size) finalCandidates = candidates;
        else finalCandidates = finalCandidates.intersection(candidates);

    }

    let finalList = [...finalCandidates];
    finalList.sort();

    return res.json(finalList);

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});