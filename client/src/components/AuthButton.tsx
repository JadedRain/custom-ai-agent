import React from 'react';
import { useAuth } from 'react-oidc-context';
import '../styles/AuthButton.css';


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
        className={"px-4 py-2 rounded w-fit text-white font-semibold transition-colors authBtnBg "}
        onClick={handleSignIn}
      >
        Sign In with Keycloak
      </button>
    );
  }

  return (
    <button
      className={"px-4 py-2 rounded w-fit text-white font-semibold transition-colors authBtnBg "}
      onClick={handleSignOut}
    >
      Sign Out
    </button>
  );
};
