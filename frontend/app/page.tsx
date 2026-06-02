"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { authUser, logout, connectSocket, disconnectSocket } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [authUser, router, connectSocket, disconnectSocket]);

  // prevent the page from flashing while the redirect happens
  if (!authUser) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* the Sidebar (Users List) */}
      <div className="w-80 flex flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-5">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Talk8iv
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back,{" "}
            <span className="text-indigo-400">{authUser.displayName}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-center text-sm text-zinc-500 mt-10">
            Online users will appear here...
          </p>
        </div>

        <div className="border-t border-zinc-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/*swap this with a real image later! */}
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
              {authUser.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{authUser.displayName}</span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* the Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-medium text-zinc-300">
              No conversation selected
            </h3>
            <p className="text-zinc-500 mt-2">
              Choose a user from the sidebar to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
