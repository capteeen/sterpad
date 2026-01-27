import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Wallet, Github, ExternalLink, Plus, Zap, Shield, Cpu, Activity, Star, Layers, Send, TrendingUp } from 'lucide-react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { createWallet, launchToken, getTokenMetadataFromMoralis, getFileFromUrl, fetchExternalMetadata } from './utils/pump';
import type { TokenMetadata } from './utils/pump';

const ShibaIcon = ({ size = 24, className = "" }) => (
  <img
    src="/buff-doge.png"
    alt="Clawdinu Logo"
    width={size}
    height={size}
    className={className}
    style={{ borderRadius: '8px', objectFit: 'contain' }}
  />
);

const CornerAccents = () => (
  <>
    <div className="corner-accent corner-tl" />
    <div className="corner-accent corner-tr" />
    <div className="corner-accent corner-bl" />
    <div className="corner-accent corner-br" />
  </>
);

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <motion.div
    className="loader-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="loader-container">
      <div className="loader-ring" />
      <div className="loader-ring-inner" />
      <div className="loader-core" />
    </div>
    <div className="loader-text pulse">{message}</div>
    <div className="tech-text" style={{ marginTop: '1rem', opacity: 0.5 }}>
      Mining Clawdinu-Vanity Protocol... Est Speed: 4.2 GH/s
    </div>
  </motion.div>
);

