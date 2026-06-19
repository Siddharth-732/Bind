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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../../../lib/axios";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState("posts");
  const [profileData, setProfileData] = useState<
    import("../../../store/useAuthStore").AuthUser | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* 1. Header Area (Banner & Avatar) */}
      <div className="relative w-full h-[160px] bg-slate-200">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 md:left-12 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>

        {profileData.banner ? (
          <img
            src={profileData.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-400 to-blue-500"></div>
        )}
        {/* Avatar positioned halfway off the banner */}
        <div className="absolute -bottom-16 left-8 md:left-24">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
              <img
                src={
                  profileData.avatar && !profileData.avatar.includes("default")
                    ? profileData.avatar
                    : `https://ui-avatars.com/api/?name=${profileData.displayName}&background=random`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online Badge */}
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
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

          {/* Posts Tab Content */}
          {activeTab === "posts" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Featured Post */}
              <div className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop"
                  alt="Featured Post"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md w-fit mb-3">
                    Featured Thought
                  </div>
                  <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
                    The Future of Decentralized Peer Review
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <Heart size={16} /> 1.2k
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={16} /> 84
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Post 1 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <FlaskConical size={14} />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="text-slate-800">Lab Notes</span>
                      <span>·</span>
                      <span>2d ago</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4 line-clamp-3">
                    Just finished a new batch of tests on the transformer-based
                    attention models. Results are promising but...
                  </p>
                  <div className="mt-auto rounded-xl overflow-hidden h-32 bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                      alt="Chart"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Post 2 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="text-slate-800">Article</span>
                      <span>·</span>
                      <span>5d ago</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    Cognitive Load in Digital Collaboration
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 line-clamp-3">
                    Exploring how UI density affects student retention during
                    multi-panel discussions.
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                      <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                        <Heart size={14} /> 450
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                        <Share2 size={14} /> 12
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Read More
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {activeTab === "projects" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Experience & Leadership
                </h2>
                <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Exp 1 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Rocket size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-[15px]">
                        Founder & Lead, The Neural Lodge
                      </h3>
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4 max-w-lg">
                      Directing a community of 5,000+ researchers focused on
                      neuro-inspired AI architectures. Managing weekly seminar
                      series and peer-review tracks.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        +42 contributors
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exp 2 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-[15px]">
                        Senior Research Assistant
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        2022 - Present
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mb-3">
                      MIT Media Lab · Affective Computing Group
                    </p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-lg">
                      Developing multimodal sentiment analysis tools for
                      educational software platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === "lodges" || activeTab === "saved") && (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center animate-in fade-in duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Nothing to see here yet
              </h3>
              <p className="text-sm font-medium text-slate-500">
                More features coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
