"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getStoredToken,
  getTokenRemainingMs,
  isTokenExpired,
  logoutToLogin,
} from "@/lib/authToken";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const TokenTimer = () => {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => {
      const token = getStoredToken();
      if (!token) {
        setRemainingMs(null);
        return;
      }

      if (isTokenExpired(token, 0)) {
        logoutToLogin();
        return;
      }

      setRemainingMs(getTokenRemainingMs(token));
    };

    refresh();
    const interval = window.setInterval(refresh, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const toneClass = useMemo(() => {
    if (remainingMs === null) return "text-gray-500";
    if (remainingMs <= 5 * 60 * 1000) return "text-red-600";
    if (remainingMs <= 15 * 60 * 1000) return "text-amber-600";
    return "text-gray-700";
  }, [remainingMs]);

  if (remainingMs === null) return null;

  return (
    <div className="mx-2 mt-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs">
      <p className="text-gray-600">Token expires in</p>
      <p className={`mt-0.5 font-semibold ${toneClass}`}>
        {formatTime(remainingMs)}
      </p>
    </div>
  );
};

export default TokenTimer;
