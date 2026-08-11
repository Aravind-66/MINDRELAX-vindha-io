import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WellnessProvider } from './context/WellnessContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigation } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { AskMindaModal } from './components/AskMindaModal';
import { LiveBackgroundCanvas } from './components/LiveBackgroundCanvas';

import { DashboardView } from './pages/DashboardView';
import { MoodView } from './pages/MoodView';
import { JournalView } from './pages/JournalView';
import { MeditationView } from './pages/MeditationView';
import { MusicView } from './pages/MusicView';
import { CommunityView } from './pages/CommunityView';
import { GamesView } from './pages/GamesView';
import { PlantView } from './pages/PlantView';
import { GoalsView } from './pages/GoalsView';
import { ResourcesView } from './pages/ResourcesView';
import { WebinarsView } from './pages/WebinarsView';
import { AnalyticsView } from './pages/AnalyticsView';
import { ProfileView } from './pages/ProfileView';

import { useWellness } from './context/WellnessContext';

function AppLayout() {
  const { bgTheme, colorMode } = useWellness();

  return (
    <div data-theme={bgTheme} data-color-mode={colorMode} className="min-h-screen bg-transparent font-sans selection:bg-emerald-500 selection:text-white flex flex-col lg:flex-row relative">
      {/* Live 3D Particle Wave Animated Background */}
      <LiveBackgroundCanvas />

      {/* Top/Sidebar Navigation */}
      <Navigation />

      {/* Main View Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 pb-28 lg:pb-8 min-h-screen w-full max-w-full overflow-x-hidden">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/mood" element={<MoodView />} />
            <Route path="/journal" element={<JournalView />} />
            <Route path="/meditate" element={<MeditationView />} />
            <Route path="/music" element={<MusicView />} />
            <Route path="/community" element={<CommunityView />} />
            <Route path="/games" element={<GamesView />} />
            <Route path="/plant" element={<PlantView />} />
            <Route path="/goals" element={<GoalsView />} />
            <Route path="/resources" element={<ResourcesView />} />
            <Route path="/webinars" element={<WebinarsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Global Modals */}
      <OnboardingModal />
      <AskMindaModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WellnessProvider>
        <Router>
          <AppLayout />
        </Router>
      </WellnessProvider>
    </ErrorBoundary>
  );
}
