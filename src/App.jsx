import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import SpinNormal from '@/pages/SpinNormal';
import SpinWeighted from '@/pages/SpinWeighted';
import SpinDouble from '@/pages/SpinDouble';
import TruthOrDare from '@/pages/TruthOrDare';
import Rooms from '@/pages/Rooms';
import SpinHistory from '@/pages/SpinHistory';

// Pastikan file ini ada
import LoginPage from '@/pages/LoginPage'; 

const AuthenticatedApp = () => {
  // BINGO! Kita ambil variabel isAuthenticated langsung dari useAuth()
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-heading">Memuat Spin Decide...</p>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Rute Publik: Hanya bisa diakses kalau BELUM login */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
      />

      {/* Rute Privat: Hanya bisa diakses kalau SUDAH login */}
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/spin/normal" element={<SpinNormal />} />
        <Route path="/spin/weighted" element={<SpinWeighted />} />
        <Route path="/spin/double" element={<SpinDouble />} />
        <Route path="/spin/truth-or-dare" element={<TruthOrDare />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/history" element={<SpinHistory />} />
      </Route>
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App