"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

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
  });

  // Image Memory
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Username Validation State
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );

  // 1. Debounced Username Checker
  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Wait 500ms after the user stops typing before hitting the backend
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

    return () => clearTimeout(timer); // Cleanup if they keep typing
  }, [formData.username]);

  // 2. Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a temporary URL to show a preview on the screen
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 3. Move to Step 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      return toast.error("Please fill in all basic details.");
    }
    setStep(2);
  };

  // 4. Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || usernameAvailable === false) {
      return toast.error("Please choose a valid username.");
    }

    // Because we have a file, we MUST use FormData instead of standard JSON
    const submitData = new FormData();
    submitData.append("displayName", formData.displayName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("username", formData.username);
    submitData.append("bio", formData.bio);
    if (avatarFile) submitData.append("avatar", avatarFile);

    try {
      await register(submitData);
      router.push("/"); // Send them to the Lodge on success!
    } catch (error) {
      console.error("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4 text-slate-800">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-8 w-full max-w-md relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-teal-400 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="text-center mb-8 mt-4">
          <div className="h-12 w-12 bg-teal-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-md">
            L
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "Join the Nexus" : "Complete your Profile"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {step === 1
              ? "Enter your core details to get started."
              : "How should peers find you?"}
          </p>
        </div>

        {/* ================= STEP 1: BASIC INFO ================= */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep}
            className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              />
            </div>

            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Academic Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-6 bg-[#007A99] hover:bg-[#00627A] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              Continue{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        )}

        {/* ================= STEP 2: PROFILE & USERNAME ================= */}
        {step === 2 && (
          <form
            onSubmit={handleFinalSubmit}
            className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer group relative">
                <div
                  className={`h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? "border-teal-400" : "border-slate-300 hover:border-teal-400 bg-slate-50"}`}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload
                      className="text-slate-400 group-hover:text-teal-400 transition-colors"
                      size={24}
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Upload Avatar (Optional)
              </span>
            </div>

            {/* Username with Live Check */}
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  @
                </span>
                <input
                  type="text"
                  placeholder="username"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    })
                  }
                  className={`w-full bg-slate-50 border rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-2 transition-all ${
                    usernameAvailable === true
                      ? "border-green-400 focus:ring-green-400"
                      : usernameAvailable === false
                        ? "border-red-400 focus:ring-red-400"
                        : "border-slate-200 focus:ring-teal-400"
                  }`}
                />

                {/* Status Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
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

              {/* Status Text */}
              <p
                className={`text-xs mt-1.5 pl-1 font-medium ${
                  usernameAvailable === true
                    ? "text-green-600"
                    : usernameAvailable === false
                      ? "text-red-500"
                      : "text-transparent"
                }`}
              >
                {usernameAvailable === true
                  ? "Username is available!"
                  : usernameAvailable === false
                    ? "Username is already taken."
                    : "."}
              </p>
            </div>

            {/* Bio */}
            <textarea
              placeholder="A short bio... (e.g. CS major, looking for ML hackathons)"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-sm"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isRegistering || usernameAvailable === false}
                className="flex-1 py-3.5 bg-[#007A99] hover:bg-[#00627A] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
