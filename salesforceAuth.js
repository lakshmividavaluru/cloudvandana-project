const SF_LOGIN_URL = import.meta.env.VITE_SF_LOGIN_URL || "https://login.salesforce.com";
const CLIENT_ID = import.meta.env.VITE_SF_CLIENT_ID || "";
const REDIRECT_URI = import.meta.env.VITE_SF_REDIRECT_URI || `${window.location.origin}/oauth/callback`;
const CLIENT_SECRET = import.meta.env.VITE_SF_CLIENT_SECRET || "";

export const loginWithSalesforce = () => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "full refresh_token api",
  });
  window.location.href = `${SF_LOGIN_URL}/services/oauth2/authorize?${params}`;
};

export const exchangeCodeForToken = async (code) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error_description || "Token exchange failed");
  }

  const data = await response.json();
  const authData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    instanceUrl: data.instance_url,
    userId: data.id,
    issuedAt: Date.now(),
  };
  storeAuth(authData);
  return authData;
};

export const refreshAccessToken = async (refreshToken) => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) throw new Error("Token refresh failed");

  const data = await response.json();
  const stored = getStoredAuth();
  const updated = { ...stored, accessToken: data.access_token, issuedAt: Date.now() };
  storeAuth(updated);
  return updated;
};

const AUTH_KEY = "sf_auth";

export const storeAuth = (authData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
};

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};
