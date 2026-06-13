"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  Users
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
    institute: "",
    specialization: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const response = await axiosInstance.get(`/users/check-username?username=${formData.username}`);
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
      return toast.error("Please fill in all basic details.");
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || usernameAvailable === false) {
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
      console.error("Registration failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-100 p-4 font-sans overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Step Indicator Top */}
        <div className="flex flex-col items-center justify-center mb-6">
          <span className="text-[10px] font-bold tracking-widest text-[#006F8D] uppercase mb-3">
            Step {step} of 2
          </span>
          <div className="flex gap-2 w-48 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
            <div className={`h-full bg-[#006F8D] rounded-full transition-all duration-500 ease-out`} style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {step === 1 ? "Create Account" : "Complete your profile"}
          </h2>
          {step === 2 && (
            <p className="text-xs font-medium text-slate-500 mt-1">
              Introduce yourself to the Lodge community.
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white">
          
          {step === 1 && (
            <div className="mb-6 flex justify-center animate-in fade-in zoom-in duration-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00BAE6] text-white shadow-md">
                <GraduationCap size={24} />
              </div>
            </div>
          )}

          {/* ================= STEP 1: BASIC INFO ================= */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#006F8D] transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#006F8D] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#006F8D] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <button type="submit" className="mt-6 w-full flex items-center justify-center rounded-xl bg-[#006F8D] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#005a73] active:scale-[0.98] group">
                Next: Profile Setup <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="mx-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">Or register with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="flex gap-3">
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3.5 w-3.5" /> Google
                </button>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                  <Mail size={14} className="text-slate-500" /> SAML
                </button>
              </div>

              <div className="mt-6 text-center text-xs font-medium text-slate-500">
                Already have an account? <Link href="/login" className="font-bold text-[#006F8D] hover:underline">Sign in</Link>
              </div>
            </form>
          )}

          {/* ================= STEP 2: PROFILE ================= */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <div className="flex flex-col items-center mb-2">
                <label className="cursor-pointer relative group">
                  <div className={`h-20 w-20 rounded-full border-[3px] flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? "border-[#006F8D]" : "border-slate-200 group-hover:border-[#006F8D] bg-slate-50"}`}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User size={32} className="text-slate-300 group-hover:text-[#006F8D] transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 h-6 w-6 bg-[#006F8D] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Upload size={10} />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <span className="mt-3 text-[9px] font-bold uppercase tracking-widest text-[#00BAE6]">Upload Photo</span>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Username</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                    className={`block w-full rounded-xl border bg-white/50 py-3 pl-8 pr-10 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                      usernameAvailable === true ? "border-green-400 focus:ring-green-400/10 focus:border-green-500" :
                      usernameAvailable === false ? "border-red-400 focus:ring-red-400/10 focus:border-red-500" :
                      "border-slate-200 focus:ring-[#006F8D]/10 focus:border-[#006F8D]"
                    }`}
                    placeholder="Scholar_Lodge_24"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? <Loader2 size={16} className="animate-spin text-slate-400" /> :
                     usernameAvailable === true ? <CheckCircle size={16} className="text-green-500" /> :
                     usernameAvailable === false ? <XCircle size={16} className="text-red-500" /> : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 h-20 resize-none text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                  placeholder="Tell us about your research interests or academic focus..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Institute / University</label>
                <input
                  type="text"
                  value={formData.institute}
                  onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                  placeholder="e.g. MIT, Stanford, Independent"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialization / Domain</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#006F8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#006F8D]/10"
                  placeholder="e.g. Machine Learning, Quantum Physics"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isRegistering || usernameAvailable === false}
                  className="w-full flex items-center justify-center rounded-xl bg-[#006F8D] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#005a73] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isRegistering ? <Loader2 size={18} className="animate-spin" /> : 
                    <>Create account <span className="ml-2 transition-transform group-hover:translate-x-1">→</span></>}
                </button>
                <button type="button" onClick={() => setStep(1)} className="mt-4 w-full text-xs font-bold text-slate-500 hover:text-slate-700">
                  ← Back to basics
                </button>
              </div>

              <div className="mt-6 text-center text-xs font-medium text-slate-500">
                Already have an account? <Link href="/login" className="font-bold text-[#006F8D] hover:underline">Log in</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
