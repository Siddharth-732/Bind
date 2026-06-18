"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import InteractiveIllustration from "../../components/InteractiveIllustration";

export default function RegisterPage() {
  const { register, isRegistering } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    username: "",
    bio: "",
    institute: "",
    specialization: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );

  // For the interactive illustration
  const [focusedField, setFocusedField] = useState<
    "email" | "password" | "name" | null
  >(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (formData.username.length < 3) {
      const timer = setTimeout(() => setUsernameAvailable(null), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const response = await axiosInstance.get(
          `/users/check-username?username=${formData.username}`,
        );
        setUsernameAvailable(response.data.available);
      } catch (error) {
        setUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return toast.error("Please fill in all basic details.");
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || usernameAvailable === false) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return toast.error("Please choose a valid username.");
    }

    const submitData = new FormData();
    submitData.append("displayName", formData.displayName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("username", formData.username);
    submitData.append("bio", formData.bio);
    submitData.append("institute", formData.institute);
    submitData.append("specialization", formData.specialization);
    if (avatarFile) submitData.append("avatar", avatarFile);

    try {
      await register(submitData);
      router.push("/");
    } catch (error) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      console.error("Registration failed");
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

      {/* Right Column: Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-50 md:bg-white relative overflow-y-auto">
        <div className="w-full max-w-[400px] bg-white md:bg-transparent rounded-2xl md:rounded-none p-8 md:p-0 shadow-xl md:shadow-none border border-slate-100 md:border-none my-8">
          {/* Header */}
          <div className="mb-8 text-center flex flex-col items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005a73] text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold text-slate-800">Bind</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {step === 1 ? "Create an account" : "Complete your profile"}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
          </div>

          {/* ================= STEP 1: BASIC INFO ================= */}
          {step === 1 && (
            <form
              onSubmit={handleNextStep}
              className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full border-b-2 border-slate-300 bg-transparent py-2 pl-1 pr-10 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                    placeholder="Min. 8 characters"
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

              <button
                type="submit"
                className="mt-8 w-full flex items-center justify-center rounded-full bg-[#005a73] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-[#004255] active:scale-[0.98]"
              >
                Continue
              </button>

              {/* Social Registration */}
              <button
                type="button"
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-[#F3F4F6] py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-[#E5E7EB]"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="h-5 w-5"
                />
                Sign up with Google
              </button>

              <div className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-slate-900 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          )}

          {/* ================= STEP 2: PROFILE ================= */}
          {step === 2 && (
            <form
              onSubmit={handleFinalSubmit}
              className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="flex flex-col items-center mb-6">
                <label className="cursor-pointer relative group">
                  <div
                    className={`h-20 w-20 rounded-full border-[3px] flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? "border-[#005a73]" : "border-slate-200 group-hover:border-[#005a73] bg-slate-50"}`}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User
                        size={32}
                        className="text-slate-300 group-hover:text-[#005a73] transition-colors"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-6 w-6 bg-[#005a73] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Upload size={10} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Upload Photo
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/\s/g, ""),
                      })
                    }
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full border-b-2 bg-transparent py-2 pl-6 pr-10 text-[15px] text-slate-900 transition-colors focus:outline-none ${
                      usernameAvailable === true
                        ? "border-green-400 focus:border-green-500"
                        : usernameAvailable === false
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-300 focus:border-[#005a73]"
                    }`}
                    placeholder="Scholar_Lodge_24"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-slate-400"
                      />
                    ) : usernameAvailable === true ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : usernameAvailable === false ? (
                      <XCircle size={18} className="text-red-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  onFocus={() => setFocusedField("email")} // Just to trigger some looking behavior
                  onBlur={() => setFocusedField(null)}
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none h-14 resize-none"
                  placeholder="Your research interests..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Institute / University
                </label>
                <input
                  type="text"
                  value={formData.institute}
                  onChange={(e) =>
                    setFormData({ ...formData, institute: e.target.value })
                  }
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                  placeholder="e.g. MIT, Stanford"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className="block w-full border-b-2 border-slate-300 bg-transparent py-2 px-1 text-[15px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#005a73] focus:outline-none"
                  placeholder="e.g. Machine Learning"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isRegistering || usernameAvailable === false}
                  className="w-full flex items-center justify-center rounded-full bg-[#005a73] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-[#004255] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 w-full text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  ← Back to basics
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
