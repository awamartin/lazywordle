const prompt = require('prompt');
const dictionary = require('dictionary-en');
const nspell = require('nspell');


dictionary((err, dict) => {
    const spell = nspell(dict);
    guessWord(spell);
});


const letterSet = [`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`];

/**
 * Runs the wordle guesser
 * @param {spellChecker} spell a spellchecker & dictionary instance
 */
async function guessWord(spell) {
    // guess a random first word
    generateRandomWord(spell, letterSet);
}

/**
 * find a random word based on the input
 * @param {spellChecker} spell a spellchecker & dictionary instance
 * @param {array} letters an array of characters to find a word from
 * @param {int} length The length of the word to be found
 * @return {string} The generated word
 */
function generateRandomWord(spell, letters, length = 5) {
    let word = '';
    while (!spell.correct(word)) {
        word = '';
        for (let wordLength = 0; wordLength < length; wordLength++) {
            word = word + letters[Math.floor(Math.random() * letters.length)];
        }
    }
    console.log(word);
    return word;
}
