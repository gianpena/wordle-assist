import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 80;

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// interface LetterStatus {
//     value: string,
//     status: string
// };

// type WordleState = Record<string, LetterStatus>;

app.post('/solve', (req, res) => {
    
    // total rewrite incoming

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});