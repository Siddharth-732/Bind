"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  LayoutGrid,
  Rocket,
  Users,
  Bookmark,
  Heart,
  MessageSquare,
  FlaskConical,
  GraduationCap,
  ChevronRight,
  Share2,
  BookOpen,
  Loader2,
  ArrowLeft,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../../../lib/axios";
import { useAuthStore } from "../../../store/useAuthStore";
import { useRef } from "react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState("posts");
  const [profileData, setProfileData] = useState<
    import("../../../store/useAuthStore").AuthUser | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const { authUser, updateUserAvatar, updateUserBanner, onlineUsers } = useAuthStore();
  const isOwner = authUser?.username === profileData?.username;

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const success = await updateUserAvatar(file);
      if (success) {
        // useAuthStore is updated, grab the latest
        const updatedUser = useAuthStore.getState().authUser;
        if (updatedUser) {
          setProfileData((prev) =>
            prev ? { ...prev, avatar: updatedUser.avatar } : prev,
          );
        }
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const success = await updateUserBanner(file);
      if (success) {
        const updatedUser = useAuthStore.getState().authUser;
        if (updatedUser) {
          setProfileData((prev) =>
            prev ? { ...prev, banner: updatedUser.banner } : prev,
          );
        }
      }
    } finally {
      setIsUploadingBanner(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/users/profile/${username}`);
        setProfileData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-slate-500 font-bold">User not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleBannerChange}
      />

      {/* 1. Header Area (Banner & Avatar) */}
      <div className="relative w-full h-[160px] bg-slate-200">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 md:left-12 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          className={`w-full h-full relative group ${isOwner ? "cursor-pointer" : ""}`}
          onClick={() => isOwner && !isUploadingBanner && bannerInputRef.current?.click()}
        >
          {profileData.banner ? (
            <img
              src={profileData.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal-400 to-blue-500"></div>
          )}
          {/* Banner Hover Overlay */}
          {isOwner && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingBanner ? (
                <Loader2 className="animate-spin text-white" size={32} />
              ) : (
                <Camera className="text-white" size={32} />
              )}
            </div>
          )}
        </div>
        {/* Avatar positioned halfway off the banner */}
        <div className="absolute -bottom-16 left-8 md:left-24">
          <div className="relative">
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative group ${isOwner ? "cursor-pointer" : ""}`}
              onClick={() => isOwner && !isUploadingAvatar && avatarInputRef.current?.click()}
            >
              <img
                src={
                  profileData.avatar && !profileData.avatar.includes("default")
                    ? profileData.avatar
                    : `https://ui-avatars.com/api/?name=${profileData.displayName}&background=random`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              {/* Avatar Hover Overlay */}
              {isOwner && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin text-white" size={28} />
                  ) : (
                    <Camera className="text-white" size={28} />
                  )}
                </div>
              )}
            </div>
            {/* Online Badge */}
            {profileData?._id && onlineUsers.includes(profileData._id) && (
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Profile Controls */}
      <div className="max-w-6xl mx-auto px-8 md:px-24 mt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="mt-14 md:mt-0 md:ml-48">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {profileData.displayName}
          </h1>
          <p className="text-sm font-bold text-indigo-600 mt-0.5">
            @{profileData.username}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-4"></div>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Highlights Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
              Scholarly Highlights
            </h3>
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full w-fit">
                <FlaskConical size={14} className="text-teal-500" />
                <span className="text-xs font-bold">
                  {profileData.specialization}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit">
                <GraduationCap size={14} className="text-blue-500" />
                <span className="text-xs font-bold">
                  {profileData.institute}
                </span>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
              About
            </h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
              {profileData.bio}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <MapPin size={16} className="text-slate-400" />
                Cambridge, MA
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <LinkIcon size={16} className="text-slate-400" />
                <a
                  href="https://juliansterling.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  juliansterling.edu
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Calendar size={16} className="text-slate-400" />
                Joined{" "}
                {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Main Content) */}
        <div className="lg:col-span-8">
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-6 px-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "posts" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <LayoutGrid size={16} /> Posts
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "projects" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <Rocket size={16} /> Projects & Experience
            </button>
            <button
              onClick={() => setActiveTab("lodges")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "lodges" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <Users size={16} /> Lodges
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "saved" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <Bookmark size={16} /> Saved
            </button>
          </div>

          {/* Placeholder for all tabs */}
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center animate-in fade-in duration-500 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Nothing to see here yet
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {profileData.displayName} hasn't added any {activeTab === "saved" ? "saved items" : activeTab} yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
