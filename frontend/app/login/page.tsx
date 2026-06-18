"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import InteractiveIllustration from "../../components/InteractiveIllustration";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Track focus for illustration
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);

  const { login, authUser, isLoggingIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  }, [authUser, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasError(false);

    try {
      // login action from zustand
      await login({ email, password });

      // If login throws an error or fails, the catch block will run
      // Actually zustand might not throw, but handle errors internally via toast.
      // We will assume that if we are still on this page after await and authUser is null,
      // it might have failed. Let's just trigger a small shake anyway if authUser is null.
    } catch (err) {
      setHasError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans">
      {/* Left Column: Interactive Illustration */}
      <div className="w-full md:w-1/2 bg-[#B8F0FF] hidden md:flex flex-col items-center justify-center relative overflow-hidden">
        <InteractiveIllustration
          focusedField={focusedField}
          hasError={hasError}
        />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-50 md:bg-white relative">
        <div className="w-full max-w-[400px] bg-white md:bg-transparent rounded-2xl md:rounded-none p-8 md:p-0 shadow-xl md:shadow-none border border-slate-100 md:border-none">
          {/* Header */}
          <div className="mb-10 text-center flex flex-col items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005a73] text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold text-slate-800">Bind</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Welcome back!
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 pl-1 pr-10 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#005a73] hover:text-[#004255] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#005a73] focus:ring-[#005a73]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-600"
                >
                  Remember for 30 days
                </label>
              </div>
              <Link
                href="#"
                className="text-sm font-bold text-[#005a73] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              onClick={() => {
                // If they try to login with empty fields or short password, trigger error
                if (!email || password.length < 6) {
                  setHasError(true);
                  setTimeout(() => setHasError(false), 500); // short reset
                }
              }}
              className="mt-6 w-full flex items-center justify-center rounded-full bg-[#005a73] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-[#004255] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Social Login */}
          <button className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-[#F3F4F6] py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-[#E5E7EB]">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5 w-5"
            />
            Log in with Google
          </button>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-slate-900 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
