const prompt = require('prompt');
const { getEventListeners } = require('prompt');
const fs = require('fs');

// load word list
var dictionary = fs.readFileSync('./english_words_full.txt').toString().split("\r\n");
// filter to wordle specification
dictionary = dictionary.filter((word) => {
    return (word.length == 5 &&
        word.split('')[0].match(/[a-z]/) &&
        word.split('')[1].match(/[a-z]/) &&
        word.split('')[2].match(/[a-z]/) &&
        word.split('')[3].match(/[a-z]/) &&
        word.split('')[4].match(/[a-z]/));
});

guessWord();
/**
 * Runs the wordle guesser
 */
async function guessWord() {
    let knownIncorrect = [];
    // guess a random first word
    //find a word with no double letters
    //there could still be some optimisation here to eliminate letters like e or other vowels
    let guess1 = dictionary[Math.floor(Math.random()*dictionary.length)];
	
    while(new Set(guess1.split('')).size !== guess1.length){
        guess1 = dictionary[Math.floor(Math.random()*dictionary.length)];
		//console.log(guess1);
    }
    console.log('guess: ',guess1);

    for (let round = 1; round < 5; round++) {
        prompt.start();
        let result = await prompt.get({
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

        knownIncorrect.push(result.knownIncorrect);
        
        //console.log('dict', dictionary);

        dictionary.forEach((word) => {
            // known letters
            result.knownCorrect.split('').forEach((letter, letterIndex) => {
                if (letter.match(/[a-z]/)) {
                    dictionary = dictionary.filter((word) => {
                        return word.split('')[letterIndex] == letter;
                    });
                }
            });
        });
        //console.log('known', dictionary);

        dictionary.forEach((word) => {
            // known incorrect letters that are in the wrong place
            result.knownIncorrect.split('').forEach((letter, letterIndex) => {
                if (letter.match(/[a-z]/)) {
                    dictionary = dictionary.filter((word) => {
                        return !(word.split('')[letterIndex] == letter);
                    });
                }
            });
        });
        //console.log('known incorrect', dictionary);

        dictionary.forEach((word) => {
            // known incorrect letters that must exist
            result.knownIncorrect.split('').forEach((letter) => {
                if (letter.match(/[a-z]/)) {
                    dictionary = dictionary.filter((word) => {
                        return word.includes(letter);
                    });
                }
            });
        });
        //console.log('known exist', dictionary);

        dictionary.forEach((word) => {
            // incorrect letters
            result.incorrect.split('').forEach((letter) => {
                dictionary = dictionary.filter((word) => {
                    return !word.includes(letter);
                });
            });
        });
        //console.log('incorrect', dictionary);

        shuffle(dictionary);
        console.log('possible guesses: ', dictionary);
    }
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
