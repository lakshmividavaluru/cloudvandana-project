import { useEffect, useState } from "react";
import { exchangeCodeForToken } from "../services/salesforceAuth";

export default function OAuthCallback({ onSuccess }) {
  const [status, setStatus] = useState("Completing login…");
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");

    if (err) {
      setError(params.get("error_description") || "Authorization denied.");
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    exchangeCodeForToken(code)
      .then((authData) => {
        setStatus("Connected! Redirecting…");
        setTimeout(() => onSuccess(authData), 600);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", gap: "16px"
    }}>
      {error ? (
        <>
          <div style={{ fontSize: "32px" }}>⚠️</div>
          <p style={{ color: "var(--danger)", fontFamily: "var(--mono)", fontSize: "13px" }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => window.location.href = "/"}>
            Back to Login
          </button>
        </>
      ) : (
        <>
          <div className="spinner" />
          <p style={{ color: "var(--text2)", fontFamily: "var(--mono)", fontSize: "13px" }}>{status}</p>
        </>
      )}
    </div>
  );
}
