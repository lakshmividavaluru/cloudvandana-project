import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import OAuthCallback from "./components/OAuthCallback";
import { getStoredAuth, clearAuth } from "./services/salesforceAuth";
import "./App.css";

export default function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const path = window.location.pathname;

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) setAuth(stored);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (authData) => {
    setAuth(authData);
    window.history.pushState({}, "", "/");
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
  };

  if (loading) return (
    <div className="app-loading">
      <div className="spinner" />
    </div>
  );

  if (path === "/oauth/callback") {
    return <OAuthCallback onSuccess={handleLoginSuccess} />;
  }

  return auth
    ? <Dashboard auth={auth} onLogout={handleLogout} />
    : <LoginPage />;
}
