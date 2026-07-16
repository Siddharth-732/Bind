"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import InteractiveIllustration from "../../components/InteractiveIllustration";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Track focus for illustration
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);

  const { login, authUser, isLoggingIn, googleAuth } = useAuthStore();
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await googleAuth(tokenResponse.access_token);
      if (success) {
        router.push("/");
      }
    },
    onError: () => {
      toast.error("Google authentication failed or was cancelled.");
    }
  });

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  }, [authUser, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasError(false);

    if (!email || password.length < 6) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500); // short reset
      return;
    }

    try {
      // login action from zustand
      const success = await login({ email, password });

      // If login throws an error or fails, trigger a shake
      if (!success) {
        setHasError(true);
        setTimeout(() => setHasError(false), 500); // short reset
      }
    } catch (err) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500); // short reset
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface font-sans">
      {/* Left Column: Interactive Illustration */}
      <div className="w-full md:w-1/2 bg-[#B8F0FF] dark:bg-[#17233a] hidden md:flex flex-col items-center justify-center relative overflow-hidden">
        <InteractiveIllustration
          focusedField={focusedField}
          hasError={hasError}
        />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface-alt md:bg-surface relative">
        <div className="w-full max-w-[400px] bg-surface md:bg-transparent rounded-2xl md:rounded-none p-8 md:p-0 shadow-xl md:shadow-none border border-surface-muted md:border-none">
          {/* Header */}
          <div className="mb-10 text-center flex flex-col items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold text-primary">Bind</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
              Welcome back!
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-bold text-secondary">
                Email
              </label>
              <input
                type="email"
                required
                className="block w-full border-b-2 border-subtle bg-transparent py-2 px-1 text-[15px] text-primary transition-colors placeholder:text-muted focus:border-brand focus:outline-none"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-bold text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full border-b-2 border-subtle bg-transparent py-2 pl-1 pr-10 text-[15px] text-primary transition-colors placeholder:text-muted focus:border-brand focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-brand hover:text-brand-hover transition-colors"
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
                  className="h-4 w-4 rounded border-subtle text-brand focus:ring-brand"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-secondary"
                >
                  Remember for 30 days
                </label>
              </div>
              <Link
                href="#"
                className="text-sm font-bold text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-6 w-full flex items-center justify-center rounded-full bg-brand py-3.5 text-[15px] font-bold text-white transition-all hover:bg-brand-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Social Login */}
          <button 
            type="button"
            onClick={() => googleLogin()}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-surface-muted py-3.5 text-[15px] font-bold text-secondary transition-colors hover:bg-[#E5E7EB]"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5 w-5"
            />
            Log in with Google
          </button>

          <div className="mt-8 text-center text-sm text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
