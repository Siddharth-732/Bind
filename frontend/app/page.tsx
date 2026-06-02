"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { authUser, logout, connectSocket, disconnectSocket } = useAuthStore();
  const { users, getUsers, selectedUser, setSelectedUser } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      connectSocket();
      getUsers();
    }
    return () => disconnectSocket();
  }, [authUser, router, connectSocket, disconnectSocket]);

  // prevent the page from flashing while the redirect happens
  if (!authUser) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* The Sidebar (Users List) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {users.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 mt-10">
            No users found.
          </p>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedUser?._id === user._id
                  ? "bg-zinc-800 ring-1 ring-indigo-500"
                  : "hover:bg-zinc-800/50"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-zinc-200">
                  {user.displayName}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </button>
          ))
        )}
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
