// Connect to Solana (using Phantom for example)
let provider;
let currentCoin = {};
let recentCoins = [];
let countdownInterval;
let timeLeft = 60;

// Meme name generators
const prefixes = ['Doge', 'Shib', 'Pepe', 'Floki', 'Wojak', 'Based', 'Chad', 'Giga', 'Smol', 'Big'];
const suffixes = ['Coin', 'Inu', 'Token', 'Moon', 'Rocket', 'Lambo', 'ToTheMoon', 'Bucks', 'Cash', 'Gold'];
const tickers = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'WOJAK', 'BASED', 'CHAD', 'GIGA', 'SMO', 'BIG'];

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await checkWalletConnection();
    initializeCountdown();
    generateNewCoin();
    loadRecentCoins();
    
    // Set up event listeners
    document.getElementById('buyButton').addEventListener('click', openBuyModal);
    document.querySelector('.close').addEventListener('click', closeBuyModal);
    document.getElementById('confirmBuy').addEventListener('click', confirmPurchase);
    document.getElementById('buyAmount').addEventListener('input', updateEstimate);
});

async function checkWalletConnection() {
    if (window.solana && window.solana.isPhantom) {
        provider = window.solana;
        try {
            await provider.connect();
            console.log('Connected to Phantom wallet');
        } catch (err) {
            console.error('Connection error:', err);
        }
    } else {
        alert('Phantom wallet not detected! Please install Phantom to use this app.');
    }
}

function initializeCountdown() {
    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            generateNewCoin();
            timeLeft = 60;
        }
    }, 1000);
}

function generateNewCoin() {
    // Generate random name and ticker
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const ticker = tickers[Math.floor(Math.random() * tickers.length)] + 
                  Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    currentCoin = {
        name: `${prefix}${suffix}`,
        ticker: ticker,
        price: 0.0001,
        holders: 0,
        age: 0,
        totalSupply: 1000000000,
        contractAddress: generateRandomAddress()
    };
    
    // Update UI
    updateCurrentCoinUI();
    
    // Add to recent coins
    recentCoins.unshift({...currentCoin});
    if (recentCoins.length > 6) recentCoins.pop();
    updateRecentCoinsUI();
    
    // Start aging the coin
    startCoinAging();
}

function generateRandomAddress() {
    const chars = '0123456789ABCDEF';
    let result = '0x';
    for (let i = 0; i < 40; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

function updateCurrentCoinUI() {
    document.querySelector('#currentCoin .coin-name').textContent = currentCoin.name;
    document.querySelector('#currentCoin .coin-ticker').textContent = currentCoin.ticker;
    document.querySelector('#currentCoin .coin-price').textContent = `$${currentCoin.price.toFixed(4)}`;
    document.getElementById('coinAge').textContent = currentCoin.age;
    document.getElementById('coinHolders').textContent = currentCoin.holders;
}

function startCoinAging() {
    setInterval(() => {
        currentCoin.age++;
        document.getElementById('coinAge').textContent = currentCoin.age;
    }, 60000);
}

function loadRecentCoins() {
    // In a real app, this would come from an API
    for (let i = 0; i < 5; i++) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const ticker = tickers[Math.floor(Math.random() * tickers.length)] + 
                      Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        recentCoins.push({
            name: `${prefix}${suffix}`,
            ticker: ticker,
            price: (Math.random() * 0.01).toFixed(6),
            holders: Math.floor(Math.random() * 1000),
            age: Math.floor(Math.random() * 60) + 1,
            contractAddress: generateRandomAddress()
        });
    }
    
    updateRecentCoinsUI();
}

function updateRecentCoinsUI() {
    const container = document.getElementById('recentCoins');
    container.innerHTML = '';
    
    recentCoins.forEach(coin => {
        const coinElement = document.createElement('div');
        coinElement.className = 'coin-item';
        coinElement.innerHTML = `
            <div class="coin-name">${coin.name}</div>
            <div class="coin-ticker">${coin.ticker}</div>
            <div class="coin-price">$${coin.price}</div>
            <div class="coin-stats">
                <span>Age: ${coin.age} min</span>
                <span>Holders: ${coin.holders}</span>
            </div>
            <button class="buy-button small" data-address="${coin.contractAddress}">TRADE</button>
        `;
        container.appendChild(coinElement);
    });
    
    // Add event listeners to all trade buttons
    document.querySelectorAll('.coin-item .buy-button').forEach(button => {
        button.addEventListener('click', () => {
            const coinAddress = button.getAttribute('data-address');
            const coin = recentCoins.find(c => c.contractAddress === coinAddress);
            if (coin) openBuyModal(coin);
        });
    });
}

function openBuyModal(coin = null) {
    const modal = document.getElementById('buyModal');
    const coinToBuy = coin || currentCoin;
    
    document.getElementById('modalCoinName').textContent = coinToBuy.name;
    document.getElementById('modalCoinTicker').textContent = coinToBuy.ticker;
    updateEstimate();
    
    modal.style.display = 'block';
}

function closeBuyModal() {
    document.getElementById('buyModal').style.display = 'none';
}

function updateEstimate() {
    const amount = parseFloat(document.getElementById('buyAmount').value) || 0;
    const estimatedTokens = amount / currentCoin.price;
    document.getElementById('estimatedTokens').textContent = estimatedTokens.toFixed(0);
}

async function confirmPurchase() {
    const amount = parseFloat(document.getElementById('buyAmount').value);
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!provider) {
        alert('Please connect your wallet first');
        return;
    }
    
    try {
        // In a real app, this would interact with the Solana blockchain
        console.log(`Purchasing ${amount} SOL worth of ${currentCoin.ticker}`);
        
        // Simulate transaction
        currentCoin.holders++;
        currentCoin.price += 0.00001; // Price goes up with each purchase
        updateCurrentCoinUI();
        
        alert('Purchase successful!');
        closeBuyModal();
    } catch (err) {
        console.error('Purchase error:', err);
        alert('Purchase failed: ' + err.message);
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('buyModal');
    if (event.target === modal) {
        closeBuyModal();
    }
});