

const WORD_LIST_URL = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words';
const response = await fetch(WORD_LIST_URL);
const text = await response.text();
const words = text.trim().split('\n');    
const WORD_LIST = words.map(word => word.toUpperCase());

type LetterIndexMap = Record<string, number[]>;
const isValidCandidate = (word: string, gray: Set<string>, green: LetterIndexMap, yellow: LetterIndexMap): boolean => {
    // word is the string being checked for candidacy
    // gray, green and yellow are based only on information derived from a SINGLE guess

    for(const [letter, indices] of Object.entries(green)) {
        for(const i of indices) {
            if(word[i] !== letter) return false;
        }
    }

    for(const [letter, indices] of Object.entries(yellow)) {
        for(const i of indices) {
            if(word[i] === letter) return false;
        }
    }

    const allLetters = new Set([...Object.keys(green), ...Object.keys(yellow), ...gray]);
    for(const letter of allLetters) {
        const greenCount = (green[letter] ?? []).length;
        const yellowCount = (yellow[letter] ?? []).length;
        const lowerBound = greenCount + yellowCount;
        const upperBound = gray.has(letter) ? lowerBound : 5;

        let c: number = 0;
        for(let i=0;i<5;++i)
            c += (word[i] === letter ? 1 : 0);

        if(!(lowerBound <= c && c <= upperBound)) return false;
    }

    return true;
}

export const candidates = (gray: Set<string>, green: LetterIndexMap, yellow: LetterIndexMap): Set<string> => {
    return new Set<string>(
        WORD_LIST.filter(word => isValidCandidate(word, gray, green, yellow))
    );
};
