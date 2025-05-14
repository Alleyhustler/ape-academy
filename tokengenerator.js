const { Connection, Keypair, PublicKey, Transaction, SystemProgram, Token, TOKEN_PROGRAM_ID } = require('@solana/web3.js');
const bs58 = require('bs58');

class TokenGenerator {
    constructor(connection, feePayer) {
        this.connection = connection;
        this.feePayer = feePayer;
    }

    async createToken(name, symbol, decimals = 9, initialSupply = 1000000000) {
        try {
            // Create mint account keypair
            const mintKeypair = Keypair.generate();
            
            // Get fee payer public key
            const feePayerPublicKey = new PublicKey(this.feePayer.publicKey);
            
            // Calculate space and rent
            const space = 82; // Space required for token mint
            const rentExemption = await this.connection.getMinimumBalanceForRentExemption(space);
            
            // Create transaction
            const transaction = new Transaction().add(
                // Create account
                SystemProgram.createAccount({
                    fromPubkey: feePayerPublicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    lamports: rentExemption,
                    space: space,
                    programId: TOKEN_PROGRAM_ID,
                }),
                
                // Initialize mint
                Token.createInitMintInstruction(
                    TOKEN_PROGRAM_ID,
                    mintKeypair.publicKey,
                    decimals,
                    feePayerPublicKey,
                    null // Freeze authority (null means mint can never be frozen)
                )
            );
            
            // Sign and send transaction
            transaction.sign(this.feePayer, mintKeypair);
            const txid = await this.connection.sendTransaction(transaction, [this.feePayer, mintKeypair]);
            
            // Wait for confirmation
            await this.connection.confirmTransaction(txid);
            
            // Create associated token account for the fee payer
            const associatedTokenAccount = await Token.getAssociatedTokenAddress(
                new PublicKey(mintKeypair.publicKey),
                feePayerPublicKey
            );
            
            const createATAInstruction = Token.createAssociatedTokenAccountInstruction(
                feePayerPublicKey,
                associatedTokenAccount,
                feePayerPublicKey,
                mintKeypair.publicKey
            );
            
            const mintToInstruction = Token.createMintToInstruction(
                TOKEN_PROGRAM_ID,
                mintKeypair.publicKey,
                associatedTokenAccount,
                feePayerPublicKey,
                [],
                initialSupply * Math.pow(10, decimals)
            );
            
            const mintTransaction = new Transaction().add(createATAInstruction, mintToInstruction);
            mintTransaction.sign(this.feePayer);
            const mintTxid = await this.connection.sendTransaction(mintTransaction, [this.feePayer]);
            await this.connection.confirmTransaction(mintTxid);
            
            return {
                success: true,
                mintAddress: mintKeypair.publicKey.toBase58(),
                transactionId: txid,
                tokenAccount: associatedTokenAccount.toBase58(),
                name,
                symbol,
                decimals,
                initialSupply
            };
        } catch (error) {
            console.error('Error creating token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = TokenGenerator;