
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import Nav from './components/layout/Nav';
import Toast from './components/layout/Toast';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import GameSetup from './pages/GameSetup';
import LiveGame from './pages/LiveGame';
import GameReview from './pages/GameReview';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
      <BrowserRouter>
        <div className="flex flex-col h-full bg-surface-primary text-white">
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:teamId" element={<TeamDetail />} />
              <Route path="/game/setup" element={<GameSetup />} />
              <Route path="/game/:gameId/live" element={<LiveGame />} />
              <Route path="/game/:gameId/review" element={<GameReview />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Nav />
          <Toast />
        </div>
      </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
