import React from 'react';
import { Shield, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

const STATS = [
  { value: '61+ dB', label: 'PSNR' },
  { value: '0%', label: 'Detection' },
  { value: '99.6%', label: 'Avalanche' },
  { value: '35-40%', label: 'Compression' },
];

const PIPELINE = [
  {
    step: '01',
    title: 'AES-128-CBC',
    desc: 'Symmetric encryption with 128-bit key and PKCS7 padding',
  },
  {
    step: '02',
    title: 'ECC Key Exchange',
    desc: 'ECIES via SECP256R1 with HKDF-SHA256 derived keys',
  },
  {
    step: '03',
    title: 'Inverted LSB',
    desc: 'Random ±1 pixel matching across RGB channels',
  },
  {
    step: '04',
    title: 'WebP Lossless',
    desc: '100% payload recovery with 35-40% size reduction',
  },
];

const HomePage = ({ setCurrentPage }) => {
  return (
    <div
      className="noise-bg"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Hero ──────────────────────────────────────── */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '8rem 1.5rem 4rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          className="animate-fade-in-up"
          style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}
        >
          {/* Badge */}
          <a
            href="https://ieeexplore.ieee.org/document/11496298"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: 'var(--gray-400)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'var(--white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--gray-400)';
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block',
              }}
            />
            WcCST 2026 · IEEE Xplore ↗
          </a>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: 'var(--white)',
              marginBottom: '1.25rem',
            }}
          >
            Steganography
            <br />
            <span style={{ color: 'var(--gray-400)' }}>meets cryptography.</span>
          </h1>

          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              color: 'var(--gray-500)',
              maxWidth: '540px',
              margin: '0 auto 2.5rem',
            }}
          >
            AES-128-CBC encryption, ECC key exchange, inverted LSB embedding,
            and lossless WebP compression — unified in one framework.
          </p>

          {/* CTAs */}
          <SignedIn>
            <div
              className="stagger"
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                id="cta-encrypt"
                onClick={() => setCurrentPage('demo')}
                className="animate-fade-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.8125rem 1.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: 'var(--white)',
                  color: 'var(--black)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-200)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--white)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Lock size={16} />
                Encrypt & Embed
                <ArrowRight size={14} />
              </button>
              <button
                id="cta-recover"
                onClick={() => setCurrentPage('recover')}
                className="animate-fade-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.8125rem 1.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: 'transparent',
                  color: 'var(--gray-300)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = 'var(--white)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = 'var(--gray-300)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <KeyRound size={16} />
                Recover Secret
              </button>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button
                id="cta-sign-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.8125rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: 'var(--white)',
                  color: 'var(--black)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-200)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--white)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign in to get started
                <ArrowRight size={14} />
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div
          className="stagger"
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
          }}
        >
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="animate-fade-in"
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--white)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--gray-500)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '0.25rem',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pipeline ───────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            className="animate-fade-in-up"
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '2.5rem',
            }}
          >
            Encryption Pipeline
          </h2>

          <div
            className="stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {PIPELINE.map(({ step, title, desc }) => (
              <div
                key={step}
                className="animate-fade-in"
                style={{
                  padding: '1.75rem',
                  backgroundColor: 'var(--black)',
                  transition: 'background-color 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--black)';
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--gray-600)',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '0.625rem',
                  }}
                >
                  {step}
                </span>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--gray-100)',
                    marginBottom: '0.375rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    color: 'var(--gray-500)',
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
