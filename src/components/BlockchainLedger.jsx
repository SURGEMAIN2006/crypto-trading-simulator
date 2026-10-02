import React, { useState } from 'react';
import { Cpu, Hash, FileCode, CheckCircle } from 'lucide-react';
import { generateTxHash } from '../services/cryptoEngine';

export default function BlockchainLedger({ blocks, transactions }) {
  const [hashInput, setHashInput] = useState('Transaction Payload Data');
  const [computedHash, setComputedHash] = useState(() => generateTxHash());
  const [selectedBlock, setSelectedBlock] = useState(null);

  const handleComputeHash = (text) => {
    setHashInput(text);
    let hash = '0x';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 64; i++) {
      const charCode = (text.charCodeAt(i % text.length) || 0) + i * 7;
      hash += chars[charCode % chars.length];
    }
    setComputedHash(hash);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
      
      {/* Interactive Cryptographic Hashing Calculator Widget */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.9) 0%, rgba(10, 14, 23, 0.9) 100%)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <Hash size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Hash Preview</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Input:
            </label>
            <textarea
              rows={3}
              value={hashInput}
              onChange={(e) => handleComputeHash(e.target.value)}
              className="mono"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Hash Output:
            </label>
            <div className="mono" style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(0, 229, 255, 0.08)', border: '1px solid var(--border-glow)', color: 'var(--accent-cyan)', fontSize: '0.85rem', wordBreak: 'break-all', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
              {computedHash}
            </div>
          </div>
        </div>
      </div>

      {/* Mined Blocks Chain View */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={20} color="var(--accent-purple)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Blockchain Ledger & Mined Blocks</h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Consensus: Proof-of-Stake
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {blocks.map((block) => (
            <div
              key={block.blockIndex}
              onClick={() => setSelectedBlock(block)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'grid',
                gridTemplateColumns: '120px 1fr 180px',
                alignItems: 'center',
                gap: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Block Height</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  #{block.blockIndex}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{block.timestamp}</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <Hash size={14} color="var(--text-muted)" />
                  <span className="mono" style={{ color: '#fff', fontSize: '0.8rem' }}>
                    {block.hash.slice(0, 20)}...{block.hash.slice(-12)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Prev Hash: <span className="mono">{block.prevHash.slice(0, 16)}...</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-green" style={{ marginBottom: '0.3rem' }}>
                  <CheckCircle size={10} /> {block.status}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {block.transactionsCount} Txns | Gas: {block.gasUsed}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)' }}>{block.validator}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Explorer Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <FileCode size={20} color="var(--accent-green)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ledger Transaction History</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.6rem' }}>Tx Hash</th>
                <th style={{ padding: '0.6rem' }}>Type</th>
                <th style={{ padding: '0.6rem' }}>Asset</th>
                <th style={{ padding: '0.6rem' }}>Amount</th>
                <th style={{ padding: '0.6rem' }}>Price</th>
                <th style={{ padding: '0.6rem' }}>Total USD</th>
                <th style={{ padding: '0.6rem' }}>Timestamp</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="mono" style={{ padding: '0.75rem 0.6rem', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                    {tx.txHash.slice(0, 12)}...{tx.txHash.slice(-8)}
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <span className={`badge ${tx.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem', fontWeight: 700 }}>{tx.symbol}</td>
                  <td className="mono" style={{ padding: '0.75rem 0.6rem' }}>{tx.amount}</td>
                  <td className="mono" style={{ padding: '0.75rem 0.6rem' }}>${tx.price.toFixed(2)}</td>
                  <td className="mono" style={{ padding: '0.75rem 0.6rem', fontWeight: 700 }}>${tx.totalUSD.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.timestamp}</td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                    <span className="badge badge-purple">CONFIRMED</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
