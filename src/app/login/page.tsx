"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import ClipLoader from "react-spinners/ClipLoader";

type LoginResponse = {
  token: string;
};

const Login = () => {
  const router = useRouter();
  const api = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<
        LoginResponse,
        { username: string; password: string }
      >("/api/auth/login", { username, password }, { withAuth: false });

      localStorage.setItem("auth_token", data.token);
      router.push("/admin");
    } catch (error) {
      console.error(error);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="p-10 rounded-md border border-gray-200 bg-white max-w-md w-full">
        <h1 className="text-white text-center mb-5 text-2xl font-bold color">
          Hebent Admin Panel
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="username" className="color font-bolder">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 text-lg outline-none rounded-md border-2 border-color"
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="password" className="color font-bolder">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 text-lg outline-none rounded-md border-2 border-color "
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button
            type="submit"
            className="w-full bg mt-5 text-white p-4 rounded-md font-bold cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader color="#fff" size={15} /> : "Sign in"}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
