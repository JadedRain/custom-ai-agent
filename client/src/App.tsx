import './App.css'
import { useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';
import DraftPlannerPage from './pages/DraftPlannerPage';
import { AuthButton } from './components/AuthButton';
import { Navbar } from './components/Navbar';
import { SearchProvider } from './context/SearchContext.tsx';
import  SearchBar  from './components/SearchBar';
import MatchPage from './pages/MatchPage';
import { GameDataProvider } from './context/GameDataProvider';

function HomePage() {
  const auth = useAuth();
  return (
    <div className="card">
      {!auth.isAuthenticated ? (
        <AuthButton />
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <div className="scale-125 w-full max-w-xl">
            <SearchBar />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <GameDataProvider>
      <SearchProvider
        initialGameName={''}
        initialTagLine={''}
        queryKey={(g, t) => ['summoner', g, t]}
      >
        <BrowserRouter>
          <Navbar />
          <div style={{ height: '64px' }}></div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/player/:gameName/:tagLine" element={<PlayerPage />} />
            <Route path="/match/:matchId" element={<MatchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/draft-planner" element={<DraftPlannerPage />} />
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </GameDataProvider>
  );
}

export default App