const TickerBar = () => (
  <div className="ticker-wrap">
    <div className="ticker">
      {[...Array(2)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="ticker-item">NEW LAUNCH: <span>$SHIBALORD</span> deployed 2m ago</div>
          <div className="ticker-item">VAMP STATUS: <span>SUCCESS</span> cloned $PEPE_INU</div>
          <div className="ticker-item">NETWORK: <span>SOLANA MAINNET</span> 2840 TPS</div>
          <div className="ticker-item">VOLUME: <span>4,209 SOL</span> last 24h</div>
          <div className="ticker-item">SPAM PROTOCOL: <span>ACTIVE</span> 12 instances</div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

const TerminalLog: React.FC<{ logs: { type: string, message: string, time: string }[] }> = ({ logs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal-card" ref={scrollRef}>
      {logs.map((log, i) => (
        <div key={i} className="terminal-line">
          <span className="terminal-timestamp">[{log.time}]</span>
          <span className={`terminal-${log.type}`}>{log.message}</span>
        </div>
      ))}
      {logs.length === 0 && <div className="terminal-line"><span className="terminal-info">Waiting for incoming protocol requests...</span></div>}
    </div>
  );
};

const FloatingDoge = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <motion.img
      src="/buff-doge.png"
      style={{
        width: '600px',
        height: '600px',
        opacity: 0.1,
        filter: 'drop-shadow(0 0 80px var(--primary-glow)) blur(2px)',
      }}
      animate={{
        rotate: [0, 45, -45, 180, 0, 360],
        rotateX: [0, 20, -20, 0],
        rotateY: [0, -20, 20, 0],
        scale: [1, 1.1, 0.9, 1.1, 1],
        x: [0, 100, -100, 50, -50, 0],
        y: [0, -50, 50, -30, 30, 0],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      alt=""
    />
  </div>
);

const Roadmap = () => (
  <section style={{ marginTop: '10rem' }}>
    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Development <span style={{ color: 'var(--primary)' }}>Orbit</span></h2>
      <p style={{ color: 'var(--text-muted)' }}>Our trajectory for the Clawdinu ecosystem.</p>
    </div>

    <div className="roadmap-container">
      <div className="roadmap-line" />

      {[
        { phase: 'Phase 1', title: 'Neural Genesis', items: ['Vamp Protocol refinement', 'Spam deployment engine', 'Shiba branding pack'], status: 'Active' },
        { phase: 'Phase 2', title: 'Alpha Pack', items: ['Multi-wallet bundle buys', 'Sniper protection layers', 'Advanced metadata locking'], status: 'Pending' },
        { phase: 'Phase 3', title: 'Global Barker', items: ['Social media bot integration', 'One-click DEX listing', 'Liquidity migration tools'], status: 'Future' },
        { phase: 'Phase 4', title: 'Clawd Metaverse', items: ['Cross-chain deployment', 'Governance token launch', 'Institutional fund portal'], status: 'Future' }
      ].map((item, i) => (
        <motion.div
          key={i}
          className="roadmap-item"
          initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
        >
          <div className="roadmap-content">
            <span className="roadmap-tag">{item.phase}</span>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{item.title}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {item.items.map((li, j) => (
                <li key={j} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }} />
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <div className="roadmap-dot" />
        </motion.div>
      ))}
    </div>
  </section>
);

const UtilitySection = () => (
  <section style={{ marginTop: '10rem' }}>
    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Clawdinu <span style={{ color: 'var(--primary)' }}>Utility</span></h2>
      <p style={{ color: 'var(--text-muted)' }}>Why Shibas trust our protocol for their missions.</p>
    </div>

    <div className="utility-grid">
      <div className="utility-card">
        <Star style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>Premium Metadata</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Fully compliant Metaplex metadata uploads. High-res imagery support and IPFS persistence.
        </p>
      </div>
      <div className="utility-card">
        <Layers style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>Bundle Support</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Simultaneously mint and buy your own tokens to establish a floor and show confidence to the pack.
        </p>
      </div>
      <div className="utility-card">
        <Send style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>Social Integration</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Direct links to Twitter, Telegram, and Websites baked into the contract for instant credibility.
        </p>
      </div>
      <div className="utility-card">
        <TrendingUp style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>Analytics Ready</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Clean contract structures that play nice with Birdeye, DexScreener, and more.
        </p>
      </div>
    </div>
  </section>
);

const App: React.FC = () => {
  const [wallets, setWallets] = useState<{ address: string; privateKey: string }[]>(() => {
    const saved = localStorage.getItem('clawdinu_wallets');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWalletIndex, setActiveWalletIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('clawdinu_wallets', JSON.stringify(wallets));
  }, [wallets]);
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [launchedTokens, setLaunchedTokens] = useState<{ name: string; symbol: string; mint: string; url: string; time: string }[]>(() => {
    const saved = localStorage.getItem('clawdinu_launches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('clawdinu_launches', JSON.stringify(launchedTokens));
  }, [launchedTokens]);

  const activeWallet = activeWalletIndex !== null ? wallets[activeWalletIndex] : null;

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
    amount: '0.01',
    privateKey: '',
    rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=0a3ce19e-f73c-4bf7-b1e0-2122850bfff0'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [vampAddress, setVampAddress] = useState('');
  const [vampLoading, setVampLoading] = useState(false);
  const [spamCount, setSpamCount] = useState(5);
  const [spamLoading, setSpamLoading] = useState(false);
  const [spamFormData, setSpamFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
    amount: '0.01',
    rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=0a3ce19e-f73c-4bf7-b1e0-2122850bfff0'
  });
  const [spamImageFile, setSpamImageFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<{ type: string, message: string, time: string }[]>([]);

  const addLog = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { type, message, time }]);
  };

  useEffect(() => {
    addLog('info', 'Clawdinu Protocol v1.0.4 Initialized');
    addLog('info', 'Secure Wallet Sync active');
  }, []);

  const handleVamp = async () => {
    if (!vampAddress) return;
    setVampLoading(true);
    setLoading(true);
    setStatus({ type: 'info', message: 'Executing Vamp Protocol: Extracting Metadata...' });

    addLog('warning', `Vamp Protocol: Targeting ${vampAddress}`);
    try {
      const metadata = await getTokenMetadataFromMoralis(vampAddress);
      addLog('info', `Metadata fetched for ${metadata.name}`);
      console.log('Vamp Moralis Response:', metadata);

      // Metaplex often stores data in a JSON file at a URI
      const metaplex = metadata.metaplex || {};
      let extData = metaplex.metadataUriData || {};
      const targetUri = metaplex.metadataUri || metadata.uri || metadata.metadata_uri;

      // If Moralis didn't pre-fetch the URI data, we do it manually
      if ((!extData || Object.keys(extData).length === 0) && targetUri) {
        setStatus({ type: 'info', message: 'Vamp Protocol: Resolving Metaplex URI...' });
        const fetched = await fetchExternalMetadata(targetUri);
        if (fetched) extData = fetched;
      }

      console.log('Vamp External Data:', extData);

      // Exhaustive search for description across ALL sources
      const rawDescription =
        metadata.description ||
        extData.description ||
        extData.text ||
        extData.about ||
        extData.summary ||
        extData.description_text ||
        '';

      const cleanDescription = (rawDescription || '').toString().trim();

      // Multi-Source Social Scraper
      const findLink = (keys: string[], ...sources: any[]) => {
        for (const source of sources) {
          if (!source) continue;
          // Check root of source
          for (const key of keys) {
            if (source[key] && typeof source[key] === 'string') return source[key];
          }
          // Check extensions if exist
          if (source.extensions) {
            for (const key of keys) {
              if (source.extensions[key] && typeof source.extensions[key] === 'string') return source.extensions[key];
            }
          }
        }
        return '';
      };

      const twitter = findLink(['twitter', 'twitter_url', 'x_url', 'x'], extData, metadata);
      const telegram = findLink(['telegram', 'telegram_url', 'tg_url', 'tg'], extData, metadata);
      const website = findLink(['website', 'external_url', 'external_link', 'url', 'site'], extData, metadata);

      setFormData(prev => ({
        ...prev,
        name: metadata.name || extData.name || prev.name,
        symbol: metadata.symbol || extData.symbol || prev.symbol,
        description: cleanDescription || prev.description,
        twitter: twitter || prev.twitter,
        telegram: telegram || prev.telegram,
        website: website || prev.website,
      }));

      const imageToDownload = metadata.logo || metadata.image || extData.image || extData.logo || extData.icon;
      if (imageToDownload) {
        setStatus({ type: 'info', message: 'Vamp Protocol: Downloading Assets...' });
        try {
          const file = await getFileFromUrl(imageToDownload, metadata.symbol || 'cloned');
          setImageFile(file);
        } catch (assetErr) {
          console.warn("Could not download coin icon (CORS likely):", assetErr);
          setStatus({ type: 'info', message: 'Vamp Successful: Metadata cloned, but icon blocked (CORS). Please upload manually.' });
          await new Promise(r => setTimeout(r, 4000));
          return;
        }
      }

      setStatus({ type: 'success', message: 'Vamp Successful! Full protocol executed.' });
      setVampAddress('');
    } catch (err: any) {
      console.error("Vamp Error Details:", err);
      const errorMsg = err.response?.status === 404
        ? "Token not found on Solana Mainnet"
        : err.response?.status === 401
          ? "Moralis API Key invalid or expired"
          : err.message || "Unknown Vamp error";
      setStatus({ type: 'error', message: `Vamp Failed: ${errorMsg}` });
    } finally {
      setVampLoading(false);
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Generating Secure Neural Keypair...' });

    // Artificial delay to show the futuristic animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const data = await createWallet();
      const newWallet = { address: data.walletPublickey, privateKey: data.privateKey };
      setWallets(prev => [...prev, newWallet]);
      setActiveWalletIndex(wallets.length);
      setFormData(prev => ({ ...prev, privateKey: data.privateKey }));
      setStatus({ type: 'success', message: 'New wallet generated!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to create wallet' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importKey) return;
    setLoading(true);
    setStatus({ type: 'info', message: 'Syncing External Wallet...' });

    // Artificial delay for futuristic feel
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const keypair = Keypair.fromSecretKey(bs58.decode(importKey));
      const newWallet = { address: keypair.publicKey.toBase58(), privateKey: importKey };
      setWallets(prev => [...prev, newWallet]);
      setActiveWalletIndex(wallets.length);
      setFormData(prev => ({ ...prev, privateKey: importKey }));
      setImportKey('');
      setShowImport(false);
      setStatus({ type: 'success', message: 'Wallet imported successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Invalid private key format' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: 'success', message: `${label} copied to clipboard!` });
    setTimeout(() => setStatus(null), 2000);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Please select an image' });
      return;
    }
    if (!formData.privateKey) {
      setStatus({ type: 'error', message: 'Private key is required' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Mining Clawdinu-Vanity address & Launching...' });

    addLog('info', `Deploying ${formData.name} (${formData.symbol})...`);
    try {
      const metadata: TokenMetadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        twitter: formData.twitter,
        telegram: formData.telegram,
        website: formData.website,
        file: imageFile
      };

      const result = await launchToken(
        formData.privateKey,
        metadata,
        formData.rpcUrl,
        parseFloat(formData.amount),
        true // useVanity
      );

      addLog('success', `Launch Successful! Mint: ${result.mint}`);
      setStatus({ type: 'success', message: 'Successfully launched!' });
      setTxUrl(result.solscan);

      const newLaunch = {
        name: formData.name,
        symbol: formData.symbol,
        mint: result.mint,
        url: result.solscan,
        time: new Date().toLocaleString()
      };
      setLaunchedTokens(prev => [newLaunch, ...prev]);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Launch failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSpamLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spamImageFile) {
      setStatus({ type: 'error', message: 'Please select an image for spam launching' });
      return;
    }
    if (!formData.privateKey) {
      setStatus({ type: 'error', message: 'Private key is required (select a wallet first)' });
      return;
    }

    setSpamLoading(true);
    setLoading(true);
    setStatus({ type: 'info', message: `Spam Protocol Initialized: Launching ${spamCount} tokens...` });

    try {
      for (let i = 0; i < spamCount; i++) {
        setStatus({ type: 'info', message: `Launching token ${i + 1}/${spamCount}...` });

        const metadata: TokenMetadata = {
          name: `${spamFormData.name} #${i + 1}`,
          symbol: `${spamFormData.symbol}${i + 1}`,
          description: spamFormData.description,
          twitter: spamFormData.twitter,
          telegram: spamFormData.telegram,
          website: spamFormData.website,
          file: spamImageFile
        };

        const result = await launchToken(
          formData.privateKey,
          metadata,
          spamFormData.rpcUrl,
          parseFloat(spamFormData.amount),
          false // No vanity for spam
        );

        console.log(`Launched token ${i + 1}:`, result.mint);

        const newLaunch = {
          name: `${spamFormData.name} #${i + 1}`,
          symbol: `${spamFormData.symbol}${i + 1}`,
          mint: result.mint,
          url: result.solscan,
          time: new Date().toLocaleString()
        };
        setLaunchedTokens(prev => [newLaunch, ...prev]);
      }

      setStatus({ type: 'success', message: `Spam Launch Successful! ${spamCount} tokens deployed.` });
    } catch (err: any) {
      setStatus({ type: 'error', message: `Spam Launch interrupted: ${err.message}` });
    } finally {
      setSpamLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <FloatingDoge />
      <TickerBar />
      {loading && <LoadingOverlay message={status?.message || "Initializing Protocol..."} />}
      <div className="glow-overlay" />
      <div className="scan-line" />
      <div className="container">
        <nav className="navbar">
          <a href="#" className="logo">
            <ShibaIcon className="clawdinu-glow" size={32} />
            <span>Clawdinu</span>
          </a>
        </nav>
      </div>

      <main>
        {/* Hero Section - Full Width */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="tech-text" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                  Generation Protocol v1.0.4
                </div>
                <h1 style={{ fontSize: '5rem', marginBottom: '1rem', fontWeight: 700, letterSpacing: '-2px' }}>
                  Clawd <span style={{ color: 'var(--primary)', textShadow: '0 0 30px var(--primary-glow)' }}>Inu</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                  the fastest, paws-on way to launch your memecoins.
                  Full metadata, IPFS storage, and dev-buy in one click.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                  <a href="https://github.com/capteeen/clawdinu" className="hero-social-link" target="_blank" rel="noreferrer">
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                  <a href="https://twitter.com" className="hero-social-link" target="_blank" rel="noreferrer">
                    <span>X</span>
                  </a>
                </div>

                <div className="claude-badge">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary-glow)' }} />
                  Supported by Claude AI
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>

            {/* Left Column: Wallet & Vamp */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Vamp Protocol Card */}
              <motion.div
                className="card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ border: '1px solid rgba(0, 242, 255, 0.2)' }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Plus style={{ color: 'var(--secondary)' }} />
                  <h2 style={{ fontSize: '1.5rem' }}>Vamp Protocol</h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Paste a contract address to clone its metadata and launch it as your own.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <input
                      placeholder="Solana Contract Address"
                      value={vampAddress}
                      onChange={(e) => setVampAddress(e.target.value)}
                      style={{ fontSize: '0.8rem', borderColor: 'rgba(0, 242, 255, 0.2)' }}
                    />
                  </div>
                  <button
                    className="btn-outline"
                    style={{
                      borderColor: 'var(--secondary)',
                      color: 'var(--secondary)',
                      background: 'rgba(0, 242, 255, 0.05)'
                    }}
                    onClick={handleVamp}
                    disabled={vampLoading || !vampAddress}
                  >
                    {vampLoading ? 'EXTRACTING...' : 'EXECUTE VAMP'}
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Wallet style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: '1.5rem' }}>Wallet Manager</h2>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.6rem' }}
                    onClick={handleCreateWallet}
                    disabled={loading}
                  >
                    {loading ? '...' : 'Generate'}
                  </button>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.6rem' }}
                    onClick={() => setShowImport(!showImport)}
                  >
                    Import
                  </button>
                  {wallets.length > 0 && (
                    <button
                      className="btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.6rem', color: '#ff4d4d' }}
                      onClick={() => {
                        if (confirm('Clear all stored wallets?')) {
                          setWallets([]);
                          setActiveWalletIndex(null);
                        }
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {showImport && (
                  <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      placeholder="Paste Private Key"
                      value={importKey}
                      onChange={(e) => setImportKey(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <button className="btn-primary" onClick={handleImportWallet} style={{ padding: '0 1rem' }}>Add</button>
                  </div>
                )}

                {wallets.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {wallets.map((w, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveWalletIndex(idx);
                          setFormData(prev => ({ ...prev, privateKey: w.privateKey }));
                        }}
                        style={{
                          padding: '0.8rem',
                          borderRadius: '8px',
                          background: activeWalletIndex === idx ? 'rgba(255, 77, 77, 0.1)' : '#151515',
                          border: `1px solid ${activeWalletIndex === idx ? 'var(--primary)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: activeWalletIndex === idx ? 'white' : 'var(--text-muted)' }}>
                          <span>Wallet {idx + 1}</span>
                          <span>{w.address.slice(0, 4)}...{w.address.slice(-4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeWallet ? (
                  <div style={{ background: '#000', padding: '1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Public Address
                        <span
                          onClick={() => copyToClipboard(activeWallet.address, 'Public Address')}
                          style={{ color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          Copy
                        </span>
                      </label>
                      <div style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>
                        {activeWallet.address}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Private Key
                        <span
                          onClick={() => copyToClipboard(activeWallet.privateKey, 'Private Key')}
                          style={{ color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          Copy
                        </span>
                      </label>
                      <div style={{ color: '#ff4d4d', wordBreak: 'break-all' }}>
                        {activeWallet.privateKey.slice(0, 8)}********************************
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                    No wallets active. Create or import one to start.
                  </p>
                )}
              </motion.div>

              {status && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `1px solid ${status.type === 'error' ? '#ff4d4d' : status.type === 'success' ? '#4dff4d' : '#4d94ff'}`,
                    background: status.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(77, 255, 77, 0.1)',
                  }}
                >
                  <p style={{ color: status.type === 'error' ? '#ff4d4d' : status.type === 'success' ? '#4dff4d' : '#4d94ff' }}>
                    {status.message}
                  </p>
                  {txUrl && (
                    <a href={txUrl} target="_blank" rel="noreferrer" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      View Transaction <ExternalLink size={14} />
                    </a>
                  )}
                </motion.div>
              )}

              {/* Terminal Logs Card */}
              <motion.div
                className="card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Activity style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: '1.2rem' }}>Protocol Logs</h2>
                </div>
                <TerminalLog logs={logs} />
              </motion.div>

              {/* Launch History Card */}
              {launchedTokens.length > 0 && (
                <motion.div
                  className="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CornerAccents />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <TrendingUp style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.2rem' }}>Launch History</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {launchedTokens.map((token, i) => (
                      <div key={i} className="terminal-line" style={{ flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{token.name} ({token.symbol})</span>
                          <span style={{ fontSize: '0.7rem', color: '#555' }}>{token.time}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                          Mint: {token.mint}
                        </div>
                        <a href={token.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View on Solscan <ExternalLink size={10} />
                        </a>
                      </div>
                    ))}
                    <button
                      className="btn-outline"
                      style={{ fontSize: '0.7rem', padding: '0.4rem', marginTop: '0.5rem', color: '#ff4d4d' }}
                      onClick={() => {
                        if (confirm('Clear launch history?')) setLaunchedTokens([]);
                      }}
                    >
                      Clear History
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Launch Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <motion.div
                className="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <Rocket style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: '1.5rem' }}>Launch Token</h2>
                </div>

                <form onSubmit={handleLaunch}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label>Token Name</label>
                      <input
                        placeholder="e.g. Shiba King"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Symbol</label>
                      <input
                        placeholder="e.g. SHIBA"
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Tell the world about your Shiba..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Image (Required)</label>
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: imageFile ? 'rgba(255, 77, 77, 0.05)' : 'transparent'
                      }}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      {imageFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                          <img
                            src={URL.createObjectURL(imageFile)}
                            alt="preview"
                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <span style={{ color: 'var(--primary)' }}>{imageFile.name}</span>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)' }}>
                          <Plus style={{ margin: '0 auto 0.5rem' }} />
                          <p>Click to upload image</p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <div className="input-group">
                      <label>Twitter (Optional)</label>
                      <input
                        placeholder="link"
                        value={formData.twitter}
                        onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Telegram (Optional)</label>
                      <input
                        placeholder="link"
                        value={formData.telegram}
                        onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Website (Optional)</label>
                      <input
                        placeholder="link"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

                  <div className="input-group">
                    <label>Dev Buy Amount (SOL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '1rem', height: '3.5rem', fontSize: '1.1rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'LAUNCH PAWS FIRST'}
                  </button>
                </form>
              </motion.div>

              {/* Spam Launch Card */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ border: '1px solid rgba(255, 77, 77, 0.2)' }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Rocket style={{ color: '#ff4d4d' }} />
                  <h2 style={{ fontSize: '1.5rem' }}>Spam Launch Protocol</h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  Deploy multiple tokens sequentially with independent metadata.
                  <span style={{ color: '#ff4d4d', display: 'block', marginTop: '0.5rem' }}>Warning: Each launch requires SOL for dev-buy + fees.</span>
                </p>

                <form onSubmit={handleSpamLaunch}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label>Base Token Name</label>
                      <input
                        placeholder="e.g. Shiba Spam"
                        value={spamFormData.name}
                        onChange={e => setSpamFormData({ ...spamFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Base Symbol</label>
                      <input
                        placeholder="e.g. SPAM"
                        value={spamFormData.symbol}
                        onChange={e => setSpamFormData({ ...spamFormData, symbol: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      rows={2}
                      placeholder="Spam description..."
                      value={spamFormData.description}
                      onChange={e => setSpamFormData({ ...spamFormData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Spam Image</label>
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: spamImageFile ? 'rgba(255, 77, 77, 0.05)' : 'transparent'
                      }}
                      onClick={() => document.getElementById('spam-file-upload')?.click()}
                    >
                      {spamImageFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                          <img
                            src={URL.createObjectURL(spamImageFile)}
                            alt="preview"
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{spamImageFile.name}</span>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <Plus size={16} style={{ margin: '0 auto 0.2rem' }} />
                          <p>Upload Spam Hero</p>
                        </div>
                      )}
                      <input
                        id="spam-file-upload"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={e => setSpamImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="input-group">
                      <label>Tokens to Launch</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={spamCount}
                        onChange={(e) => setSpamCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Dev Buy (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={spamFormData.amount}
                        onChange={e => setSpamFormData({ ...spamFormData, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      background: 'linear-gradient(45deg, #ff4d4d, #f5a623)',
                      height: '3.5rem',
                      fontSize: '1.1rem'
                    }}
                    disabled={loading || spamLoading}
                  >
                    {spamLoading ? 'EXECUTING SPAM...' : 'EXECUTE SPAM PROTOCOL'}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>

          <UtilitySection />

          <Roadmap />

          {/* Features Section */}
          <section className="feature-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon"><Zap size={32} /></div>
              <h3>Ultra-Sonic Launch</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Deploy tokens to Pump.fun in milleseconds. Our optimized protocol ensures you're first to the party.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="feature-icon"><Shield size={32} /></div>
              <h3>Paws-Locked Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Local keypair storage only. Your private keys never leave your browser. Secure, audited, and paws-on.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon"><Cpu size={32} /></div>
              <h3>Neural Vanity Protocol</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Automatically mine custom contract addresses ending in 'INU' for maximum meme aesthetic and clout.
              </p>
            </motion.div>
          </section>

          {/* New CTA Section */}
          <motion.section
            style={{
              marginTop: '8rem',
              padding: '6rem',
              borderRadius: '40px',
              background: 'radial-gradient(circle at top right, rgba(245, 166, 35, 0.1), transparent)',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to Take the <span style={{ color: 'var(--primary)' }}>Lead?</span></h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Join thousands of shibas deploying the next generation of tokens on Solana.
            </p>
            <button className="btn-primary" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
              Start Deploying Now
            </button>
          </motion.section>
        </div>
      </main>

      <footer style={{ marginTop: '8rem', paddingBottom: '4rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          &copy; 2026 Clawdinu. Built with paws and treats.
        </p>
      </footer>
    </div>
  );
};

export default App;
