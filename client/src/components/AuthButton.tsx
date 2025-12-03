import React from 'react';
import { useAuth } from 'react-oidc-context';

export const AuthButton: React.FC = () => {
  const auth = useAuth();

  const handleSignIn = () => {
    auth.signinRedirect();
  };

  const handleSignOut = () => {
    auth.signoutRedirect();
  };

  if (!auth.isAuthenticated) {
    return (
      <button
        className="px-4 py-2 rounded w-fit text-white font-semibold transition-colors shadow-md"
        style={{ backgroundColor: 'hsl(153, 60%, 35%)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(152, 55%, 45%)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(153, 60%, 35%)'}
        onClick={handleSignIn}
      >
        Sign In with Keycloak
      </button>
    );
  }

  return (
    <button
      className="px-4 py-2 rounded w-fit text-white font-semibold transition-colors shadow-md"
      style={{ backgroundColor: 'hsl(153, 60%, 35%)' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(152, 55%, 45%)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(153, 60%, 35%)'}
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  );
};
