import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Wallet, Github, Twitter, ExternalLink, Plus, Dog } from 'lucide-react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { createWallet, launchToken, getTokenMetadataFromMoralis, getFileFromUrl, fetchExternalMetadata } from './utils/pump';
import type { TokenMetadata } from './utils/pump';

const ShibaIcon = ({ size = 24, className = "" }) => (
  <Dog size={size} className={className} />
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
      Mining Inu-Vanity Protocol... Est Speed: 4.2 GH/s
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const [wallets, setWallets] = useState<{ address: string; privateKey: string }[]>(() => {
    const saved = localStorage.getItem('inupad_wallets');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWalletIndex, setActiveWalletIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('inupad_wallets', JSON.stringify(wallets));
  }, [wallets]);
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);

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
    rpcUrl: 'https://api.mainnet-beta.solana.com'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [vampAddress, setVampAddress] = useState('');
  const [vampLoading, setVampLoading] = useState(false);

  const handleVamp = async () => {
    if (!vampAddress) return;
    setVampLoading(true);
    setLoading(true);
    setStatus({ type: 'info', message: 'Executing Vamp Protocol: Extracting Metadata...' });

    try {
      const metadata = await getTokenMetadataFromMoralis(vampAddress);
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
    setStatus({ type: 'info', message: 'Mining Inu-Vanity address & Launching...' });

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
        parseFloat(formData.amount)
      );

      setStatus({ type: 'success', message: 'Successfully launched!' });
      setTxUrl(result.solscan);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Launch failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {loading && <LoadingOverlay message={status?.message || "Initializing Protocol..."} />}
      <div className="glow-overlay" />
      <div className="scan-line" />
      <div className="container">
        <nav className="navbar">
          <a href="#" className="logo">
            <ShibaIcon className="shiba-glow" size={32} />
            <span>InuPad</span>
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
                  Inu <span style={{ color: 'var(--primary)', textShadow: '0 0 30px var(--primary-glow)' }}>Pad</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                  the fastest, paws-on way to launch your memecoins.
                  Full metadata, IPFS storage, and dev-buy in one click.
                </p>

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
            </div>

            {/* Right Column: Launch Form */}
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
          </div>
        </div>
      </main>

      <footer style={{ marginTop: '8rem', paddingBottom: '4rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <a href="https://github.com/capteeen/lobsterpad" style={{ color: 'var(--text-muted)' }} target="_blank" rel="noreferrer"><Github size={20} /></a>
          <a href="https://twitter.com" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          &copy; 2026 InuPad. Built with paws and treats.
        </p>
      </footer>
    </div>
  );
};

export default App;
