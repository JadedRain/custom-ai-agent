import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import SearchBar from './SearchBar';
import { useAuth } from 'react-oidc-context';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar-bg w-full fixed top-0 left-0 z-50 p-4 flex justify-between items-center shadow-md">
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-white hover:text-primary-100">Home</Link>
        <Link to="/draft-planner" className="hover:text-primary-100">Draft Planner</Link>
        {auth.isAuthenticated && ((auth.user?.profile as Record<string, unknown>)?.email as string || '').toLowerCase() === 'loganfake@gmail.com' && (
          <Link to="/admin" className="hover:text-primary-100">Admin</Link>
        )}
      </div>
      {!isHome && (
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xl">
            <SearchBar compact />
          </div>
        </div>
      )}
      <div className="flex gap-4 items-center">
        <Link to="/settings" className="hover:text-primary-100" aria-label="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35A1.724 1.724 0 005.97 7.753c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        {auth.isAuthenticated && <AuthButton />}
      </div>
    </nav>
  );
};
