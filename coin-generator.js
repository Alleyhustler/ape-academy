// Memecoin name and ticker generator
const prefixes = ['Doge', 'Shib', 'Pepe', 'Wojak', 'Floki', 'Bonk', 'Based', 'Degen', 'Moon', 'Lambo'];
const suffixes = ['Coin', 'Inu', 'Token', 'Cash', 'Bucks', 'Money', 'Gold', 'Dollar', 'Finance', 'Swap'];
const themes = ['Frog', 'Dog', 'Cat', 'Elon', 'Musk', 'Wif', 'Hat', 'Game', 'AI', 'Quantum'];

function generateRandomCoin() {
    // Generate creative memecoin name
    const nameType = Math.floor(Math.random() * 3);
    let name;
    
    switch(nameType) {
        case 0:
            // Prefix + Suffix
            name = `${randomChoice(prefixes)}${randomChoice(suffixes)}`;
            break;
        case 1:
            // Theme + Number
            name = `${randomChoice(themes)}${Math.floor(Math.random() * 10000)}`;
            break;
        case 2:
            // Meme phrase
            name = `${randomChoice(prefixes)}${randomChoice(['ToTheMoon', 'Yolo', 'Wagmi', 'NGMI', 'Fomo'])}`;
            break;
    }
    
    // Generate 3-5 letter ticker
    const tickerLength = Math.random() > 0.5 ? 4 : 3;
    let ticker = '';
    
    // 30% chance to start with the coin's initials
    if (Math.random() < 0.3) {
        ticker = name.substring(0, tickerLength).toUpperCase();
    } else {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < tickerLength; i++) {
            ticker += letters.charAt(Math.floor(Math.random() * letters.length));
        }
    }
    
    // 10% chance to add a number to the ticker
    if (Math.random() < 0.1) {
        ticker += Math.floor(Math.random() * 10);
    }
    
    return {
        name,
        ticker,
        description: generateDescription(name)
    };
}

function generateDescription(name) {
    const descriptions = [
        `The next big ${name} memecoin. Don't miss out!`,
        `${name} is revolutionizing meme economics.`,
        `Join the ${name} movement today!`,
        `${name}: Because why not?`,
        `The most based ${name} token on Solana.`,
        `${name} - it's not a scam, probably.`,
        `Get your bags packed with ${name}!`,
        `${name}: The people's memecoin.`
    ];
    
    return randomChoice(descriptions);
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}