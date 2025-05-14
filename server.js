const express = require('express');
const cors = require('cors');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const bs58 = require('bs58');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to Solana (mainnet-beta or devnet)
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
// For testing: const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// In-memory "database" for demo purposes
let coins = [];
let currentCoin = null;

// Meme name generators (same as frontend)
const prefixes = ['Doge', 'Shib', 'Pepe', 'Floki', 'Wojak', 'Based', 'Chad', 'Giga', 'Smol', 'Big'];
const suffixes = ['Coin', 'Inu', 'Token', 'Moon', 'Rocket', 'Lambo', 'ToTheMoon', 'Bucks', 'Cash', 'Gold'];
const tickers = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'WOJAK', 'BASED', 'CHAD', 'GIGA', 'SMO', 'BIG'];

// Generate a new coin
function generateNewCoin() {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const ticker = tickers[Math.floor(Math.random() * tickers.length)] + 
                  Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const newCoin = {
        id: Date.now().toString(),
        name: `${prefix}${suffix}`,
        ticker: ticker,
        price: 0.0001,
        holders: 0,
        age: 0,
        totalSupply: 1000000000,
        contractAddress: Keypair.generate().publicKey.toBase58(),
        createdAt: new Date().toISOString()
    };
    
    currentCoin = newCoin;
    coins.unshift(newCoin);
    if (coins.length > 100) coins.pop();
    
    return newCoin;
}

// API Endpoints
app.get('/api/current-coin', (req, res) => {
    if (!currentCoin) {
        currentCoin = generateNewCoin();
    }
    res.json(currentCoin);
});

app.get('/api/recent-coins', (req, res) => {
    res.json(coins.slice(0, 10));
});

app.post('/api/buy-coin', async (req, res) => {
    const { amount, coinId, userAddress } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (!coinId || !currentCoin || coinId !== currentCoin.id) {
        return res.status(400).json({ error: 'Invalid coin' });
    }
    
    try {
        // In a real implementation, we would:
        // 1. Verify the user's wallet has enough SOL
        // 2. Execute the transaction on Solana
        // 3. Update the token balance for the user
        
        // For demo purposes, we'll just simulate it
        currentCoin.holders += 1;
        currentCoin.price += 0.00001 * amount; // Simple bonding curve
        
        res.json({
            success: true,
            message: 'Purchase successful',
            coin: currentCoin,
            tokensReceived: amount / currentCoin.price
        });
    } catch (err) {
        console.error('Purchase error:', err);
        res.status(500).json({ error: 'Purchase failed', details: err.message });
    }
});

// Generate a new coin every minute
setInterval(() => {
    generateNewCoin();
}, 60000);

// Start with one coin
generateNewCoin();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});