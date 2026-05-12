"use client";

const AUTH_TOKEN_KEY = "auth_token";

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getTokenExpiryMs = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const payloadRaw = decodeBase64Url(payloadPart);
    const payload = JSON.parse(payloadRaw) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const getTokenRemainingMs = (token: string): number | null => {
  const expiry = getTokenExpiryMs(token);
  if (!expiry) return null;
  return Math.max(0, expiry - Date.now());
};

export const isTokenExpired = (token: string, skewMs = 5000) => {
  const expiry = getTokenExpiryMs(token);
  if (!expiry) return false;
  return Date.now() + skewMs >= expiry;
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const logoutToLogin = () => {
  clearAuthToken();
  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.replace("/");
  }
};
