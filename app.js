// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize
    await initSolana();
    startCountdown();
    loadCurrentCoin();
    loadRecentCoins();
    
    // Set up event listeners
    document.getElementById('buy-button').addEventListener('click', buyCurrentCoin);
    
    // Start coin generation cycle
    setInterval(generateNewCoin, 60000);
});

let currentCoin = null;
const recentCoins = [];

async function loadCurrentCoin() {
    // If no current coin, generate one immediately
    if (!currentCoin) {
        await generateNewCoin();
        return;
    }
    
    updateCoinDisplay(currentCoin);
}

async function generateNewCoin() {
    // Generate random coin data
    const newCoin = generateRandomCoin();
    
    // Deploy to Solana (simplified)
    const contractAddress = await deployCoinContract(newCoin);
    newCoin.contractAddress = contractAddress;
    newCoin.createdAt = new Date();
    newCoin.price = 0.001;
    newCoin.supply = 0;
    newCoin.holders = [];
    
    // Archive current coin if exists
    if (currentCoin) {
        recentCoins.unshift(currentCoin);
        if (recentCoins.length > 12) recentCoins.pop();
        updateRecentCoinsDisplay();
    }
    
    // Set new current coin
    currentCoin = newCoin;
    updateCoinDisplay(currentCoin);
    
    // Reset countdown
    resetCountdown();
}

function updateCoinDisplay(coin) {
    document.getElementById('current-coin-name').textContent = coin.name;
    document.getElementById('current-coin-ticker').textContent = coin.ticker;
    document.getElementById('current-coin-price').textContent = coin.price.toFixed(6);
    document.getElementById('current-coin-supply').textContent = coin.supply;
    document.getElementById('current-coin-holders').textContent = coin.holders.length;
    
    // Update age counter
    updateCoinAge();
    setInterval(updateCoinAge, 1000);
}

function updateCoinAge() {
    if (!currentCoin) return;
    
    const ageInSeconds = Math.floor((new Date() - currentCoin.createdAt) / 1000);
    document.getElementById('current-coin-age').textContent = `${ageInSeconds}s`;
}

function updateRecentCoinsDisplay() {
    const grid = document.getElementById('recent-coins-grid');
    grid.innerHTML = '';
    
    recentCoins.forEach(coin => {
        const ageInMinutes = Math.floor((new Date() - coin.createdAt) / 60000);
        
        const card = document.createElement('div');
        card.className = 'recent-coin-card';
        card.innerHTML = `
            <div class="coin-header">
                <span class="coin-name">${coin.name}</span>
                <span class="coin-ticker">${coin.ticker}</span>
            </div>
            <div class="coin-price">$${coin.price.toFixed(6)}</div>
            <div class="coin-stats">
                <div>Supply: ${coin.supply}</div>
                <div>Holders: ${coin.holders.length}</div>
                <div>Age: ${ageInMinutes}m</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function buyCurrentCoin() {
    if (!currentCoin) return;
    
    // Simulate purchase
    const amount = prompt(`How much ${currentCoin.ticker} do you want to buy?`, "0.1");
    if (!amount || isNaN(amount)) return;
    
    const solAmount = parseFloat(amount);
    if (solAmount <= 0) return;
    
    // Process purchase
    try {
        const txId = await purchaseCoin(currentCoin, solAmount);
        alert(`Purchase successful! TX ID: ${txId}`);
        
        // Update coin stats
        currentCoin.supply += solAmount * 1000; // Simplified calculation
        currentCoin.price *= 1.05; // Price increases 5% with each purchase
        if (!currentCoin.holders.includes('You')) {
            currentCoin.holders.push('You');
        }
        
        updateCoinDisplay(currentCoin);
    } catch (error) {
        alert(`Purchase failed: ${error.message}`);
    }
}

function startCountdown() {
    let seconds = 60;
    const timerElement = document.getElementById('next-coin-timer');
    
    const countdown = setInterval(() => {
        seconds--;
        timerElement.textContent = `00:${seconds.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            clearInterval(countdown);
        }
    }, 1000);
}

function resetCountdown() {
    // This would be called when a new coin is generated
    startCountdown();
}