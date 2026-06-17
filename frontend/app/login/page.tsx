"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { GraduationCap, Mail, Lock, Eye, Building2 } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, authUser, isLoggingIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  }, [authUser, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-100 overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "10s" }}
      />

      <div className="relative z-10 w-full max-w-[420px] rounded-3xl bg-white/80 backdrop-blur-xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006F8D] text-white shadow-lg">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#006F8D]">
            Lodge
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Welcome back to the scholar&apos;s hub.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Academic Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#006F8D] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10 hover:border-slate-300"
                placeholder="name@university.edu"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <Link
                href="#"
                className="text-[11px] font-bold text-[#006F8D] hover:text-[#004e63] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#006F8D] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10 hover:border-slate-300"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#006F8D] focus:ring-[#006F8D]"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer"
            >
              Remember this device
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-2 w-full flex items-center justify-center rounded-xl bg-[#006F8D] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#005a73] hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoggingIn ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="mx-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="flex gap-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-4 w-4"
            />
            Google
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <Building2 size={16} className="text-slate-500" />
            SSO
          </button>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          New to the community?{" "}
          <Link
            href="/register"
            className="font-bold text-[#006F8D] hover:underline"
          >
            Join the Lodge
          </Link>
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          Secure Academic Gateway &copy; 2024 Lodge Platform
        </p>
      </div>
    </div>
  );
}
