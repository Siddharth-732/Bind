"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useLodgeStore } from "../store/useLodgeStore";
import { useStatusStore } from "../store/useStatusStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  Search,
  Building2,
  Compass,
  Heart,
  Bell,
  User,
  Settings,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Send,
  Plus,
  MessageSquare,
  Hash,
  Users,
  Loader2,
  LogOutIcon,
  X,
} from "lucide-react";

export default function ChatPage() {
  const {
    authUser,
    logout,
    connectSocket,
    disconnectSocket,
    updateAccountDetails,
    updateUserAvatar,
    updateUserBanner,
    isUpdatingProfile,
  } = useAuthStore();
  const { 
    selectedUser, 
    setSelectedUser,
    messages,
    isMessagesLoading,
    isSendingMessage,
    isTyping,
    getMessages,
    sendMessage,
    emitStartTyping,
    emitStopTyping,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();
  const {
    peers,
    pendingRequests,
    discoverUsers,
    getPeers,
    getPeerRequests,
    getDiscoverUsers,
    acceptPeerRequest,
    rejectPeerRequest,
    sendPeerRequest,
  } = useConnectionStore();

  // LODGE STORE
  const {
    publicLodges,
    myLodges,
    currentLodgeChannels,
    selectedLodge,
    selectedChannel,
    getPublicLodges,
    getMyLodges,
    joinLodge,
    setSelectedLodge,
    setSelectedChannel,
    isJoining,
    createLodge,
    isCreating,
    channelMessages,
    isChannelMessagesLoading,
    sendChannelMessage,
  } = useLodgeStore();

  // STATUS STORE
  const {
    statuses,
    getStatuses,
    createStatus,
    isCreatingStatus,
    subscribeToStatuses,
    unsubscribeFromStatuses,
  } = useStatusStore();

  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "chat" | "lodge" | "explore" | "notifications"
  >("chat");

  // Channel Messaging State
  const [channelMessageText, setChannelMessageText] = useState("");

  // Direct Messaging State
  const [chatMessageText, setChatMessageText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatMessageText(e.target.value);

    if (selectedUser) {
      emitStartTyping(selectedUser._id);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(selectedUser._id);
      }, 2000);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessageText.trim() || !selectedUser) return;
    const success = await sendMessage(selectedUser._id, chatMessageText);
    if (success) {
      setChatMessageText("");
      emitStopTyping(selectedUser._id);
    }
  };

  const handleSendChannelMessage = async () => {
    if (!channelMessageText.trim() || !selectedChannel) return;
    const success = await sendChannelMessage(
      selectedChannel._id,
      channelMessageText,
    );
    if (success) {
      setChannelMessageText("");
    }
  };

  // Lodge Creation State
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [lodgeName, setLodgeName] = useState("");
  const [lodgeDescription, setLodgeDescription] = useState("");
  const [lodgeAvatar, setLodgeAvatar] = useState<File | null>(null);
  const lodgeFileInputRef = useRef<HTMLInputElement>(null);

  // Story Creation State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storyText, setStoryText] = useState("");
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);

  // Active Story Viewing
  const [viewingStatus, setViewingStatus] = useState<any | null>(null);

  // Settings Profile State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsDisplayName, setSettingsDisplayName] = useState("");
  const [settingsBio, setSettingsBio] = useState("");
  const [settingsAvatarFile, setSettingsAvatarFile] = useState<File | null>(
    null,
  );
  const [settingsBannerFile, setSettingsBannerFile] = useState<File | null>(
    null,
  );
  const [settingsAvatarPreview, setSettingsAvatarPreview] = useState("");
  const [settingsBannerPreview, setSettingsBannerPreview] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current && activeTab === "chat") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Bouncer
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  // Direct Messages Subscription
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

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

  const handleCreateLodge = async () => {
    if (!lodgeName) return;
    const formData = new FormData();
    formData.append("name", lodgeName);
    formData.append("description", lodgeDescription);
    if (lodgeAvatar) formData.append("avatar", lodgeAvatar);

    const success = await createLodge(formData);
    if (success) {
      setIsLodgeModalOpen(false);
      setLodgeName("");
      setLodgeDescription("");
      setLodgeAvatar(null);
      // Optionally switch to lodge tab
      setActiveTab("lodge");
    }
  };

  const handleSaveProfile = async () => {
    // update text fields if changed
    if (
      settingsDisplayName !== authUser.displayName ||
      settingsBio !== authUser.bio
    ) {
      await updateAccountDetails({
        displayName: settingsDisplayName,
        bio: settingsBio,
      });
    }
    // update avatar if changed
    if (settingsAvatarFile) {
      await updateUserAvatar(settingsAvatarFile);
    }
    // update banner if changed
    if (settingsBannerFile) {
      await updateUserBanner(settingsBannerFile);
    }
    setIsSettingsModalOpen(false);
    setSettingsAvatarFile(null);
    setSettingsBannerFile(null);
  };

  if (!authUser) return null;

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* ================= PANE 1: GLOBAL NAVIGATION ================= */}
      <div className="w-[88px] hover:w-[260px] group transition-all duration-300 overflow-hidden bg-white flex flex-col justify-between py-6 shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 bg-[#007A99] text-white rounded-[10px] flex items-center justify-center font-bold text-xl">
              B
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                Bind
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Connect to Build
              </p>
            </div>
          </div>

          <nav className="flex flex-col pr-4 gap-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "chat" ? "bg-[#E5FFF5] text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {activeTab === "chat" && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600 rounded-r-full"></div>
              )}
              <div className="shrink-0">
                <MessageCircle size={20} strokeWidth={2} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Chat
              </span>
            </button>
            <button
              onClick={() => setActiveTab("lodge")}
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "lodge" ? "bg-[#E5FFF5] text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {activeTab === "lodge" && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600 rounded-r-full"></div>
              )}
              <div className="shrink-0">
                <Building2 size={20} strokeWidth={2} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Lodge
              </span>
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all ${activeTab === "explore" ? "bg-[#E5FFF5] text-teal-700 border-l-4 border-teal-500" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <div className="shrink-0">
                <Compass size={20} strokeWidth={2} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Explore
              </span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "notifications" ? "bg-[#E5FFF5] text-teal-700 border-l-4 border-teal-500" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <div className="shrink-0">
                <Bell size={20} strokeWidth={2} />
                {pendingRequests.length > 0 && (
                  <div className="absolute top-2 left-9 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Notifications
              </span>
            </button>
            <button
              onClick={() => {
                if (!authUser?.username) return;
                router.push(
                  `/profile/${encodeURIComponent(authUser.username)}`,
                );
              }}
              className="flex items-center gap-4 py-3 px-6 text-slate-600 hover:bg-slate-50 rounded-r-xl font-bold transition-all"
            >
              <div className="shrink-0">
                <User size={20} strokeWidth={2} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Profile
              </span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col pr-4 gap-1 mb-2">
          <button
            onClick={() => {
              setSettingsDisplayName(authUser?.displayName || "");
              setSettingsBio(authUser?.bio || "");
              setSettingsAvatarPreview(authUser?.avatar || "");
              setSettingsBannerPreview(authUser?.banner || "");
              setIsSettingsModalOpen(true);
            }}
            className="flex items-center gap-4 py-3 px-6 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-xl font-bold transition-all"
          >
            <div className="shrink-0">
              <Settings size={20} strokeWidth={2} />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Settings
            </span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-4 py-3 px-6 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-r-xl font-bold transition-all"
          >
            <div className="shrink-0">
              <LogOutIcon size={20} strokeWidth={2} />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* ================= PANE 2: SIDEBAR LIST ================= */}
      <div className="w-[320px] bg-[#F4F7F9] border-l border-r border-slate-200 flex flex-col shrink-0 z-10">
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
            {activeTab === "chat" ? "Chat" : "Lodges"}
          </h2>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder={
                activeTab === "chat" ? "Search Peers" : "Find a Lodge"
              }
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="space-y-3">
              {peers.length === 0 ? (
                <p className="text-center text-sm text-slate-400 mt-10">
                  No peers found. Head to Explore to find friends!
                </p>
              ) : (
                peers.map((user) => {
                  const isSelected = selectedUser?._id === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full flex items-center gap-3 p-4 rounded-[20px] transition-all text-left ${
                        isSelected
                          ? "bg-[#E5FFF5] shadow-sm border border-teal-200/60"
                          : "bg-white border border-slate-100 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-12 w-12 rounded-full bg-[#0099B3] flex items-center justify-center font-bold text-white text-lg">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-sm font-bold text-slate-900 truncate pr-2">
                            {user.displayName}
                          </p>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">
                            10:42 AM
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${isSelected ? "text-teal-700/80 font-medium" : "text-slate-500"}`}
                        >
                          Tap to view conversation...
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* LODGE TAB */}
          {activeTab === "lodge" && (
            <>
              {/* My Lodges */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  My Lodges
                </h3>
                <div className="space-y-3">
                  {myLodges.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-2">
                      You haven't joined any lodges yet.
                    </p>
                  ) : (
                    myLodges.map((lodge) => {
                      const isSelected = selectedLodge?._id === lodge._id;
                      return (
                        <button
                          key={lodge._id}
                          onClick={() => setSelectedLodge(lodge)}
                          className={`w-full flex items-center gap-3 p-4 rounded-[20px] transition-all text-left ${
                            isSelected
                              ? "bg-[#E5FFF5] shadow-sm border border-teal-200/60"
                              : "bg-white border border-slate-100 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <div className="h-12 w-12 rounded-[14px] bg-[#007A99] flex items-center justify-center font-bold text-white shadow-sm shrink-0 text-lg">
                            {lodge.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {lodge.name}
                            </p>
                            <p
                              className={`text-[10px] font-extrabold uppercase mt-0.5 ${isSelected ? "text-teal-600" : "text-slate-400"}`}
                            >
                              {lodge.myRole}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => setIsLodgeModalOpen(true)}
                  className="w-full mt-4 py-3 bg-[#007A99] hover:bg-[#00627A] text-white rounded-[16px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus size={20} /> New Lodge
                </button>
              </div>

              {/* Public Lodges (Discovery) */}
              <div className="pt-6 border-t border-slate-200/60 mt-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  Discover
                </h3>
                <div className="space-y-3">
                  {publicLodges.filter(
                    (pl) => !myLodges.find((ml) => ml._id === pl._id),
                  ).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-2">
                      No new lodges to discover.
                    </p>
                  ) : (
                    publicLodges
                      .filter((pl) => !myLodges.find((ml) => ml._id === pl._id))
                      .map((lodge) => (
                        <div
                          key={lodge._id}
                          className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-[14px] bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg">
                              {lodge.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {lodge.name}
                              </p>
                              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                <Users size={12} /> Public
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => joinLodge(lodge._id)}
                            disabled={isJoining}
                            className="w-full py-2 bg-slate-50 hover:bg-[#E5FFF5] text-teal-700 rounded-xl text-xs font-bold transition-colors border border-slate-100 hover:border-teal-200"
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
          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Pending Requests
              </h3>
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 mt-6">
                    No new notifications.
                  </p>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col gap-3 p-4 bg-white border border-slate-100 rounded-[20px] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {request.avatar &&
                          !request.avatar.includes("default") ? (
                            <img
                              src={request.avatar}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#0099B3] flex items-center justify-center text-white font-bold">
                              {request.displayName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {request.displayName}
                          </p>
                          <p className="text-xs text-slate-500">
                            wants to connect
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptPeerRequest(request._id)}
                          className="flex-1 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={14} /> Accept
                        </button>
                        <button
                          onClick={() => rejectPeerRequest(request._id)}
                          className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= PANE 3: MAIN WINDOW ================= */}

      {/* State 1: CHAT is active but no user selected */}
      {activeTab === "chat" && !selectedUser && (
        <div className="flex-1 flex flex-col bg-white">
          {/* STORIES STRIP (Only visible in Chat Tab) */}
          <div className="h-28 border-b border-slate-200 flex items-center px-8 gap-6 overflow-x-auto shrink-0 bg-white shadow-sm z-10">
            {/* Add Story Button */}
            <button
              onClick={handleAddStoryClick}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#0099B3] flex items-center justify-center text-[#0099B3] group-hover:bg-[#E5FFF5] transition-colors bg-white relative">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-700">
                Add Story
              </span>
            </button>

            {/* Render Statuses */}
            {statuses.map((status) => (
              <button
                key={status._id}
                onClick={() => setViewingStatus(status)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 to-[#0099B3]">
                  <div className="h-full w-full rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img
                      src={
                        status.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${status.user?.displayName || "U"}&background=random`
                      }
                      alt="story"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-700 w-16 truncate text-center">
                  {status.user?.displayName || "Unknown"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30">
            <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              Your Academic Nexus
            </h3>
            <p className="text-slate-500 mt-2 max-w-md font-medium">
              Select a peer from the sidebar to continue the conversation, share
              resources, or collaborate on your latest study.
            </p>
          </div>
        </div>
      )}

      {/* State 2: CHAT is active and user selected */}
      {activeTab === "chat" && selectedUser && (
        <div className="flex-1 flex flex-col relative bg-white">
          {/* STORIES STRIP (Only visible in Chat Tab) */}
          <div className="h-28 border-b border-slate-200 flex items-center px-8 gap-6 overflow-x-auto shrink-0 bg-white z-10">
            {/* Add Story Button */}
            <button
              onClick={handleAddStoryClick}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#0099B3] flex items-center justify-center text-[#0099B3] group-hover:bg-[#E5FFF5] transition-colors bg-white relative">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-800">
                Add Story
              </span>
            </button>

            {/* Render Statuses */}
            {statuses.map((status) => (
              <button
                key={status._id}
                onClick={() => setViewingStatus(status)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-[#0099B3] to-orange-500 shadow-sm group-hover:scale-105 transition-transform">
                  <div className="h-full w-full rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img
                      src={
                        status.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${status.user?.displayName || "U"}&background=random`
                      }
                      alt="story"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-800 w-16 truncate text-center">
                  {status.user?.displayName || "Unknown"}
                </span>
              </button>
            ))}
          </div>

          {/* CHAT HEADER */}
          <div className="h-[88px] bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#0099B3] flex items-center justify-center font-bold text-white text-xl">
                {selectedUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {selectedUser.displayName}
                </h3>
                <p className="text-[11px] font-bold text-slate-500">
                  Active Now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <button className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <Phone
                  size={18}
                  fill="currentColor"
                  className="text-slate-500"
                />
              </button>
              <button className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <Video
                  size={20}
                  fill="currentColor"
                  className="text-slate-500"
                />
              </button>
              <button className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <Info size={20} className="text-slate-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col bg-white">
            <div className="text-center text-[13px] font-bold text-slate-600 mb-10">
              This is the beginning of your conversation with{" "}
              {selectedUser.displayName}.
            </div>
            
            {isMessagesLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <Loader2 className="animate-spin text-teal-500" size={32} />
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === authUser?._id || msg.senderId?._id === authUser?._id;
                
                return (
                  <div
                    key={msg._id || index}
                    className={`flex flex-col mb-6 w-full ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-2 ${isMe ? "mr-14" : "ml-14"}`}
                    >
                      {!isMe && (
                        <span className="font-bold text-sm text-slate-900">
                          {selectedUser.displayName}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span className="font-bold text-sm text-[#007A99]">
                          You
                        </span>
                      )}
                    </div>

                    <div
                      className={`flex gap-4 max-w-[80%] ${isMe ? "justify-end" : ""}`}
                    >
                      {!isMe && (
                        <div className="h-10 w-10 rounded-[14px] bg-[#007A99] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                          {selectedUser.avatar && !selectedUser.avatar.includes("default") ? (
                            <img
                              src={selectedUser.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            selectedUser.displayName.charAt(0).toUpperCase() || <User size={20} />
                          )}
                        </div>
                      )}

                      <div
                        className={`px-5 py-4 text-[15px] leading-relaxed ${isMe ? "bg-[#E6EAFC] text-slate-800 rounded-[20px] rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm"}`}
                      >
                        {msg.content}
                      </div>

                      {isMe && (
                        <div className="h-10 w-10 rounded-[14px] bg-slate-800 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                          {authUser?.avatar && !authUser.avatar.includes("default") ? (
                            <img
                              src={authUser.avatar}
                              alt="Me"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            authUser?.displayName?.charAt(0).toUpperCase() || <User size={20} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex flex-col mb-6 w-full items-start">
                <div className="flex items-center gap-2 mb-2 ml-14">
                  <span className="font-bold text-sm text-slate-900">
                    {selectedUser.displayName}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 italic">
                    typing...
                  </span>
                </div>
                <div className="flex gap-4 max-w-[80%]">
                  <div className="h-10 w-10 rounded-[14px] bg-[#007A99] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                    {selectedUser.avatar && !selectedUser.avatar.includes("default") ? (
                      <img
                        src={selectedUser.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedUser.displayName.charAt(0).toUpperCase() || <User size={20} />
                    )}
                  </div>
                  <div className="px-5 py-4 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* CHAT INPUT */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-20">
            <div className="bg-white rounded-full shadow-lg border border-slate-200 flex items-center p-2 pl-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={chatMessageText}
                onChange={handleChatInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
                placeholder="Contribute to the conversation..."
                className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 font-medium placeholder:text-slate-500 text-[15px]"
              />
              <div className="flex items-center gap-2 pr-1 shrink-0">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Smile size={22} />
                </button>
                <button 
                  onClick={handleSendChatMessage}
                  disabled={isSendingMessage}
                  className="h-10 w-10 bg-[#0099B3] hover:bg-[#007A99] disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-md transition-colors"
                >
                  {isSendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: LODGE is active but no lodge selected */}
      {activeTab === "lodge" && !selectedLodge && (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-center px-4">
          <div className="h-24 w-24 bg-white rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-6">
            <Building2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            Lodge Headquarters
          </h3>
          <p className="text-slate-500 mt-2 max-w-md font-medium">
            Join a public lodge from the sidebar to start collaborating on
            projects, or create your own study group.
          </p>
        </div>
      )}

      {/* State 4: LODGE is active and lodge selected */}
      {activeTab === "lodge" && selectedLodge && (
        <div className="flex-1 flex bg-white">
          {/* Lodge Channels Sidebar */}
          <div className="w-64 bg-[#F9FAFB] border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-extrabold text-lg text-slate-900 truncate">
                {selectedLodge.name}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1 truncate">
                {selectedLodge.description || "A student lodge"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-2 pt-2">
                Channels
              </div>
              {currentLodgeChannels.map((channel) => (
                <button
                  key={channel._id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-bold transition-colors ${selectedChannel?._id === channel._id ? "bg-[#E5FFF5] text-teal-700" : "text-slate-600 hover:bg-slate-200/50"}`}
                >
                  <Hash
                    size={18}
                    className={
                      selectedChannel?._id === channel._id
                        ? "text-teal-600"
                        : "text-slate-400"
                    }
                  />
                  {channel.name}
                </button>
              ))}
              {selectedLodge.myRole === "captain" && (
                <button className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-[12px] text-sm font-bold text-teal-600 hover:bg-[#E5FFF5] transition-colors">
                  <Plus size={18} /> Add Channel
                </button>
              )}
            </div>
          </div>

          {/* Lodge Chat Window */}
          <div className="flex-1 flex flex-col relative bg-white">
            <div className="h-[88px] border-b border-slate-100 flex items-center px-8 shrink-0">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Hash size={24} className="text-slate-400" />
                {selectedChannel ? selectedChannel.name : "Select a channel"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col">
              {selectedChannel ? (
                <>
                  <div className="text-center mt-10 mb-8">
                    <div className="h-20 w-20 bg-[#F4F7F9] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Hash size={36} className="text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      Welcome to #{selectedChannel.name}!
                    </h2>
                    <p className="text-[15px] font-medium text-slate-500 mt-2">
                      This is the start of the #{selectedChannel.name} channel.
                    </p>
                  </div>

                  {isChannelMessagesLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                      <Loader2
                        className="animate-spin text-teal-500"
                        size={32}
                      />
                    </div>
                  ) : (
                    channelMessages.map((msg, index) => {
                      const isMe = msg.senderId?._id === authUser?._id;
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex flex-col mb-6 w-full ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`flex items-center gap-2 mb-2 ${isMe ? "mr-14" : "ml-14"}`}
                          >
                            {!isMe && (
                              <span className="font-bold text-sm text-slate-900">
                                {msg.senderId?.displayName}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <span className="font-bold text-sm text-[#007A99]">
                                You
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex gap-4 max-w-[80%] ${isMe ? "justify-end" : ""}`}
                          >
                            {!isMe && (
                              <div className="h-10 w-10 rounded-[14px] bg-[#007A99] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                                {msg.senderId?.avatar ? (
                                  <img
                                    src={msg.senderId.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  msg.senderId?.displayName
                                    ?.charAt(0)
                                    .toUpperCase() || <User size={20} />
                                )}
                              </div>
                            )}

                            <div
                              className={`px-5 py-4 text-[15px] leading-relaxed ${isMe ? "bg-[#E6EAFC] text-slate-800 rounded-[20px] rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm"}`}
                            >
                              {msg.content}
                            </div>

                            {isMe && (
                              <div className="h-10 w-10 rounded-[14px] bg-slate-800 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                                {authUser?.avatar ? (
                                  <img
                                    src={authUser.avatar}
                                    alt="Me"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  authUser?.displayName
                                    ?.charAt(0)
                                    .toUpperCase() || <User size={20} />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (
                <div className="text-center text-[15px] font-medium text-slate-400 mt-10">
                  Select a channel to start chatting.
                </div>
              )}
            </div>
            {selectedChannel && (
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white rounded-full shadow-lg border border-slate-200 flex items-center p-2 focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-transparent transition-all">
                  <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors rounded-full shrink-0">
                    <Plus size={20} />
                  </button>
                  <input
                    type="text"
                    value={channelMessageText}
                    onChange={(e) => setChannelMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendChannelMessage();
                    }}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 font-medium text-[15px] placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleSendChannelMessage}
                    className="h-10 w-10 bg-[#0099B3] hover:bg-[#007A99] transition-colors rounded-full flex items-center justify-center text-white shrink-0 mr-1"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* State 4: EXPLORE is active */}
      {activeTab === "explore" && (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Explore Nexus
              </h2>
              <p className="text-slate-500 font-medium mt-2">
                Discover new peers, lodges, and see what everyone is up to.
              </p>
            </div>

            {/* People You Might Know */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User size={20} className="text-[#0099B3]" /> People You Might
                  Know
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverUsers.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No new users to discover right now.
                  </p>
                ) : (
                  discoverUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {user.avatar && !user.avatar.includes("default") ? (
                          <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0099B3] flex items-center justify-center text-white font-bold">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.bio || "Student at Nexus"}
                        </p>
                      </div>
                      <button
                        onClick={() => sendPeerRequest(user._id)}
                        className="p-2 bg-[#E5FFF5] text-teal-700 hover:bg-teal-100 rounded-xl transition-colors shrink-0"
                        title="Connect"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommended Lodges */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 size={20} className="text-[#0099B3]" /> Recommended
                  Lodges
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicLodges.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No public lodges available.
                  </p>
                ) : (
                  publicLodges.map((lodge) => (
                    <div
                      key={lodge._id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                          {lodge.avatar ? (
                            <img
                              src={lodge.avatar}
                              alt="lodge"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                              {lodge.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {lodge.name}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Users size={12} /> {lodge.members?.length || 1}{" "}
                            Members
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {lodge.description}
                      </p>
                      <button
                        onClick={() => joinLodge(lodge._id)}
                        disabled={isJoining}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors"
                      >
                        Join Lodge
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 5: NOTIFICATIONS is active */}
      {activeTab === "notifications" && (
        <div className="flex-1 flex flex-col bg-white items-center justify-center text-center px-4">
          <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            Notifications Center
          </h3>
          <p className="text-slate-500 mt-2 max-w-md font-medium">
            Manage your peer connection requests from the sidebar. Accept
            requests to grow your network and start chatting!
          </p>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                Profile Settings
              </h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="w-full bg-white relative">
              {/* Banner Area */}
              <div
                className="h-32 w-full bg-slate-200 relative group cursor-pointer overflow-hidden"
                onClick={() => bannerInputRef.current?.click()}
              >
                {settingsBannerPreview ? (
                  <img
                    src={settingsBannerPreview}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-teal-400 to-blue-500"></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    Change Banner
                  </span>
                </div>
                <input
                  type="file"
                  ref={bannerInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSettingsBannerFile(file);
                      const reader = new FileReader();
                      reader.onload = () =>
                        setSettingsBannerPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Avatar Area (Overlapping) */}
              <div className="absolute left-6 top-20 flex items-end">
                <div
                  className="h-20 w-20 rounded-full bg-white border-4 border-white shadow-md relative group cursor-pointer overflow-hidden"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <img
                    src={
                      settingsAvatarPreview ||
                      `https://ui-avatars.com/api/?name=${authUser?.displayName}&background=random`
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus size={20} className="text-white" />
                  </div>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSettingsAvatarFile(file);
                        const reader = new FileReader();
                        reader.onload = () =>
                          setSettingsAvatarPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-12 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settingsDisplayName}
                  onChange={(e) => setSettingsDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0099B3] text-sm font-medium"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Bio
                </label>
                <textarea
                  value={settingsBio}
                  onChange={(e) => setSettingsBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#0099B3] text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile || !settingsDisplayName}
                className="px-6 py-3 bg-[#007A99] hover:bg-[#00627A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isUpdatingProfile ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lodge Creation Modal */}
      {isLodgeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                Create a Lodge
              </h2>
              <button
                onClick={() => setIsLodgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div
                  className="h-24 w-24 rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors relative"
                  onClick={() => lodgeFileInputRef.current?.click()}
                >
                  {lodgeAvatar ? (
                    <img
                      src={URL.createObjectURL(lodgeAvatar)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={32} className="text-[#0099B3]" />
                  )}
                  <input
                    type="file"
                    ref={lodgeFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setLodgeAvatar(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Lodge Name
                </label>
                <input
                  type="text"
                  value={lodgeName}
                  onChange={(e) => setLodgeName(e.target.value)}
                  placeholder="e.g. CS101 Study Group"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0099B3] text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={lodgeDescription}
                  onChange={(e) => setLodgeDescription(e.target.value)}
                  placeholder="What is this lodge about?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#0099B3] text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCreateLodge}
                disabled={isCreating || !lodgeName}
                className="px-6 py-3 bg-[#007A99] hover:bg-[#00627A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isCreating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Create Lodge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Creation Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                Create Status
              </h2>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Media Preview / Upload Area */}
              <div
                className="h-48 rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {storyPreview ? (
                  <img
                    src={storyPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Plus size={36} className="text-[#0099B3] mb-3" />
                    <p className="text-sm font-bold text-slate-700">
                      Add Image or Video
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Optional
                    </p>
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
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Caption / Status
                </label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="What's on your mind? Share an update or thought..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#0099B3] text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handlePostStory}
                disabled={isCreatingStatus || (!storyText && !storyFile)}
                className="px-6 py-3 bg-[#007A99] hover:bg-[#00627A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isCreatingStatus ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Post Status"
                )}
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
              <div className="h-12 w-12 rounded-full bg-slate-800 overflow-hidden border border-white/20">
                <img
                  src={
                    viewingStatus.user?.avatar ||
                    `https://ui-avatars.com/api/?name=${viewingStatus.user?.displayName || "U"}`
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white">
                <p className="font-extrabold text-[15px]">
                  {viewingStatus.user?.displayName}
                </p>
                <p className="text-[11px] font-bold text-white/60">
                  {new Date(viewingStatus.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewingStatus(null)}
              className="text-white/70 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 rounded-[32px] overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            {viewingStatus.mediaType === "image" && (
              <img
                src={viewingStatus.mediaUrl}
                alt="Status"
                className="w-full h-full object-contain"
              />
            )}
            {viewingStatus.mediaType === "video" && (
              <video
                src={viewingStatus.mediaUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}

            {viewingStatus.textContent && (
              <div
                className={`absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent ${viewingStatus.mediaType === "none" ? "h-full flex items-center justify-center text-center from-transparent via-transparent bg-slate-800" : ""}`}
              >
                <p
                  className={`text-white font-medium ${viewingStatus.mediaType === "none" ? "text-2xl px-6" : "text-[15px] leading-relaxed"}`}
                >
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
