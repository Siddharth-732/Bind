"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Home as HomeIcon,
  PenSquare,
  Search,
  Compass,
  Heart,
  User,
  Settings,
  Image as ImageIcon,
  FileText,
  BarChart2,
  MoreHorizontal,
  Share2,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

export default function Home() {
  const { authUser, logout } = useAuthStore();
  const router = useRouter();

  // Bouncer: Kick unauthenticated users back to login
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex justify-center text-slate-800 font-sans">
      <div className="max-w-[1500px] w-full flex gap-8 py-8 px-4 relative">
        {/* ================= COLUMN 1: LEFT NAVIGATION (HOVER-EXPAND) ================= */}
        {/* The ghost wrapper maintains a fixed 72px space in the flex layout */}
        <div className="w-[72px] shrink-0 relative z-50">
          {/* The actual sidebar that expands from 72px to 256px (w-64) on hover */}
          <div className="absolute top-0 left-0 w-[72px] hover:w-64 bg-[#F8F9FA] transition-all duration-300 ease-in-out flex flex-col overflow-hidden group rounded-2xl hover:shadow-2xl hover:shadow-slate-200/50 pb-8 border border-transparent hover:border-slate-200">
            {/* Header */}
            <div className="mb-8 pl-6 pr-4 pt-6 flex items-center gap-4 whitespace-nowrap overflow-hidden">
              <div className="shrink-0 w-6 flex items-center justify-center font-bold text-blue-900 text-xl">
                T8
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <h1 className="text-xl font-bold text-blue-900 leading-none">
                  Talk8iv
                </h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                  Dev Network
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 bg-slate-100 text-blue-700 font-medium transition-colors w-full overflow-hidden whitespace-nowrap border-l-4 border-blue-600 rounded-r-lg">
                <div className="shrink-0 w-6 flex justify-center">
                  <HomeIcon size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Home
                </span>
              </button>
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full overflow-hidden whitespace-nowrap rounded-r-lg border-l-4 border-transparent">
                <div className="shrink-0 w-6 flex justify-center">
                  <PenSquare size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Post
                </span>
              </button>
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full overflow-hidden whitespace-nowrap rounded-r-lg border-l-4 border-transparent">
                <div className="shrink-0 w-6 flex justify-center">
                  <Search size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Search
                </span>
              </button>
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full overflow-hidden whitespace-nowrap rounded-r-lg border-l-4 border-transparent">
                <div className="shrink-0 w-6 flex justify-center">
                  <Compass size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore
                </span>
              </button>
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full overflow-hidden whitespace-nowrap rounded-r-lg border-l-4 border-transparent relative">
                <div className="shrink-0 w-6 flex justify-center">
                  <Heart size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Likes
                </span>
                {/* Notification dot mimic */}
                <span className="absolute left-[34px] top-3 w-2 h-2 bg-red-500 rounded-full border border-[#F8F9FA]"></span>
              </button>
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full overflow-hidden whitespace-nowrap rounded-r-lg border-l-4 border-transparent">
                <div className="shrink-0 w-6 flex justify-center">
                  <User size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Profile
                </span>
              </button>
            </nav>

            {/* Footer Actions */}
            <div className="mt-8 flex flex-col gap-2">
              <button className="flex items-center gap-4 pl-6 pr-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-sm overflow-hidden whitespace-nowrap w-[90%] rounded-r-full">
                <div className="shrink-0 w-6 flex justify-center text-xl leading-none font-bold">
                  +
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  New Project
                </span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-4 pl-6 pr-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors overflow-hidden whitespace-nowrap w-[90%] rounded-r-full"
              >
                <div className="shrink-0 w-6 flex justify-center">
                  <Settings size={22} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: PROFILE & TRENDS ================= */}
        <div className="w-72 flex flex-col gap-6 shrink-0">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mb-4 shadow-inner">
              {authUser.displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {authUser.displayName}
            </h2>
            <p className="text-sm font-medium text-blue-600 mt-1">
              Full-Stack Developer
            </p>

            <div className="w-full border-t border-slate-100 mt-6 pt-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Profile Views</span>
                <span className="font-bold text-slate-700">1,240</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Contributions</span>
                <span className="font-bold text-blue-600">42</span>
              </div>
            </div>
          </div>

          {/* Pulse Discovery (Trends) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-500" /> Pulse Discovery
            </h3>

            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                  Technology
                </span>
                <p className="text-sm font-bold mt-2 leading-snug">
                  React 19 compiler features officially announced.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  2h ago • 450 readers
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                  Trending
                </span>
                <p className="text-sm font-bold mt-2 leading-snug">
                  How AI is reshaping modern developer workflows.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  5h ago • 890 comments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: THE FEED ================= */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Create Post Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex shrink-0 items-center justify-center text-blue-600 font-bold">
                {authUser.displayName.charAt(0).toUpperCase()}
              </div>
              <input
                type="text"
                placeholder="Share your latest project, insight, or question..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center justify-between mt-4 ml-14">
              <div className="flex gap-4 text-slate-400">
                <button className="hover:text-blue-500 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button className="hover:text-blue-500 transition-colors">
                  <FileText size={20} />
                </button>
                <button className="hover:text-blue-500 transition-colors">
                  <BarChart2 size={20} />
                </button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-full font-medium text-sm transition-colors shadow-sm">
                Post
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest my-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            Recent Updates
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Sample Feed Post */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  JS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Jayanth S.
                  </h4>
                  <p className="text-xs text-slate-500">
                    Open Source Maintainer • 1h
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Thrilled to finally push the new background-driven pipeline to
              production. By utilizing a new worker thread architecture, we have
              reduced load times by 15% while maintaining structural integrity.
              Full documentation dropping next month! 🚀💻
            </p>

            {/* Placeholder for an image */}
            <div className="w-full h-64 bg-slate-900 rounded-xl mb-4 flex items-center justify-center border border-slate-200 overflow-hidden">
              <span className="text-slate-600 font-medium">
                Image Attachment Placeholder
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-sm pt-2 border-t border-slate-100">
              <button className="flex items-center gap-2 hover:text-blue-600 font-medium transition-colors">
                <ThumbsUp size={18} /> 124
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600 font-medium transition-colors">
                <MessageSquare size={18} /> 18
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600 font-medium transition-colors">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-4 pb-10">
            <button className="px-6 py-2 border border-slate-300 text-slate-600 font-medium rounded-full hover:bg-slate-50 transition-colors text-sm">
              Load More Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
