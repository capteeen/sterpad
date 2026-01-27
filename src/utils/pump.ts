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

const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImVjYzAxZDliLTdjYWItNDgzYy1hZDUzLTY4ZGMxMTkwZjZjNCIsIm9yZ0lkIjoiNDkyMTEiLCJ1c2VySWQiOiI0ODg3NiIsInR5cGVJZCI6IjUwMTgwNWE5LTVkNWEtNDI3OC1hMjE4LWIxNGFhYTU0OTljMCIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzQ0NTYzODI2LCJleHAiOjQ5MDAzMjM4MjZ9.XxbCVueyjps5wYAkl8AwuywxhBcw1xkieimSI_yOtfA";

export const getTokenMetadataFromMoralis = async (mintAddress: string) => {
    try {
        const response = await axios.get(`https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/metadata`, {
            headers: {
                'accept': 'application/json',
                'X-API-Key': MORALIS_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Moralis metadata:", error);
        throw error;
    }
};

export const fetchExternalMetadata = async (uri: string) => {
    try {
        let fetchUrl = uri;
        if (uri.startsWith('ipfs://')) {
            fetchUrl = `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
        }
        const response = await axios.get(fetchUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching external metadata from URI:", error, uri);
        return null;
    }
};

export const getFileFromUrl = async (url: string, name: string): Promise<File> => {
    try {
        // Use an image proxy to bypass CORS restrictions
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=webp`;
        const response = await axios.get(proxiedUrl, { responseType: 'blob' });

        // Use the blob type from the response
        const contentType = response.data.type || 'image/webp';
        const extension = contentType.split('/')[1] || 'webp';

        return new File([response.data], `${name}.${extension}`, { type: contentType });
    } catch (error) {
        console.error("Proxy download failed, trying direct fetch as fallback:", error);
        // Fallback to direct fetch in case proxy is down
        const response = await axios.get(url, { responseType: 'blob' });
        const contentType = response.headers['content-type'] || 'image/png';
        return new File([response.data], `${name}.${contentType.split('/')[1]}`, { type: contentType });
    }
};

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

export const generateVanityKeypair = (suffix: string): Keypair => {
    let keypair = Keypair.generate();
    while (!keypair.publicKey.toBase58().toLowerCase().endsWith(suffix.toLowerCase())) {
        keypair = Keypair.generate();
    }
    return keypair;
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

        // Use a vanity mint address for the Shiba theme
        // Finding 'INU' is very fast
        const mintKeypair = generateVanityKeypair('INU');

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
