import './App.css'
import { useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';
import DraftPlannerPage from './pages/DraftPlannerPage';
import AdminPage from './pages/AdminPage';
import { AuthButton } from './components/AuthButton';
import { Navbar } from './components/Navbar';
import { SearchProvider } from './context/SearchContext.tsx';
import  SearchBar  from './components/SearchBar';
import MatchPage from './pages/MatchPage';
import { GameDataProvider } from './context/GameDataProvider';
import ChampionsPage from './pages/ChampionsPage';
import ChampionDetailPage from './pages/ChampionDetailPage';
import ProPlayersPage from './pages/ProPlayersPage';
import { FaSearch, FaChartLine, FaUsers, FaRobot } from 'react-icons/fa';

function HomePage() {
  const auth = useAuth();
  
  const features = [
    {
      icon: <FaSearch className="text-4xl green-text" />,
      title: 'Player Search',
      description: 'Search for any League of Legends player and view their detailed match history and performance statistics.'
    },
    {
      icon: <FaChartLine className="text-4xl green-text" />,
      title: 'Match Analysis',
      description: 'Deep dive into match details with comprehensive statistics, builds, and performance metrics.'
    },
    {
      icon: <FaUsers className="text-4xl green-text" />,
      title: 'Draft Planner',
      description: 'Plan your team compositions and get strategic insights for your draft picks.'
    },
    {
      icon: <FaRobot className="text-4xl green-text" />,
      title: 'AI Assistant',
      description: 'Get intelligent build recommendations and strategic advice powered by AI for your champions.'
    }
  ];

  return (
    <div className="min-h-screen green-bg-dark p-8 pt-20">
      {!auth.isAuthenticated ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <AuthButton />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Search Bar Section */}
          <div className="flex flex-col gap-6 items-center mb-12">
            <h1 className="text-4xl font-bold green-text-light">League of Legends Stats & Analysis</h1>
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="green-bg-medium border green-border rounded-lg p-6 transition-all hover:green-bg-light"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-3 green-bg-light rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/champions" element={<ChampionsPage />} />
            <Route path="/champion/:id" element={<ChampionDetailPage />} />
            <Route path="/pro-players" element={<ProPlayersPage />} />
            <Route path="/draft-planner" element={<DraftPlannerPage />} />
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </GameDataProvider>
  );
}

export default App
