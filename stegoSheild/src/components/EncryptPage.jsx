import React, { useRef, useState } from 'react';
import { Upload, Lock, Loader2, ArrowLeft } from 'lucide-react';

const EncryptPage = ({
  coverImage,
  imagePreview,
  secretMessage,
  isProcessing,
  processingStep,
  onFileSelect,
  onTextChange,
  onSubmit,
  onBack,
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleTextareaChange = (e) => {
    const val = e.target.value.slice(0, 10000);
    onTextChange(val);
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
        {/* Back */}
        <button
          id="encrypt-back"
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
            Encrypt & Embed
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Upload a cover image and enter the secret message to hide.
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
          {/* Image Upload */}
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
              Cover Image
            </label>
            <div
              id="encrypt-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `1.5px dashed ${
                  isDragging
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.1)'
                }`,
                borderRadius: '0.625rem',
                padding: imagePreview ? '1.25rem' : '2.5rem 1.5rem',
                textAlign: 'center',
                transition: 'border-color 0.2s, background-color 0.2s',
                backgroundColor: isDragging
                  ? 'rgba(255,255,255,0.02)'
                  : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    style={{
                      maxHeight: '160px',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-400)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      paddingBottom: '1px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'var(--white)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--gray-400)')
                    }
                  >
                    Change image
                  </button>
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
                    Drag & drop or click to browse
                  </p>
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--gray-600)',
                    }}
                  >
                    PNG, JPG, JPEG · Max 5 MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => onFileSelect(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Secret Message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.75rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Secret Message
              </label>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--gray-600)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {secretMessage.length} / 10,000
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="encrypt-message"
              value={secretMessage}
              onChange={handleTextareaChange}
              placeholder="Enter the message you want to hide..."
              maxLength={10000}
              autoComplete="off"
              spellCheck="false"
              style={{
                width: '100%',
                minHeight: '140px',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem',
                color: 'var(--gray-100)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>

          {/* Submit */}
          <button
            id="encrypt-submit"
            onClick={onSubmit}
            disabled={!coverImage || !secretMessage.trim() || isProcessing}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor:
                !coverImage || !secretMessage.trim() || isProcessing
                  ? 'var(--gray-800)'
                  : 'var(--white)',
              color:
                !coverImage || !secretMessage.trim() || isProcessing
                  ? 'var(--gray-600)'
                  : 'var(--black)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor:
                !coverImage || !secretMessage.trim() || isProcessing
                  ? 'not-allowed'
                  : 'pointer',
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
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{processingStep}</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Encrypt & Embed</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncryptPage;
