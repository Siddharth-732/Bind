"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useLodgeStore } from "../store/useLodgeStore";
import { useStatusStore } from "../store/useStatusStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  Search,
  Building2,
  Compass,
  Heart,
  User,
  Settings,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Mic,
  Send,
  Plus,
  MessageSquare,
  Hash,
  Users,
  Loader2,
  X
} from "lucide-react";

export default function ChatPage() {
  const { authUser, logout, connectSocket, disconnectSocket } = useAuthStore();
  const { users, getUsers, selectedUser, setSelectedUser } = useChatStore();
  
  // LODGE STORE
  const { 
    publicLodges, myLodges, currentLodgeChannels, selectedLodge, selectedChannel,
    getPublicLodges, getMyLodges, joinLodge, setSelectedLodge, setSelectedChannel, isJoining
  } = useLodgeStore();

  // STATUS STORE
  const { statuses, getStatuses, createStatus, isCreatingStatus, subscribeToStatuses, unsubscribeFromStatuses } = useStatusStore();

  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<"chat" | "lodge">("chat");

  // Story Creation State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storyText, setStoryText] = useState("");
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);

  // Active Story Viewing
  const [viewingStatus, setViewingStatus] = useState<any | null>(null);

  // Bouncer & Initializer
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      connectSocket();
      getUsers();
      getPublicLodges();
      getMyLodges();
      getStatuses();
      subscribeToStatuses();
    }
    return () => {
      disconnectSocket();
      unsubscribeFromStatuses();
    };
  }, [authUser, router, connectSocket, disconnectSocket, getUsers, getPublicLodges, getMyLodges, getStatuses, subscribeToStatuses, unsubscribeFromStatuses]);

  const handleAddStoryClick = () => {
    setIsStoryModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setStoryPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostStory = async () => {
    const formData = new FormData();
    if (storyText) formData.append("textContent", storyText);
    if (storyFile) {
      formData.append("media", storyFile);
      // Basic type check
      const type = storyFile.type.startsWith("video/") ? "video" : "image";
      formData.append("mediaType", type);
    } else {
      formData.append("mediaType", "none");
    }

    await createStatus(formData);
    setIsStoryModalOpen(false);
    setStoryFile(null);
    setStoryPreview(null);
    setStoryText("");
  };

  if (!authUser) return null;

  return (
    <div className="flex h-screen bg-[#F4F7F9] text-slate-800 font-sans overflow-hidden">
      {/* ================= PANE 1: GLOBAL NAVIGATION ================= */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="px-8 mb-10 flex items-center gap-3">
            <div className="h-10 w-10 bg-cyan-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Bind
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Connect to Build
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 px-4">
            <button 
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "chat" ? "bg-teal-400/20 text-teal-700 border border-teal-400/30 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <MessageCircle size={22} /> Chat
            </button>
            <button 
              onClick={() => setActiveTab("lodge")}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "lodge" ? "bg-teal-400/20 text-teal-700 border border-teal-400/30 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Building2 size={22} /> Lodge
            </button>
            <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <Search size={22} /> Search
            </button>
            <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <Compass size={22} /> Explore
            </button>
            <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <Heart size={22} /> Likes
            </button>
            <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <User size={22} /> Profile
            </button>
          </nav>
        </div>

        <div className="px-6 flex flex-col gap-4">
          <button className="w-full py-3.5 bg-[#007A99] hover:bg-[#00627A] text-white rounded-xl font-semibold transition-colors shadow-md flex items-center justify-center gap-2">
            <Plus size={20} /> New Study
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <Settings size={22} /> Settings
          </button>
        </div>
      </div>

      {/* ================= PANE 2: SIDEBAR LIST ================= */}
      <div className="w-80 bg-[#F9FBFC] border-r border-slate-200 flex flex-col shrink-0 z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {activeTab === "chat" ? "Chat" : "Lodges"}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={activeTab === "chat" ? "Search Peers" : "Find a Lodge"}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="space-y-1">
              {users.length === 0 ? (
                <p className="text-center text-sm text-slate-400 mt-10">No peers found.</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      selectedUser?._id === user._id ? "bg-white shadow-sm ring-1 ring-slate-100" : "hover:bg-white/50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center font-bold text-white shadow-inner text-lg">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-slate-900 truncate pr-2">{user.displayName}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">10:42 AM</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">Tap to view conversation...</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* LODGE TAB */}
          {activeTab === "lodge" && (
            <>
              {/* My Lodges */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">My Lodges</h3>
                <div className="space-y-1">
                  {myLodges.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-2">You haven't joined any lodges yet.</p>
                  ) : (
                    myLodges.map((lodge) => (
                      <button
                        key={lodge._id}
                        onClick={() => setSelectedLodge(lodge)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          selectedLodge?._id === lodge._id ? "bg-white shadow-sm ring-1 ring-slate-100" : "hover:bg-white/50"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                          {lodge.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{lodge.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">{lodge.myRole}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Public Lodges (Discovery) */}
              <div className="pt-4 border-t border-slate-200/60">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Discover</h3>
                <div className="space-y-2 px-1">
                  {publicLodges.filter(pl => !myLodges.find(ml => ml._id === pl._id)).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-2">No new lodges to discover.</p>
                  ) : (
                    publicLodges
                      .filter(pl => !myLodges.find(ml => ml._id === pl._id))
                      .map((lodge) => (
                      <div key={lodge._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                            {lodge.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{lodge.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Users size={12}/> Public</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => joinLodge(lodge._id)}
                          disabled={isJoining}
                          className="w-full py-2 bg-slate-50 hover:bg-teal-50 text-teal-600 rounded-lg text-xs font-bold transition-colors border border-slate-100 hover:border-teal-200"
                        >
                          Join Lodge
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= PANE 3: MAIN WINDOW ================= */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/40">
        
        {/* STORIES STRIP (Only visible in Chat Tab) */}
        {activeTab === "chat" && (
          <div className="h-28 border-b border-slate-100/60 flex items-center px-8 gap-6 overflow-x-auto shrink-0 bg-white/60 backdrop-blur-md shadow-sm z-10">
            {/* Add Story Button */}
            <button onClick={handleAddStoryClick} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center text-teal-500 group-hover:bg-teal-50 group-hover:border-teal-400 transition-colors bg-white relative">
                <Plus size={24} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-teal-600 transition-colors">Add Story</span>
            </button>

            {/* Render Statuses */}
            {statuses.map(status => (
              <button 
                key={status._id} 
                onClick={() => setViewingStatus(status)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="h-16 w-16 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 shadow-sm group-hover:scale-105 transition-transform">
                  <div className="h-full w-full rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img 
                      src={status.user?.avatar || `https://ui-avatars.com/api/?name=${status.user?.displayName || "U"}&background=random`} 
                      alt="story" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 w-16 truncate text-center">{status.user?.displayName || "Unknown"}</span>
              </button>
            ))}
          </div>
        )}

        {/* State 1: CHAT is active but no user selected */}
        {activeTab === "chat" && !selectedUser && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="h-24 w-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-teal-200 mb-6">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Your Academic Nexus</h3>
            <p className="text-slate-500 mt-2 max-w-md">Select a peer from the sidebar to continue the conversation, share resources, or collaborate on your latest study.</p>
          </div>
        )}

        {/* State 2: CHAT is active and user selected */}
        {activeTab === "chat" && selectedUser && (
          <div className="flex-1 flex flex-col relative">
            <div className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center font-bold text-white shadow-sm">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedUser.displayName}</h3>
                  <p className="text-xs font-medium text-slate-500">Active Now</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-slate-400">
                <button className="hover:text-teal-600 transition-colors"><Phone size={22} /></button>
                <button className="hover:text-teal-600 transition-colors"><Video size={24} /></button>
                <button className="hover:text-teal-600 transition-colors"><Info size={22} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-32">
              <div className="text-center text-sm text-slate-400 mt-10">This is the beginning of your conversation with {selectedUser.displayName}.</div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-20">
              <div className="bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center p-2">
                <button className="p-3 text-slate-400 hover:text-teal-500 transition-colors bg-slate-50 rounded-full shrink-0"><Paperclip size={20} /></button>
                <input type="text" placeholder="Contribute to the conversation..." className="flex-1 bg-transparent px-4 focus:outline-none text-slate-700 placeholder:text-slate-400" />
                <div className="flex items-center gap-2 pr-2 shrink-0">
                  <button className="p-2 text-slate-400 hover:text-teal-500 transition-colors"><Smile size={22} /></button>
                  <button className="h-11 w-11 bg-[#00C2A8] hover:bg-[#00A891] rounded-full flex items-center justify-center text-white shadow-md transition-colors ml-1"><Send size={18} className="ml-1" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: LODGE is active but no lodge selected */}
        {activeTab === "lodge" && !selectedLodge && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 text-center px-4">
            <div className="h-24 w-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-indigo-200 mb-6">
              <Building2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Lodge Headquarters</h3>
            <p className="text-slate-500 mt-2 max-w-md">Join a public lodge from the sidebar to start collaborating on projects, or create your own study group.</p>
          </div>
        )}

        {/* State 4: LODGE is active and lodge selected */}
        {activeTab === "lodge" && selectedLodge && (
          <div className="flex-1 flex bg-white">
            {/* Lodge Channels Sidebar */}
            <div className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-200/50">
                <h3 className="font-bold text-slate-900 truncate">{selectedLodge.name}</h3>
                <p className="text-xs text-slate-500 truncate">{selectedLodge.description || "A student lodge"}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-2">Channels</div>
                {currentLodgeChannels.map(channel => (
                  <button 
                    key={channel._id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedChannel?._id === channel._id ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-200/50"}`}
                  >
                    <Hash size={16} className="text-slate-400" />
                    {channel.name}
                  </button>
                ))}
                {selectedLodge.myRole === 'captain' && (
                  <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors">
                    <Plus size={16} /> Add Channel
                  </button>
                )}
              </div>
            </div>

            {/* Lodge Chat Window */}
            <div className="flex-1 flex flex-col relative bg-white">
              <div className="h-16 border-b border-slate-100 flex items-center px-6 shrink-0 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Hash size={20} className="text-slate-400" />
                  {selectedChannel ? selectedChannel.name : "Select a channel"}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pb-28">
                {selectedChannel ? (
                  <div className="text-center mt-10">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Hash size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Welcome to #{selectedChannel.name}!</h2>
                    <p className="text-sm text-slate-500 mt-2">This is the start of the #{selectedChannel.name} channel.</p>
                  </div>
                ) : (
                  <div className="text-center text-sm text-slate-400 mt-10">Select a channel to start chatting.</div>
                )}
              </div>
              {selectedChannel && (
                 <div className="absolute bottom-6 left-6 right-6">
                   <div className="bg-slate-50 rounded-xl border border-slate-200 flex items-center p-2 focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-transparent transition-all">
                     <button className="p-2 text-slate-400 hover:text-teal-500 transition-colors rounded-lg"><Plus size={20} /></button>
                     <input type="text" placeholder={`Message #${selectedChannel.name}`} className="flex-1 bg-transparent px-2 py-1 focus:outline-none text-slate-700 text-sm placeholder:text-slate-400" />
                     <button className="p-2 text-teal-500 hover:bg-teal-50 transition-colors rounded-lg"><Send size={18} /></button>
                   </div>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* Story Creation Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create Status</h2>
              <button onClick={() => setIsStoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Media Preview / Upload Area */}
              <div 
                className="h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {storyPreview ? (
                  <img src={storyPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Plus size={32} className="text-teal-400 mb-2" />
                    <p className="text-sm font-bold text-slate-600">Add Image or Video</p>
                    <p className="text-xs text-slate-400">Optional</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange}
                />
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Caption / Status</label>
                <textarea 
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="What's on your mind? Share an update or thought..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handlePostStory}
                disabled={isCreatingStatus || (!storyText && !storyFile)}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isCreatingStatus ? <Loader2 size={18} className="animate-spin" /> : "Post Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewing Modal */}
      {viewingStatus && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 overflow-hidden border border-white/20">
                <img 
                  src={viewingStatus.user?.avatar || `https://ui-avatars.com/api/?name=${viewingStatus.user?.displayName || "U"}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white">
                <p className="font-bold text-sm">{viewingStatus.user?.displayName}</p>
                <p className="text-[10px] text-white/60">
                  {new Date(viewingStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button onClick={() => setViewingStatus(null)} className="text-white/70 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-md">
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            {viewingStatus.mediaType === "image" && (
              <img src={viewingStatus.mediaUrl} alt="Status" className="w-full h-full object-contain" />
            )}
            {viewingStatus.mediaType === "video" && (
              <video src={viewingStatus.mediaUrl} controls autoPlay className="w-full h-full object-contain" />
            )}
            
            {viewingStatus.textContent && (
              <div className={`absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent ${viewingStatus.mediaType === 'none' ? 'h-full flex items-center justify-center text-center from-transparent' : ''}`}>
                <p className={`text-white font-medium ${viewingStatus.mediaType === 'none' ? 'text-2xl px-6' : 'text-sm'}`}>
                  {viewingStatus.textContent}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
