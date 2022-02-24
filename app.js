const prompt = require('prompt');
const dictionary = require('dictionary-en');
const nspell = require('nspell');
const { getEventListeners } = require('prompt');


dictionary((err, dict) => {
    const spell = nspell(dict);

    console.log(dict);

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

    for (let round = 1; round < 5; round++) {
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

        guess[round] = generatePartial(spell, letterSet, knownCorrect, knownIncorrect);
        console.log(guess[round]);
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
    let word = [];
    // iterate through potential words, keep going until we find one which is an actual word
    while (!spell.correct(word.toString())) {
        let valid = false;
        while (!valid) {
            word = knownCorrect.split('');
            // count correct letters
            let correctCount = 0;
            word.forEach((letter) => {
                if (letter.match(/[a-z]/)) correctCount++;
            });

            // create list of letters to use in this word
            let candidateLetters = [];
            // add known (but incorrect position) letters
            knownIncorrect.forEach((incorrectPattern) => {
                incorrectPattern.split('').forEach((letter) => {
                    if (letter.match(/[a-z]/)) candidateLetters.push(letter);
                });
            });
            // remove duplicates
            candidateLetters = candidateLetters.filter(function (elem, pos) {
                return candidateLetters.indexOf(elem) == pos;
            });

            // add letters to the word to make up the word length
            for (let letterIndex = candidateLetters.length - 1; letterIndex < (length - (correctCount + 1)); letterIndex++) {
                // get random letter
                candidateLetters.push(letterSet[Math.floor(Math.random() * letterSet.length)]);
            }

            // check that there are no letters in invalid positions

            // shuffle the letters
            shuffle(candidateLetters);
            // console.log(candidateLetters);
            // create the word
            for (let letterIndex = 0; letterIndex < length; letterIndex++) {
                if (!word[letterIndex] || !word[letterIndex].match(/[a-z]/)) word[letterIndex] = candidateLetters.pop();
            }
            // check that letters are in valid places
            valid = true;
            for (let letterIndex = 0; letterIndex < length; letterIndex++) {
                knownIncorrect.forEach((incorrectPattern) => {
                    valid = valid && !(incorrectPattern[letterIndex] == word[letterIndex]);
                    // console.log(`test`, incorrectPattern[letterIndex], word[letterIndex]);
                });
            }
          //   console.log(`shuffled word`, word, valid);
        }
         console.log(`candidate word`, word);
    }

    return word.toString();
}


/**
 * Shuffle an array
 * @param {array} array Array to be shuffled
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
