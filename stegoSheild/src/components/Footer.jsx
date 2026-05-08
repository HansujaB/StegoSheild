import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--gray-600)',
        fontSize: '0.75rem',
        fontWeight: 400,
        letterSpacing: '0.03em',
      }}
    >
      <p>
        Built by{' '}
        <a
          href="https://github.com/HansujaB"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--gray-400)',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--white)';
            e.currentTarget.style.borderBottomColor = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--gray-400)';
            e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)';
          }}
        >
          Hansuja
        </a>{' '}
        ·{' '}
        <a
          href="https://ieeexplore.ieee.org/document/11496298"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--gray-400)',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--white)';
            e.currentTarget.style.borderBottomColor = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--gray-400)';
            e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)';
          }}
        >
          IEEE Xplore
        </a>{' '}
        · WcCST 2026
      </p>
    </footer>
  );
};

export default Footer;
