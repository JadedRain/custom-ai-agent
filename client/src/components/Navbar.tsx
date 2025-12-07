import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import SearchBar from './SearchBar';
import { useAuth } from 'react-oidc-context';
import { FaBars, FaTimes } from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const isHome = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 shadow-md border-b green-bg-medium green-border">
      {/* Desktop Navigation */}
      <div className="hidden md:grid p-4 items-center" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
        <div className="flex gap-4 items-center text-white">
          <Link to="/" className="text-white hover:green-text-light transition-colors">Home</Link>
          {auth.isAuthenticated && (
            <Link to="/draft-planner" className="hover:green-text-light transition-colors">Draft Planner</Link>
          )}
          {auth.isAuthenticated && (
            <Link to="/ai-agent" className="hover:green-text-light transition-colors">AI Agent</Link>
          )}
          <Link to="/pro-players" className="hover:green-text-light transition-colors">Pro Players</Link>
          {auth.isAuthenticated && ((auth.user?.profile as Record<string, unknown>)?.email as string || '').toLowerCase() === 'loganfake@gmail.com' && (
            <Link to="/admin" className="hover:green-text-light transition-colors">Admin</Link>
          )}
          <Link to="/champions" className="hover:green-text-light transition-colors">Champions</Link>
        </div>
        {!isHome && (
          <div className="flex justify-center px-4">
            <div className="w-full max-w-xl">
              <SearchBar compact />
            </div>
          </div>
        )}
        <div className="flex gap-4 items-center justify-end whitespace-nowrap">
          <Link to="/settings" className="hover:green-text-light transition-colors" aria-label="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35A1.724 1.724 0 005.97 7.753c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          {auth.isAuthenticated && <AuthButton />}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white font-semibold text-lg hover:green-text-light transition-colors" onClick={closeMobileMenu}>
            LoL Stats
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:green-text-light transition-colors p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-4 space-y-3 border-t green-border pt-4">
            <Link 
              to="/" 
              className="block text-white hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            {auth.isAuthenticated && (
              <Link 
                to="/draft-planner" 
                className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
                onClick={closeMobileMenu}
              >
                Draft Planner
              </Link>
            )}
            {auth.isAuthenticated && (
              <Link 
                to="/ai-agent" 
                className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
                onClick={closeMobileMenu}
              >
                AI Agent
              </Link>
            )}
            <Link 
              to="/pro-players" 
              className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
              onClick={closeMobileMenu}
            >
              Pro Players
            </Link>
            {auth.isAuthenticated && ((auth.user?.profile as Record<string, unknown>)?.email as string || '').toLowerCase() === 'loganfake@gmail.com' && (
              <Link 
                to="/admin" 
                className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
                onClick={closeMobileMenu}
              >
                Admin
              </Link>
            )}
            <Link 
              to="/champions" 
              className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
              onClick={closeMobileMenu}
            >
              Champions
            </Link>
            <Link 
              to="/settings" 
              className="block hover:green-text-light transition-colors py-2 px-2 rounded hover:bg-neutral-700/30"
              onClick={closeMobileMenu}
            >
              Settings
            </Link>
            {auth.isAuthenticated && (
              <div className="pt-2">
                <AuthButton />
              </div>
            )}
            {!isHome && (
              <div className="pt-2">
                <SearchBar compact />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
