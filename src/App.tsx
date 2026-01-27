import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Wallet, Github, Twitter, ExternalLink, Plus } from 'lucide-react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { createWallet, launchToken } from './utils/pump';
import type { TokenMetadata } from './utils/pump';

const LobsterIcon = ({ size = 24, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 12c-2 0-4 1.5-4 4s2 4 4 4 4-1.5 4-4-2-4-4-4Z" />
    <path d="M12 12V4" />
    <path d="M10 4h4" />
    <path d="M4 10c0-2 2-4 4-4" />
    <path d="M20 10c0-2-2-4-4-4" />
    <path d="M7 21c0-2 1-3 2-4" />
    <path d="M17 21c0-2-1-3-2-4" />
  </svg>
);

const App: React.FC = () => {
  const [wallets, setWallets] = useState<{ address: string; privateKey: string }[]>([]);
  const [activeWalletIndex, setActiveWalletIndex] = useState<number | null>(null);
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

  const handleCreateWallet = async () => {
    setLoading(true);
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

  const handleImportWallet = () => {
    if (!importKey) return;
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
    setStatus({ type: 'info', message: 'Launching token on PumpFun...' });

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
      <div className="glow-overlay" />

      <div className="container">
        <nav className="navbar">
          <a href="#" className="logo">
            <LobsterIcon className="lobster-glow" size={32} />
            <span>LobsterPad</span>
          </a>

        </nav>

        <main>
          {/* Hero Section */}
          <section className="hero" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 700 }}>
                Lobster <span style={{ color: 'var(--primary)' }}>Pad</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                the fastest, claws-on way to launch your memecoins.
                Full metadata, IPFS storage, and dev-buy in one click.
              </p>
            </motion.div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>

            {/* Left Column: Wallet & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              <motion.div
                className="card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Rocket style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.5rem' }}>Launch Token</h2>
              </div>

              <form onSubmit={handleLaunch}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>Token Name</label>
                    <input
                      placeholder="e.g. Lobster King"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Symbol</label>
                    <input
                      placeholder="e.g. LOBSTR"
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
                    placeholder="Tell the world about your lobster..."
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
                  {loading ? 'Processing...' : 'LAUNCH CLAWS FIRST'}
                </button>
              </form>
            </motion.div>
          </div>
        </main>

        <footer style={{ marginTop: '8rem', paddingBottom: '4rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <a href="https://github.com" style={{ color: 'var(--text-muted)' }}><Github size={20} /></a>
            <a href="https://twitter.com" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            &copy; 2026 LobsterPad. Built with claws and coffee.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
