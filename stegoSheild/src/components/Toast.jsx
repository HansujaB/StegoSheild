import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ show, message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) return;
    const exitTimer = setTimeout(() => setIsExiting(true), 3500);
    const closeTimer = setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 3800);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [show, onClose]);

  if (!show) return null;

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />,
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--gray-400)',
  };

  return (
    <div
      className={isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--gray-900)',
        border: `1px solid ${colors[type] || colors.info}33`,
        color: 'var(--gray-100)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
      }}
    >
      <span style={{ color: colors[type] || colors.info, flexShrink: 0 }}>
        {icons[type] || icons.info}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
