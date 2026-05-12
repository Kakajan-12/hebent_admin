"use client";

import { useCallback, useMemo } from "react";
import axios from "axios";
import type { AxiosRequestConfig, Method } from "axios";
import { getStoredToken, isTokenExpired, logoutToLogin } from "@/lib/authToken";

type ApiConfig = AxiosRequestConfig & {
  withAuth?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const buildApiUrl = (endpoint: string) => {
  if (typeof endpoint !== "string") return "";

  const normalizedPath = endpoint.replace(/\\/g, "/");
  if (/^https?:\/\//.test(normalizedPath)) return normalizedPath;

  const normalizedEndpoint = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return `${API_URL}${normalizedEndpoint}`;
};

export const getImagePath = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (typeof record.images === "string" && record.images.trim()) {
    return record.images;
  }
  if (typeof record.image === "string" && record.image.trim()) {
    return record.image;
  }

  return null;
};

export const getApiErrorStatus = (error: unknown) => {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.status;
};

export function useApi() {
  const request = useCallback(
    async <TResponse, TBody = unknown>(
      method: Method,
      endpoint: string,
      data?: TBody,
      config: ApiConfig = {},
    ) => {
      const { withAuth = true, headers, ...restConfig } = config;
      const token = withAuth ? getStoredToken() : null;

      if (withAuth && (!token || isTokenExpired(token))) {
        logoutToLogin();
        throw new Error("Auth token expired");
      }

      try {
        const response = await axios.request<TResponse>({
          method,
          url: buildApiUrl(endpoint),
          data,
          headers: {
            ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
          ...restConfig,
        });

        return response.data;
      } catch (error) {
        const status = getApiErrorStatus(error);
        if (withAuth && (status === 401 || status === 403)) {
          logoutToLogin();
        }
        throw error;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      get: <TResponse>(endpoint: string, config?: ApiConfig) =>
        request<TResponse>("GET", endpoint, undefined, config),
      post: <TResponse, TBody = unknown>(
        endpoint: string,
        data?: TBody,
        config?: ApiConfig,
      ) => request<TResponse, TBody>("POST", endpoint, data, config),
      put: <TResponse, TBody = unknown>(
        endpoint: string,
        data?: TBody,
        config?: ApiConfig,
      ) => request<TResponse, TBody>("PUT", endpoint, data, config),
      delete: <TResponse, TBody = unknown>(
        endpoint: string,
        data?: TBody,
        config?: ApiConfig,
      ) => request<TResponse, TBody>("DELETE", endpoint, data, config),
    }),
    [request],
  );
}
