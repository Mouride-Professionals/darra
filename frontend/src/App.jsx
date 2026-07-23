import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DaaraListPage from './pages/DaaraListPage';

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();
  const [lang, setLang] = useState('fr');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#0C3B2E,#174D3B)', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 52 }}>🕌</div>
        <div style={{ color: '#C5A028', fontSize: 16, fontWeight: 700, fontFamily: 'Tajawal,sans-serif' }}>
          Daara de Touba…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage lang={lang} onLangChange={setLang} />;
  }

  return <DaaraListPage lang={lang} onLangChange={setLang} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
