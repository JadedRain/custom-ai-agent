import './App.css'
import { showCustomToast } from './components/CustomToast'
import { useState } from 'react';
import { TestQueryErrorButton } from './components/TestQueryErrorButton';
import { ErrorThrower } from './components/ErrorThrower';
import { useAuth } from 'react-oidc-context';

function App() {
  const auth = useAuth();
  const [showError, setShowError] = useState(false);
  const throwError = () => {
    setShowError(true);
  };

  const handleSignIn = () => {
    auth.signinRedirect();
  };

  const handleSignOut = () => {
    auth.signoutRedirect();
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        {!auth.isAuthenticated ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSignIn}>
            Sign In with Keycloak
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-green-500">Welcome, {auth.user?.profile.preferred_username}!</p>
            <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
        <button style={{ marginLeft: '12px' }} onClick={showCustomToast}>
          Show Custom Toast
        </button>
        <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded" onClick={throwError}>
          Throw Error (Test Boundary)
        </button>
      </div>
      <TestQueryErrorButton />
      {showError && <ErrorThrower />}
    </>
  );
}

export default App
