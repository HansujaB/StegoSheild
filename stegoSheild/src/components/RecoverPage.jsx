import React, { useRef, useState } from 'react';
import { Upload, KeyRound, ArrowLeft } from 'lucide-react';

const RecoverPage = ({
  recoveryImage,
  recoveryPreview,
  recoveredText,
  onFileSelect,
  onRecover,
  onBack,
}) => {
  const fileInputRef = useRef(null);

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
        {/* Back */}
        <button
          id="recover-back"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--gray-500)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = 'var(--gray-500)')
          }
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--white)',
              marginBottom: '0.5rem',
            }}
          >
            Recover Secret
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Upload a stego image created with your account to extract the hidden
            message.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0.75rem',
            padding: '2rem',
          }}
        >
          {/* File upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--gray-400)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.75rem',
              }}
            >
              Stego Image
            </label>
            <div
              id="recover-dropzone"
              style={{
                border: '1.5px dashed rgba(255,255,255,0.1)',
                borderRadius: '0.625rem',
                padding: recoveryPreview ? '1.25rem' : '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')
              }
            >
              {recoveryPreview ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <img
                    src={recoveryPreview}
                    alt="Stego preview"
                    style={{
                      maxHeight: '160px',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--gray-500)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {recoveryImage?.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-400)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      paddingBottom: '1px',
                    }}
                  >
                    Change image
                  </span>
                </div>
              ) : (
                <>
                  <Upload
                    size={32}
                    style={{
                      color: 'var(--gray-600)',
                      marginBottom: '0.75rem',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--gray-400)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Click to select stego image
                  </p>
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--gray-600)',
                    }}
                  >
                    PNG, JPG, JPEG, WebP
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) => onFileSelect(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Recover button */}
          <button
            id="recover-submit"
            onClick={onRecover}
            disabled={!recoveryImage}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: !recoveryImage
                ? 'var(--gray-800)'
                : 'var(--white)',
              color: !recoveryImage ? 'var(--gray-600)' : 'var(--black)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: !recoveryImage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--gray-200)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--white)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <KeyRound size={16} />
            Recover Secret
          </button>

          {/* Recovered message */}
          {recoveredText && (
            <div
              className="animate-fade-in-up"
              style={{ marginTop: '1.5rem' }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.75rem',
                }}
              >
                Recovered Message
              </label>
              <div
                id="recovered-message"
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem',
                  color: 'var(--gray-100)',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {recoveredText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPage;
