const prompt = require('prompt');
const dictionary = require('dictionary-en');
const nspell = require('nspell');
const { getEventListeners } = require('prompt');


dictionary((err, dict) => {
    const spell = nspell(dict);
    guessWord(spell);
});


var letterSet = [`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`];

var knownCorrect = "";
var knownIncorrect = [];
var incorrect = [];

/**
 * Runs the wordle guesser
 * @param {spellChecker} spell a spellchecker & dictionary instance
 */
async function guessWord(spell) {
    var guess = [];
    // guess a random first word
    guess[0] = generateRandomWord(spell, letterSet);
    console.log(guess[0]);

    for (let rounds = 0; rounds < 5; rounds++) {
        prompt.start();
        var result = await prompt.get({
            properties: {
                knownCorrect: {
                    pattern: /^[a-z\s\-]+$/,
                    message: 'enter matched letters in known position',
                },
                knownIncorrect: {
                    pattern: /^[a-z\s\-]+$/,
                    message: 'enter matched letters in incorrect position',
                },
                incorrect: {
                    pattern: /^[a-z\s\-]+$/,
                    message: 'enter letters which are not included',
                },
            },
        });
        console.log(result);

        knownCorrect = result.knownCorrect;
        knownIncorrect.push(result.knownIncorrect);

        letterSet = letterSet.filter((letter) => !result.incorrect.includes(letter));

        guess[rounds + 1] = generatePartial(spell, letterSet, knownCorrect, knownIncorrect);
        console.log(guess[rounds + 1]);
    }
}

/**
 * find a random word based on the input
 * @param {spellChecker} spell a spellchecker & dictionary instance
 * @param {array} include an array of characters to find a word from
 * @param {int} length The length of the word to be found
 * @return {string} The generated word
 */
function generateRandomWord(spell, include, length = 5) {
    let word = '';
    while (!spell.correct(word)) {
        word = '';
        for (let wordLength = 0; wordLength < length; wordLength++) {
            word = word + include[Math.floor(Math.random() * include.length)];
        }
    }
    // console.log(word);
    return word;
}

/**
 * find a random word based on the input
 * @param {spellChecker} spell a spellchecker & dictionary instance
 * @param {array} include an array of characters to include
 * @param {array} knownCorrect an array known letters in position
 * @param {array} knownIncorrect an array known letters not in these positions
 * @param {int} length The length of the word to be found
 * @return {string} The generated word
 */
function generatePartial(spell, include, knownCorrect, knownIncorrect, length = 5) {
    let word = '';
    let usesKnownLetters = false;
    while (!usesKnownLetters || !spell.correct(word)) {
        word = '';
        for (let wordIndex = 0; wordIndex < length; wordIndex++) {
            knownLetters = knownCorrect.split('');
            if (knownLetters[wordIndex] && knownLetters[wordIndex].match(/[a-z]/)) {
                word = word + knownLetters[wordIndex];
            } else {
                let letterSet = [...include];
                // filter letters we know are incorrect at this position
                knownIncorrect.forEach((incorrectPattern) => {
                    if (incorrectPattern.split('')[wordIndex]) {
                        letterSet = letterSet.filter((letter) => !incorrectPattern.split('')[wordIndex].includes(letter));
                    }
                });

                // add a random letter from the remaining letter set
                word = word + letterSet[Math.floor(Math.random() * letterSet.length)];
            }
        }

        // check if the word contains the known letters
        // create array of known (but incorrect) letters
        knownIncorrectLetters = [];
        knownIncorrect.forEach((combination) => {
            combination.split('').forEach((letter) => knownIncorrectLetters.push(letter));
        });
        // remove duplicates
        knownIncorrectLetters = knownIncorrectLetters.filter(function (elem, pos) {
            return knownIncorrectLetters.indexOf(elem) == pos;
        });
        usesKnownLetters = true;
        knownIncorrectLetters.forEach((letter) => usesKnownLetters = usesKnownLetters && (word.includes(letter)));
    }

    return word;
}

