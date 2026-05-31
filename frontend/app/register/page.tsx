"use client";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register clicked!", { displayName, email, password });
    // We will wire this to Axios later!
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl ring-1 ring-white/10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Join Talk8iv and start chatting
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Display Name
            </label>
            <input
              type="text"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="How should we call you?"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition-colors hover:bg-indigo-500 active:scale-[0.98] mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
