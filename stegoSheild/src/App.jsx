// import React, { useState, useRef } from 'react';
// import { Upload, Shield, Download, CheckCircle, AlertCircle, Loader2, Copy, Moon, Sun, Lock, Zap, Minimize } from 'lucide-react';

// const App = () => {
//   const [darkMode, setDarkMode] = useState(true);
//   const [currentPage, setCurrentPage] = useState('home');
//   const [coverImage, setCoverImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [secretMessage, setSecretMessage] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [processingStep, setProcessingStep] = useState('');
//   const [results, setResults] = useState(null);
//   const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);
//   const [isDragging, setIsDragging] = useState(false);

//   const API_URL = 'http://localhost:5000/api/process';

//   const showNotification = (message, type = 'info') => {
//     setShowToast({ show: true, message, type });
//     setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 4000);
//   };

//   const handleFileSelect = (file) => {
//     if (!file) return;

//     if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
//       showNotification('Please upload a PNG or JPEG image', 'error');
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       showNotification('File size must be under 5MB', 'error');
//       return;
//     }

//     setCoverImage(file);
//     const reader = new FileReader();
//     reader.onloadend = () => setImagePreview(reader.result);
//     reader.readAsDataURL(file);
//     showNotification('Image uploaded successfully', 'success');
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     handleFileSelect(file);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleTextareaChange = (e) => {
//     setSecretMessage(e.target.value.slice(0, 10000));
//   };

//   const handleSubmit = async () => {
//     if (!coverImage || !secretMessage.trim()) {
//       showNotification('Please provide both image and secret message', 'error');
//       return;
//     }

//     setIsProcessing(true);
//     setProcessingStep('Encrypting with AES-256...');

//     const formData = new FormData();
//     formData.append('image', coverImage);
//     formData.append('payload', secretMessage);

//     try {
//       setTimeout(() => setProcessingStep('Embedding using Inverted LSB...'), 1000);
//       setTimeout(() => setProcessingStep('Compressing to WebP...'), 2000);

//       const response = await fetch(API_URL, {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'Processing failed');
//       }

//       const data = await response.json();
//       setResults(data);
//       setCurrentPage('results');
//       showNotification('Processing complete!', 'success');
//     } catch (error) {
//       showNotification(
//         error.message || 'Processing failed. Make sure Flask backend is running.',
//         'error'
//       );
//     } finally {
//       setIsProcessing(false);
//       setProcessingStep('');
//     }
//   };

//   const copyResults = () => {
//     const text = `
// StegoShield Results:
// PNG PSNR: ${results?.psnr || 'N/A'} dB
// WebP PSNR: ${results?.psnr || 'N/A'} dB
// MSE: ${results?.mse || 'N/A'}
// PNG Size: ${results?.size_png || 'N/A'}
// WebP Size: ${results?.size_webp || 'N/A'}
// Savings: ${results?.savings || 'N/A'}
// Detection Rate: ${results?.detection || '0.00%'}
//     `.trim();
//     navigator.clipboard.writeText(text);
//     showNotification('Results copied to clipboard!', 'success');
//   };

//   const resetApp = () => {
//     setCoverImage(null);
//     setImagePreview(null);
//     setSecretMessage('');
//     setResults(null);
//     setCurrentPage('home');
//   };

//   const Toast = () => {
//     if (!showToast.show) return null;
//     const colors = {
//       success: 'bg-green-500',
//       error: 'bg-red-500',
//       info: 'bg-blue-500'
//     };
//     return (
//       <div className={`fixed top-4 right-4 ${colors[showToast.type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slideIn`}>
//         {showToast.type === 'success' && <CheckCircle size={20} />}
//         {showToast.type === 'error' && <AlertCircle size={20} />}
//         <span>{showToast.message}</span>
//       </div>
//     );
//   };

//   const HomePage = () => (
//     <div className="min-h-screen flex flex-col">
//       <header className="container mx-auto px-4 py-6 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <Shield className="w-8 h-8 text-blue-500" />
//           <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
//             StegoShield
//           </span>
//         </div>
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
//         >
//           {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </header>

//       <main className="grow container mx-auto px-4 py-12">
//         <div className="max-w-4xl mx-auto text-center space-y-8">
//           <div className="space-y-4">
//             <h1 className="text-5xl md:text-7xl font-bold leading-tight">
//               Military-Grade
//               <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
//                 Steganography
//               </span>
//             </h1>
//             <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
//               Hide secrets in plain sight with undetectable, lossless encryption
//             </p>
//           </div>

//           <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-green-500/30">
//               <CheckCircle className="text-green-500" size={18} />
//               <span>0% Detection</span>
//             </div>
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-blue-500/30">
//               <Zap className="text-blue-500" size={18} />
//               <span>61+ dB PSNR even at 10KB payload</span>
//             </div>
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-purple-500/30">
//               <Lock className="text-purple-500" size={18} />
//               <span>99.6% Avalanche</span>
//             </div>
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-pink-500/30">
//               <Minimize className="text-pink-500" size={18} />
//               <span>35-40% Smaller Files</span>
//             </div>
//           </div>

//           <button
//             onClick={() => setCurrentPage('demo')}
//             className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
//           >
//             <Shield className="inline-block mr-2" size={24} />
//             Shield It Now
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition" />
//           </button>

//           <div className="grid md:grid-cols-4 gap-6 mt-16">
//             <StatCard title="PSNR" value="70.46 dB" subtitle="Peak Signal Quality" color="blue" />
//             <StatCard title="Detection" value="0.00%" subtitle="StegExpose Safe" color="green" />
//             <StatCard title="Compression" value="40.9%" subtitle="File Size Reduction" color="purple" />
//             <StatCard title="Avalanche" value="99.6%" subtitle="Encryption Strength" color="pink" />
//           </div>
//         </div>
//       </main>

//       <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-500">
//         <p>Made with ❤️ by Hansuja</p>
//       </footer>
//     </div>
//   );

//   const DemoPage = () => (
//     <div className="min-h-screen py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
//         <button
//           onClick={() => setCurrentPage('home')}
//           className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
//         >
//           ← Back to Home
//         </button>

//         <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700">
//           <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
//             <Shield className="text-blue-500" />
//             Encrypt & Embed
//           </h2>
//           <p className="text-gray-400 mb-8">Upload your cover image and enter your secret message</p>

//           <div className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium mb-3">Cover Image</label>
//               <div
//                 onDrop={handleDrop}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 className={`border-2 border-dashed rounded-xl p-8 transition ${
//                   isDragging
//                     ? 'border-blue-500 bg-blue-500/10'
//                     : 'border-gray-600 hover:border-gray-500'
//                 }`}
//               >
//                 {imagePreview ? (
//                   <div className="flex flex-col items-center gap-4">
//                     <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
//                     <button
//                       onClick={() => fileInputRef.current?.click()}
//                       className="text-sm text-blue-400 hover:text-blue-300"
//                     >
//                       Change Image
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center">
//                     <Upload className="mx-auto mb-4 text-gray-500" size={48} />
//                     <p className="text-gray-400 mb-2">Drag & drop your image here</p>
//                     <p className="text-sm text-gray-500 mb-4">or</p>
//                     <button
//                       onClick={() => fileInputRef.current?.click()}
//                       className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
//                     >
//                       Browse Files
//                     </button>
//                     <p className="text-xs text-gray-500 mt-3">PNG, JPG, JPEG • Max 5MB</p>
//                   </div>
//                 )}
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".png,.jpg,.jpeg"
//                   onChange={(e) => handleFileSelect(e.target.files[0])}
//                   className="hidden"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-3">
//                 Secret Message
//                 <span className="float-right text-gray-500">
//                   {secretMessage.length} / 10000
//                 </span>
//               </label>
//               <textarea
//                 ref={textareaRef}
//                 value={secretMessage}
//                 onChange={handleTextareaChange}
//                 placeholder="Enter your secret message here..."
//                 className="w-full h-40 bg-gray-900 border border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 maxLength={10000}
//                 style={{ scrollBehavior: 'auto' }}
//                 onFocus={(e) => {
//                   // Prevent scroll on focus
//                   e.preventDefault();
//                 }}
//               />
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={!coverImage || !secretMessage.trim() || isProcessing}
//               className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader2 className="animate-spin" size={24} />
//                   {processingStep}
//                 </>
//               ) : (
//                 <>
//                   <Lock size={24} />
//                   Encrypt & Embed
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const ResultsPage = () => (
//     <div className="min-h-screen py-8">
//       <div className="container mx-auto px-4 max-w-5xl">
//         <div className="text-center mb-8 animate-fadeIn">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
//             <CheckCircle className="text-green-500" size={48} />
//           </div>
//           <h2 className="text-4xl font-bold mb-2">Success!</h2>
//           <p className="text-gray-400">Your data has been securely embedded</p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mb-8">
//           <a
//             href={results?.png_url}
//             download="stego_output.png"
//             className="flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
//           >
//             <Download size={24} />
//             Download Stego PNG
//           </a>
//           <a
//             href={results?.webp_url}
//             download="stego_output.webp"
//             className="flex items-center justify-center gap-3 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
//           >
//             <Download size={24} />
//             Download Stego WebP (Lossless)
//           </a>
//         </div>

//         <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700 mb-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-2xl font-bold">Performance Metrics</h3>
//             <button
//               onClick={copyResults}
//               className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
//             >
//               <Copy size={18} />
//               Copy Results
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-700">
//                   <th className="text-left py-3 px-4 font-semibold">Metric</th>
//                   <th className="text-right py-3 px-4 font-semibold">PNG Value</th>
//                   <th className="text-right py-3 px-4 font-semibold">WebP Value</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-700">
//                 <tr>
//                   <td className="py-3 px-4 text-gray-300">PSNR</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.psnr || 'N/A'} dB</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.psnr || 'N/A'} dB</td>
//                 </tr>
//                 <tr>
//                   <td className="py-3 px-4 text-gray-300">MSE</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.mse || 'N/A'}</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.mse || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-3 px-4 text-gray-300">File Size</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.size_png || 'N/A'}</td>
//                   <td className="py-3 px-4 text-right font-mono">{results?.size_webp || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-3 px-4 text-gray-300">Compression Savings</td>
//                   <td className="py-3 px-4 text-right text-gray-500">—</td>
//                   <td className="py-3 px-4 text-right font-mono text-green-400">{results?.savings || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-3 px-4 text-gray-300">StegExpose Detection</td>
//                   <td className="py-3 px-4 text-right font-mono text-green-400">{results?.detection || '0.00%'} (Safe)</td>
//                   <td className="py-3 px-4 text-right text-gray-500">—</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
//             <p className="text-sm text-blue-300">
//               💎 WebP is 100% lossless – zero quality loss with superior compression
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={resetApp}
//           className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition"
//         >
//           Process Another Image
//         </button>
//       </div>
//     </div>
//   );

//   const StatCard = ({ title, value, subtitle, color }) => {
//     const colors = {
//       blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
//       green: 'from-green-500/20 to-green-600/20 border-green-500/30',
//       purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
//       pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30'
//     };
//     return (
//       <div className={`p-6 rounded-xl bg-gradient-to-br ${colors[color]} border backdrop-blur`}>
//         <div className="text-3xl font-bold mb-1">{value}</div>
//         <div className="text-sm font-semibold text-gray-300 mb-1">{title}</div>
//         <div className="text-xs text-gray-500">{subtitle}</div>
//       </div>
//     );
//   };

//   return (
//     <div className={darkMode ? 'dark' : ''}>
//       <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
//         <Toast />
//         {currentPage === 'home' && <HomePage />}
//         {currentPage === 'demo' && <DemoPage />}
//         {currentPage === 'results' && <ResultsPage />}
//       </div>
//       <style>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-slideIn { animation: slideIn 0.3s ease-out; }
//         .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        
//         /* Prevent scroll-to-top on textarea focus */
//         textarea:focus {
//           scroll-margin-bottom: 0;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default App;

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Shield, Download, CheckCircle, AlertCircle, Loader2, Copy, Moon, Sun, Lock, Zap, Minimize } from 'lucide-react';

const App = () => {
  const [darkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [results, setResults] = useState(null);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const API_URL = 'http://localhost:5000/api/process';

  const showNotification = (message, type = 'info') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showNotification('Please upload a PNG or JPEG image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be under 5MB', 'error');
      return;
    }

    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    showNotification('Image uploaded successfully', 'success');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleTextareaChange = (e) => {
    setSecretMessage(e.target.value.slice(0, 10000));
  };

  // FIXED: Prevent page scroll jump when typing in textarea
  useEffect(() => {
    const preventScrollOnArrowKeys = (e) => {
      if (e.target === textareaRef.current && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventScrollOnArrowKeys);
    return () => document.removeEventListener('keydown', preventScrollOnArrowKeys);
  }, []);

  const handleSubmit = async () => {
    if (!coverImage || !secretMessage.trim()) {
      showNotification('Please provide both image and secret message', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Encrypting with AES-256...');

    const formData = new FormData();
    formData.append('image', coverImage);
    formData.append('payload', secretMessage);

    try {
      setTimeout(() => setProcessingStep('Embedding using Inverted LSB...'), 1000);
      setTimeout(() => setProcessingStep('Compressing to WebP...'), 2000);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Processing failed');

      setResults(data);
      setCurrentPage('results');
      showNotification('Secret embedded successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to connect to backend', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const copyResults = () => {
    const text = `
StegoShield Results:
PNG PSNR: ${results?.psnr_png || 'N/A'} dB
WebP PSNR: ${results?.psnr_webp || 'N/A'} dB
PNG Size: ${results?.size_png || 'N/A'}
WebP Size: ${results?.size_webp || 'N/A'}
Savings: ${results?.savings || 'N/A'}%
Detection: ${results?.detection || '0.00'}%
    `.trim();
    navigator.clipboard.writeText(text);
    showNotification('Results copied!', 'success');
  };

  const resetApp = () => {
    setCoverImage(null);
    setImagePreview(null);
    setSecretMessage('');
    setResults(null);
    setCurrentPage('home');
  };

  const Toast = () => {
    if (!showToast.show) return null;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
    return (
      <div className={`fixed top-4 right-4 ${colors[showToast.type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slideIn`}>
        {showToast.type === 'success' && <CheckCircle size={20} />}
        {showToast.type === 'error' && <AlertCircle size={20} />}
        <span>{showToast.message}</span>
      </div>
    );
  };

  const HomePage = () => (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            StegoShield
          </span>
        </div>
      </header>

      <main className="grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Military-Grade
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Steganography
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Hide secrets in plain sight with undetectable, lossless encryption
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('demo')}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <Shield className="inline-block mr-2" size={24} />
            Shield It Now
          </button>
        </div>
      </main>
    </div>
  );

  const DemoPage = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button onClick={() => setCurrentPage('home')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
          ← Back to Home
        </button>

        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="text-blue-500" />
            Encrypt & Embed
          </h2>
          <p className="text-gray-400 mb-8">Upload your cover image and enter your secret message</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Cover Image</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 transition ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                    <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-400 hover:text-blue-300">
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-4 text-gray-500" size={48} />
                    <p className="text-gray-400 mb-2">Drag & drop your image here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 mt-3">PNG, JPG, JPEG • Max 5MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Secret Message
                <span className="float-right text-gray-500">{secretMessage.length} / 10000</span>
              </label>
              <textarea
                ref={textareaRef}
                value={secretMessage}
                onChange={handleTextareaChange}
                placeholder="Enter your secret message here..."
                className="w-full h-40 bg-gray-900 border border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                maxLength={10000}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!coverImage || !secretMessage.trim() || isProcessing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {processingStep}
                </>
              ) : (
                <>
                  <Lock size={24} />
                  Encrypt & Embed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsPage = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="text-4xl font-bold mb-2">Success!</h2>
          <p className="text-gray-400">Your secret is now hidden and ready to download</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <a href={results?.png_base64} download="stego_output.png" className="flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition">
            <Download size={24} /> Download PNG
          </a>
          <a href={results?.webp_base64} download="stego_output.webp" className="flex items-center justify-center gap-3 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition">
            <Download size={24} /> Download WebP (Recommended)
          </a>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Results</h3>
            <button onClick={copyResults} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <Copy size={18} /> Copy
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">PSNR (PNG):</span> <span className="font-mono text-green-400">{results?.psnr_png} dB</span></div>
            <div className="flex justify-between"><span className="text-gray-400">PSNR (WebP):</span> <span className="font-mono text-green-400">{results?.psnr_webp} dB</span></div>
            <div className="flex justify-between"><span className="text-gray-400">File Size (PNG):</span> <span className="font-mono">{results?.size_png}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">File Size (WebP):</span> <span className="font-mono text-purple-400">{results?.size_webp}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Savings:</span> <span className="font-mono text-green-400">{results?.savings}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">StegExpose Detection:</span> <span className="font-mono text-green-400">{results?.detection}%</span></div>
          </div>
        </div>

        <button onClick={resetApp} className="w-full mt-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition">
          Hide Another Message
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      <Toast />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'demo' && <DemoPage />}
      {currentPage === 'results' && <ResultsPage />}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default App;