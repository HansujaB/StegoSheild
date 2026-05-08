import React, { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { SignedIn } from '@clerk/clerk-react';
import { useApi } from './api';

import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import EncryptPage from './components/EncryptPage';
import ResultsPage from './components/ResultsPage';
import RecoverPage from './components/RecoverPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // Encrypt state
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [results, setResults] = useState(null);

  // Recover state
  const [recoveryImage, setRecoveryImage] = useState(null);
  const [recoveryPreview, setRecoveryPreview] = useState(null);
  const [recoveredText, setRecoveredText] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const { isLoaded, isSignedIn } = useAuth();
  const { callApi } = useApi();

  const showNotification = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: '' });
  }, []);

  // ── File handlers ──────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showNotification('Please upload a PNG or JPEG image', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be under 5 MB', 'error');
      return;
    }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    showNotification('Image uploaded', 'success');
  };

  const handleRecoveryFileSelect = (file) => {
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(
        file.type
      )
    ) {
      showNotification('Please upload a PNG, JPEG, or WebP image', 'error');
      return;
    }
    setRecoveryImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setRecoveryPreview(reader.result);
    reader.readAsDataURL(file);
    setRecoveredText('');
    showNotification('Stego image selected', 'success');
  };

  // ── Submit handler ─────────────────────────────────
  const handleSubmit = async () => {
    if (!coverImage || !secretMessage.trim()) {
      showNotification('Provide both an image and a message', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Encrypting with AES-128-CBC...');

    const formData = new FormData();
    formData.append('image', coverImage);
    formData.append('payload', secretMessage);

    try {
      setTimeout(() => setProcessingStep('Embedding via inverted LSB...'), 1000);
      setTimeout(() => setProcessingStep('Compressing to lossless WebP...'), 2000);

      const data = await callApi('/api/process', {
        method: 'POST',
        body: formData,
      });

      setResults(data);
      setCurrentPage('results');
      showNotification('Secret embedded successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to connect to backend', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // ── Recovery handler ───────────────────────────────
  const handleRecover = async () => {
    if (!recoveryImage) {
      showNotification('Upload a stego image first', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('image', recoveryImage);
    try {
      const data = await callApi('/api/recover', {
        method: 'POST',
        body: formData,
      });
      setRecoveredText(data.message || '');
      showNotification('Message recovered successfully', 'success');
    } catch (error) {
      showNotification(
        error.message || 'Failed to recover message',
        'error'
      );
    }
  };

  // ── Reset ──────────────────────────────────────────
  const resetApp = () => {
    setCoverImage(null);
    setImagePreview(null);
    setSecretMessage('');
    setResults(null);
    setCurrentPage('home');
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div style={{ backgroundColor: 'var(--black)', color: 'var(--gray-100)', minHeight: '100vh' }}>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}

      {currentPage === 'demo' && (
        <SignedIn>
          <EncryptPage
            coverImage={coverImage}
            imagePreview={imagePreview}
            secretMessage={secretMessage}
            isProcessing={isProcessing}
            processingStep={processingStep}
            onFileSelect={handleFileSelect}
            onTextChange={setSecretMessage}
            onSubmit={handleSubmit}
            onBack={() => setCurrentPage('home')}
          />
        </SignedIn>
      )}

      {currentPage === 'results' && (
        <SignedIn>
          <ResultsPage
            results={results}
            onReset={resetApp}
            showNotification={showNotification}
          />
        </SignedIn>
      )}

      {currentPage === 'recover' && (
        <SignedIn>
          <RecoverPage
            recoveryImage={recoveryImage}
            recoveryPreview={recoveryPreview}
            recoveredText={recoveredText}
            onFileSelect={handleRecoveryFileSelect}
            onRecover={handleRecover}
            onBack={() => setCurrentPage('home')}
          />
        </SignedIn>
      )}

      <Footer />
    </div>
  );
};

export default App;