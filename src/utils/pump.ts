import axios from 'axios';
import { Keypair, VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const isDev = import.meta.env.DEV;
const PUMP_FUN_API = isDev ? "/api-pump" : "https://pumpportal.fun/api";
const IPFS_API = isDev ? "/api-ipfs" : "https://pump.fun/api/ipfs";
const DEFAULT_RPC = "https://mainnet.helius-rpc.com/?api-key=0a3ce19e-f73c-4bf7-b1e0-2122850bfff0";

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

export const getTokensByWalletFromMoralis = async (walletAddress: string) => {
    try {
        const response = await axios.get(`https://solana-gateway.moralis.io/account/mainnet/${walletAddress}/tokens`, {
            headers: {
                'accept': 'application/json',
                'X-API-Key': MORALIS_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching wallet tokens from Moralis:", error);
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
    useVanity: boolean = true,
    slippage: number = 10,
    priorityFee: number = 0.0005
) => {
    try {
        const signerKeypair = Keypair.fromSecretKey(bs58.decode(signerPrivateKey));

        // Use a vanity mint address for the Lobster theme if requested
        // Finding 'STER' might take slightly longer than 'INU'
        const mintKeypair = useVanity ? generateVanityKeypair('STER') : Keypair.generate();

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

        let ipfsResponse;
        try {
            ipfsResponse = await axios.post(IPFS_API, formData);
        } catch (ipfsErr: any) {
            console.error("IPFS Upload Failed:", ipfsErr.response?.data || ipfsErr.message);
            if (ipfsErr.message === 'Network Error') {
                throw new Error("IPFS Upload failed (Network/CORS Error). Please check your internet or disable ad-blockers.");
            }
            throw new Error(`IPFS Upload failed: ${ipfsErr.message}`);
        }

        const metadataUri = ipfsResponse.data.metadataUri;

        // 2. Generate local create transaction
        let tradeResponse;
        try {
            tradeResponse = await axios.post(`${PUMP_FUN_API}/trade-local`, {
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
        } catch (tradeErr: any) {
            console.error("Trade-Local API Failed:", tradeErr.response?.data || tradeErr.message);
            throw new Error(`Transaction Generation failed: ${tradeErr.message}. Check if pumpportal.fun is accessible.`);
        }

        const tx = VersionedTransaction.deserialize(new Uint8Array(tradeResponse.data));
        tx.sign([mintKeypair, signerKeypair]);

        // 3. Send transaction
        let signature;
        try {
            const connection = new Connection(rpcUrl, 'confirmed');
            signature = await connection.sendRawTransaction(tx.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });
        } catch (rpcErr: any) {
            console.error("RPC Submission Failed:", rpcErr);
            const is403 = rpcErr.message?.includes('403') || JSON.stringify(rpcErr).includes('403');
            const message = is403
                ? "Access Forbidden (403). The public Solana RPC is blocking this request. Please use a private RPC URL (e.g., from Helius, Alchemy, or QuickNode)."
                : `Transaction Submission failed: ${rpcErr.message}. The RPC might be rate-limited or the network is congested.`;
            throw new Error(message);
        }

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
