import React from 'react';
import { Download, Copy, ArrowLeft, CheckCircle } from 'lucide-react';

const MetricRow = ({ label, value, mono = false, accent = false }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    <span
      style={{
        fontSize: '0.8125rem',
        color: 'var(--gray-500)',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: accent ? 'var(--white)' : 'var(--gray-300)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      }}
    >
      {value}
    </span>
  </div>
);

const ResultsPage = ({ results, onReset, showNotification }) => {
  const copyResults = () => {
    const text = [
      `StegoShield Results`,
      `PSNR (PNG): ${results?.psnr_png || 'N/A'} dB`,
      `PSNR (WebP): ${results?.psnr_webp || 'N/A'} dB`,
      `Size (PNG): ${results?.size_png || 'N/A'}`,
      `Size (WebP): ${results?.size_webp || 'N/A'}`,
      `Savings: ${results?.savings || 'N/A'}%`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    showNotification('Results copied to clipboard', 'success');
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '100vh',
        padding: '6rem 1.5rem 3rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Success header */}
        <div
          className="animate-fade-in-up"
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '2px solid rgba(34,197,94,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--white)',
              marginBottom: '0.375rem',
            }}
          >
            Embedding complete
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Your secret has been encrypted and hidden in the image.
          </p>
        </div>

        {/* Download buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <a
            id="download-png"
            href={results?.png_base64}
            download="stego_output.png"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'transparent',
              color: 'var(--gray-300)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.color = 'var(--white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'var(--gray-300)';
            }}
          >
            <Download size={15} />
            Download PNG
          </a>
          <a
            id="download-webp"
            href={results?.webp_base64}
            download="stego_output.webp"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'var(--white)',
              color: 'var(--black)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
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
            <Download size={15} />
            WebP (Recommended)
          </a>
        </div>

        {/* Metrics card */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0.75rem',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--gray-400)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Quality Metrics
            </h2>
            <button
              id="copy-results"
              onClick={copyResults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--gray-500)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--white)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--gray-500)')
              }
            >
              <Copy size={12} />
              Copy
            </button>
          </div>

          <MetricRow
            label="PSNR (PNG)"
            value={`${results?.psnr_png} dB`}
            mono
            accent
          />
          <MetricRow
            label="PSNR (WebP)"
            value={`${results?.psnr_webp} dB`}
            mono
            accent
          />
          <MetricRow
            label="File Size (PNG)"
            value={results?.size_png}
            mono
          />
          <MetricRow
            label="File Size (WebP)"
            value={results?.size_webp}
            mono
          />
          <MetricRow
            label="Compression Savings"
            value={`${results?.savings}%`}
            mono
            accent
          />
        </div>

        {/* Reset */}
        <button
          id="results-reset"
          onClick={onReset}
          style={{
            width: '100%',
            padding: '0.8125rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'transparent',
            color: 'var(--gray-400)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
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
          Embed another message
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
