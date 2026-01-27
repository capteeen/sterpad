import axios from 'axios';
import { Keypair, VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const PUMP_FUN_API = "https://pumpportal.fun/api";
const IPFS_API = "https://pump.fun/api/ipfs";
const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export interface TokenMetadata {
    name: string;
    symbol: string;
    description: string;
    twitter?: string;
    telegram?: string;
    website?: string;
    file: File;
}

export const createWallet = async () => {
    try {
        const keypair = Keypair.generate();
        return {
            walletPublickey: keypair.publicKey.toBase58(),
            privateKey: bs58.encode(keypair.secretKey)
        };
    } catch (error) {
        console.error("Error generating wallet:", error);
        throw error;
    }
};

export const launchToken = async (
    signerPrivateKey: string,
    metadata: TokenMetadata,
    rpcUrl: string = DEFAULT_RPC,
    amount: number = 0.01,
    slippage: number = 10,
    priorityFee: number = 0.0005
) => {
    try {
        const signerKeypair = Keypair.fromSecretKey(bs58.decode(signerPrivateKey));
        const mintKeypair = Keypair.generate();

        // 1. Upload to IPFS
        const formData = new FormData();
        formData.append('name', metadata.name);
        formData.append('symbol', metadata.symbol);
        formData.append('description', metadata.description);
        formData.append('twitter', metadata.twitter || '');
        formData.append('telegram', metadata.telegram || '');
        formData.append('website', metadata.website || '');
        formData.append('showName', 'true');
        formData.append('file', metadata.file);

        const ipfsResponse = await axios.post(IPFS_API, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const metadataUri = ipfsResponse.data.metadataUri;

        // 2. Generate local create transaction
        const tradeResponse = await axios.post(`${PUMP_FUN_API}/trade-local`, {
            publicKey: signerKeypair.publicKey.toBase58(),
            action: 'create',
            tokenMetadata: {
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadataUri
            },
            mint: mintKeypair.publicKey.toBase58(),
            denominatedInSol: 'true',
            amount: amount,
            slippage: slippage,
            priorityFee: priorityFee,
            pool: 'pump',
            isMayhemMode: 'false'
        }, {
            responseType: 'arraybuffer'
        });

        const tx = VersionedTransaction.deserialize(new Uint8Array(tradeResponse.data));
        tx.sign([mintKeypair, signerKeypair]);

        // 3. Send transaction
        const connection = new Connection(rpcUrl, 'confirmed');
        const signature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });

        return {
            signature,
            mint: mintKeypair.publicKey.toBase58(),
            solscan: `https://solscan.io/tx/${signature}`
        };

    } catch (error) {
        console.error("Error launching token:", error);
        throw error;
    }
};
