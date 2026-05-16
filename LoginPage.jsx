import { loginWithSalesforce } from "../services/salesforceAuth";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="login-card">
        <div className="login-badge">
          <span className="badge-dot" />
          Salesforce Integration
        </div>

        <div className="login-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" fill="url(#g1)" opacity="0.2"/>
            <path d="M20 16h8l4 8-4 8h-8l-4-8 4-8z" fill="url(#g2)"/>
            <defs>
              <linearGradient id="g1" x1="4" y1="4" x2="44" y2="44">
                <stop stopColor="#00e5ff"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
              <linearGradient id="g2" x1="16" y1="16" x2="32" y2="32">
                <stop stopColor="#00e5ff"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="login-title">SF Rule Manager</h1>
        <p className="login-subtitle">
          Manage Salesforce Validation Rules<br />directly from your browser
        </p>

        <div className="login-features">
          {[
            { icon: "⚡", label: "Live rule toggling" },
            { icon: "🔒", label: "OAuth 2.0 secured" },
            { icon: "🚀", label: "Instant deploy" },
          ].map((f) => (
            <div key={f.label} className="feature-chip">
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        <button className="login-btn" onClick={loginWithSalesforce}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14.5A6.5 6.5 0 1110 3.5a6.5 6.5 0 010 13z" opacity="0.3"/>
            <path d="M13.5 9.5H11V7a1 1 0 00-2 0v2.5H6.5a1 1 0 000 2H9V14a1 1 0 002 0v-2.5h2.5a1 1 0 000-2z"/>
          </svg>
          Connect to Salesforce
        </button>

        <p className="login-footer">
          Requires a Salesforce Developer Org &amp; Connected App
        </p>
      </div>
    </div>
  );
}
