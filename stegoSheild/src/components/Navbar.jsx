import React from 'react';
import { Shield } from 'lucide-react';
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2.5 group"
          id="nav-logo"
        >
          <Shield
            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
            style={{ color: 'var(--gray-100)' }}
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'var(--white)', letterSpacing: '-0.02em' }}
          >
            StegoShield
          </span>
        </button>

        {/* Nav links (signed in) */}
        <SignedIn>
          <nav className="hidden sm:flex items-center gap-2">
            {[
              { key: 'home', label: 'Home' },
              { key: 'demo', label: 'Encrypt' },
              { key: 'recover', label: 'Recover' },
            ].map(({ key, label }) => (
              <button
                key={key}
                id={`nav-${key}`}
                onClick={() => setCurrentPage(key)}
                className="px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                style={{
                  color: currentPage === key ? 'var(--white)' : 'var(--gray-400)',
                  backgroundColor:
                    currentPage === key
                      ? 'rgba(255,255,255,0.08)'
                      : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== key)
                    e.currentTarget.style.color = 'var(--gray-200)';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== key)
                    e.currentTarget.style.color = 'var(--gray-400)';
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </SignedIn>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <ClerkLoading>
            <div
              className="h-8 w-20 rounded-md animate-pulse"
              style={{ backgroundColor: 'var(--gray-800)' }}
            />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignInButton>
                <button
                  id="nav-sign-in"
                  className="text-sm font-semibold rounded-lg transition-all duration-200"
                  style={{
                    padding: '0.5rem 1.5rem',
                    color: 'var(--black)',
                    backgroundColor: 'var(--white)',
                    border: 'none',
                    cursor: 'pointer',
                    lineHeight: '1.4',
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
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
