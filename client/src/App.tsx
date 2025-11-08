import './App.css'
import { showCustomToast } from './components/CustomToast'
import { useState } from 'react';
import { TestQueryErrorButton } from './components/TestQueryErrorButton';
import { ErrorThrower } from './components/ErrorThrower';
import { useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';

function HomePage() {
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

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 p-4 mb-4">
        <div className="flex gap-4">
          <Link to="/" className="text-white hover:text-blue-400">Home</Link>
          <Link to="/player" className="text-white hover:text-blue-400">Player Lookup</Link>
          <Link to="/settings" className="text-white hover:text-blue-400">Settings</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
