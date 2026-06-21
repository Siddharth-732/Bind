"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useLodgeStore } from "../store/useLodgeStore";
import { useStatusStore } from "../store/useStatusStore";
import { usePeerStore } from "../store/usePeerStore";
import { usePostStore } from "../store/usePostStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  Search,
  Building2,
  Compass,
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
  ChevronRight,
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Tag,
  UserPlus,
  Crown,
  Shield,
  Star,
  UserCircle,
  Palette,
  Settings2,
  Lock,
} from "lucide-react";
import PostCard from "../components/PostCard";
import AvatarSelectionModal from "../components/AvatarSelectionModal";

export default function ChatPage() {
  const {
    authUser,
    logout,
    updateAccountDetails,
    updateUserAvatar,
    updateUserBanner,
    changePassword,
    isUpdatingProfile,
    onlineUsers,
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
    unsubscribeFromMessages,
  } = useChatStore();
  const {
    peers,
    peerRequests,
    suggestedPeers,
    getPeers,
    getPeerRequests,
    getSuggestedPeers,
    sendPeerRequest,
    acceptPeerRequest,
    rejectPeerRequest,
  } = usePeerStore();

  // LODGE STORE
  const {
    publicLodges,
    myLodges,
    currentLodgeChannels,
    currentLodgeMembers,
    selectedLodge,
    selectedChannel,
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
  const { statuses, createStatus, isCreatingStatus } = useStatusStore();

  // POST STORE
  const {
    posts,
    isLoadingPosts,
    isCreatingPost,
    getGlobalFeed,
    createPost,
    toggleLike,
  } = usePostStore();

  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "chat" | "lodge" | "explore" | "notifications"
  >("chat");
  const [defaultLodgeChannel, setDefaultLodgeChannel] = useState("Lodge Info");

  // Channel Messaging State
  const [channelMessageText, setChannelMessageText] = useState("");

  // Direct Messaging State
  const [chatMessageText, setChatMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Post Creation State
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postTags, setPostTags] = useState("");
  const postImageInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    const formData = new FormData();
    formData.append("content", postContent);
    if (postImage) formData.append("image", postImage);
    if (postTags) formData.append("tags", postTags);

    const success = await createPost(formData);
    if (success) {
      setPostContent("");
      setPostImage(null);
      setPostTags("");
    }
  };

  // Trigger Explore Search Debounced & Fetch Global Feed
  useEffect(() => {
    if (activeTab === "explore") {
      getGlobalFeed();
      const timer = setTimeout(() => {
        usePeerStore.getState().getSuggestedPeers(searchQuery);
        useLodgeStore.getState().getPublicLodges(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab, getGlobalFeed]);

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
  const [lodgeModalTab, setLodgeModalTab] = useState<"discover" | "create">(
    "discover",
  );
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
  const [viewingStatus, setViewingStatus] = useState<
    import("../store/useStatusStore").Status | null
  >(null);

  // Members Sidebar State
  const [isMembersSidebarOpen, setIsMembersSidebarOpen] = useState(true);

  // Settings Profile State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "account" | "profiles" | "data_privacy" | "appearance" | "language"
  >("account");
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
  const [isSettingsAvatarModalOpen, setIsSettingsAvatarModalOpen] =
    useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<
    "username" | "email" | "phone" | "password" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");

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
    if (!authUser) return;
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

  const handleSaveInlineField = async (
    field: "username" | "email" | "phone",
  ) => {
    if (!authUser || !editValue) return;
    const success = await updateAccountDetails({ [field]: editValue });
    if (success) {
      setEditingField(null);
    }
  };

  const handleSavePassword = async () => {
    if (!editOldPassword || !editNewPassword) return;
    const success = await changePassword({
      oldPassword: editOldPassword,
      newPassword: editNewPassword,
    });
    if (success) {
      setEditingField(null);
      setEditOldPassword("");
      setEditNewPassword("");
    }
  };

  if (!authUser) return null;

  const fetchedModerators =
    currentLodgeMembers?.filter((m) => m.role === "captain") || [];

  const members =
    currentLodgeMembers?.filter((m) => m.role !== "captain") || [];

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* ================= PANE 1: GLOBAL NAVIGATION ================= */}
      <div className="w-[88px] hover:w-[260px] group transition-all duration-300 overflow-hidden bg-white flex flex-col justify-between py-6 shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 bg-[#3B82F6] text-white rounded-[10px] flex items-center justify-center font-bold text-xl">
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
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "chat" ? "bg-[#EFF6FF] text-[#3B82F6]" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {activeTab === "chat" && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3B82F6] rounded-r-full"></div>
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
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "lodge" ? "bg-[#EFF6FF] text-[#3B82F6] " : "text-slate-600 hover:bg-slate-50"}`}
            >
              {activeTab === "lodge" && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3B82F6] rounded-r-full"></div>
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
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all ${activeTab === "explore" ? "bg-[#EFF6FF] text-[#3B82F6] border-l-4 border-blue-500" : "text-slate-600 hover:bg-slate-50"}`}
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
              className={`flex items-center gap-4 py-3 px-6 rounded-r-xl font-bold transition-all relative ${activeTab === "notifications" ? "bg-[#EFF6FF] text-[#3B82F6] border-l-4 border-blue-500" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <div className="shrink-0">
                <Bell size={20} strokeWidth={2} />
                {peerRequests.length > 0 && (
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
      {activeTab === "lodge" ? (
        <div className="w-[72px] bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 shrink-0 z-10 gap-3 overflow-y-auto">
          {myLodges.map((lodge) => {
            const isSelected = selectedLodge?._id === lodge._id;
            return (
              <button
                key={lodge._id}
                onClick={() => setSelectedLodge(lodge)}
                className="relative group w-full flex justify-center"
                title={lodge.name}
              >
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#3B82F6] rounded-r-full"></div>
                )}
                {!isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-300 rounded-r-full opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-300"></div>
                )}
                <div
                  className={`w-12 h-12 flex items-center justify-center font-bold text-lg overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? "rounded-[16px] bg-[#3B82F6] text-white shadow-md"
                      : "rounded-full bg-white text-slate-500 border border-slate-200 group-hover:rounded-[16px] group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-transparent group-hover:shadow-md"
                  }`}
                >
                  {lodge.avatar && !lodge.avatar.includes("default") ? (
                    <img
                      src={lodge.avatar}
                      alt={lodge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    lodge.name.charAt(0).toUpperCase()
                  )}
                </div>
              </button>
            );
          })}
          <div className="w-8 h-[2px] bg-slate-200 my-1 rounded-full shrink-0"></div>
          <button
            onClick={() => setIsLodgeModalOpen(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-dashed border-slate-300 text-slate-400 hover:text-[#3B82F6] hover:border-[#3B82F6] hover:bg-blue-50 transition-all duration-300 shrink-0"
            title="Add a Lodge"
          >
            <Plus size={24} />
          </button>
        </div>
      ) : activeTab === "explore" ? null : (
        <div className="w-[320px] bg-[#F4F7F9] border-l border-r border-slate-200 flex flex-col shrink-0 z-10">
          <div className="p-6 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              {activeTab === "chat"
                ? "Chat"
                : activeTab === "notifications"
                  ? "Notifications"
                  : "Explore"}
            </h2>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  activeTab === "chat" ? "Search Peers" : "Search..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm placeholder:text-slate-400"
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
                  peers
                    .filter(
                      (user) =>
                        user.displayName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        user.username
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    )
                    .map((user) => {
                      const isSelected = selectedUser?._id === user._id;
                      return (
                        <button
                          key={user._id}
                          onClick={() => setSelectedUser(user)}
                          className={`w-full flex items-center gap-3 p-4 rounded-[20px] transition-all text-left ${
                            isSelected
                              ? "bg-[#EFF6FF] shadow-sm border border-blue-200/60"
                              : "bg-white border border-slate-100 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="h-12 w-12 rounded-full bg-[#3B82F6] flex items-center justify-center font-bold text-white text-lg overflow-hidden">
                              {user.avatar &&
                              !user.avatar.includes("default") ? (
                                <img
                                  src={user.avatar}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user.displayName.charAt(0).toUpperCase()
                              )}
                            </div>
                            {onlineUsers.includes(user._id) && (
                              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
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
                              className={`text-xs truncate ${isSelected ? "text-[#3B82F6]/80 font-medium" : "text-slate-500"}`}
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
            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  Pending Requests
                </h3>
                <div className="space-y-3">
                  {peerRequests.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 mt-6">
                      No new notifications.
                    </p>
                  ) : (
                    peerRequests.map((request) => (
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
                              <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">
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
                            className="flex-1 py-2 bg-blue-50 text-[#3B82F6] hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
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
      )}

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
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#0099B3] flex items-center justify-center text-[#3B82F6] group-hover:bg-[#EFF6FF] transition-colors bg-white relative">
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
              Your Academic Townhall
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
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#0099B3] flex items-center justify-center text-[#3B82F6] group-hover:bg-[#EFF6FF] transition-colors bg-white relative">
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
          <div className="h-[88px] bg-gray-100 border-b border-slate-100 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#3B82F6] flex items-center justify-center font-bold text-white text-xl overflow-hidden">
                {selectedUser.avatar &&
                !selectedUser.avatar.includes("default") ? (
                  <img
                    src={selectedUser.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedUser.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {selectedUser.displayName}
                </h3>
                <p className="text-[11px] font-bold text-slate-500">
                  {onlineUsers.includes(selectedUser._id)
                    ? "Active Now"
                    : "Offline"}
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
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              messages.map((msg, index) => {
                const senderIdStr =
                  typeof msg.senderId === "string"
                    ? msg.senderId
                    : (msg.senderId as { _id?: string })?._id;
                const isMe = senderIdStr === authUser?._id;

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
                        <span className="font-bold text-sm text-[#3B82F6]">
                          You
                        </span>
                      )}
                    </div>

                    <div
                      className={`flex gap-4 max-w-[80%] ${isMe ? "justify-end" : ""}`}
                    >
                      {!isMe && (
                        <div className="h-10 w-10 rounded-[14px] bg-[#3B82F6] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                          {selectedUser.avatar &&
                          !selectedUser.avatar.includes("default") ? (
                            <img
                              src={selectedUser.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            selectedUser.displayName
                              .charAt(0)
                              .toUpperCase() || <User size={20} />
                          )}
                        </div>
                      )}

                      <div
                        className={`px-5 py-4 text-[15px] leading-relaxed transition-all duration-500 ${
                          !isMe
                            ? "bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm"
                            : msg.isRead
                              ? "bg-gradient-to-r from-[#0099B3] to-[#0099B3] text-white rounded-[20px] rounded-tr-sm shadow-md shadow-[#0099B3]/20"
                              : msg.isDelivered
                                ? "bg-[#E6EAFC] text-slate-800 rounded-[20px] rounded-tr-sm border border-transparent"
                                : "bg-slate-50 border border-slate-200 text-slate-500 rounded-[20px] rounded-tr-sm"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {isMe && (
                        <div className="h-10 w-10 rounded-[14px] bg-slate-800 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                          {authUser?.avatar &&
                          !authUser.avatar.includes("default") ? (
                            <img
                              src={authUser.avatar}
                              alt="Me"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            authUser?.displayName?.charAt(0).toUpperCase() || (
                              <User size={20} />
                            )
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
                  <div className="h-10 w-10 rounded-[14px] bg-[#3B82F6] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                    {selectedUser.avatar &&
                    !selectedUser.avatar.includes("default") ? (
                      <img
                        src={selectedUser.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedUser.displayName.charAt(0).toUpperCase() || (
                        <User size={20} />
                      )
                    )}
                  </div>
                  <div className="px-5 py-4 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
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
                  className="h-10 w-10 bg-[#3B82F6] hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-md transition-colors"
                >
                  {isSendingMessage ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} className="ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3 & 4: LODGE is active */}
      {activeTab === "lodge" && (
        <div className="flex-1 flex bg-white">
          {/* Lodge Channels Sidebar */}
          <div className="w-60 bg-[#E2E8F0]/30 border-r border-slate-200 flex flex-col justify-between shrink-0">
            {selectedLodge ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200/50 hover:bg-slate-200/30 cursor-pointer transition-colors flex items-center justify-between">
                  <h3 className="font-extrabold text-[15px] text-slate-800 truncate">
                    {selectedLodge.name}
                  </h3>
                  <div className="text-slate-500">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  <div className="flex items-center justify-between px-1 mt-2 mb-1 group cursor-pointer">
                    <div className="text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 uppercase">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      CHANNELS
                    </div>
                    {selectedLodge.myRole === "captain" && (
                      <Plus
                        size={14}
                        className="text-slate-400 hover:text-slate-700"
                      />
                    )}
                  </div>
                  {currentLodgeChannels.map((channel) => (
                    <button
                      key={channel._id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[14px] font-semibold transition-colors ${selectedChannel?._id === channel._id ? "bg-[#E6F7FF]/60 text-slate-800" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"}`}
                    >
                      <Hash size={18} className="text-slate-400 shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}

                  <div className="flex items-center justify-between px-1 mt-6 mb-1 group cursor-pointer">
                    <div className="text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 uppercase">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      VOICE
                    </div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[14px] font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 transition-colors">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <span className="truncate">Study Hall</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-500 border-r border-slate-200 w-60">
                {/* Default Server Header */}
                <div className="p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between text-slate-900 shadow-sm">
                  <h3 className="font-extrabold text-[15px] truncate">
                    Welcome
                  </h3>
                  <div className="text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                  {/* Category: Welcome */}
                  <div>
                    <div className="flex items-center px-1 mb-1 group cursor-pointer hover:text-slate-700">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <span className="text-[12px] font-bold uppercase tracking-wide">
                        Welcome
                      </span>
                    </div>
                    <button
                      onClick={() => setDefaultLodgeChannel("Lodge Info")}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] font-medium transition-colors ${defaultLodgeChannel === "Lodge Info" ? "bg-blue-50 text-blue-600" : "hover:bg-slate-200/50 hover:text-slate-800"}`}
                    >
                      <span className="text-xl shrink-0">🌞</span>
                      <span className="truncate">Lodge Info</span>
                    </button>
                  </div>

                  {/* Category: General */}
                  <div>
                    <div className="flex items-center px-1 mb-1 group cursor-pointer hover:text-slate-700">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <span className="text-[12px] font-bold uppercase tracking-wide">
                        General
                      </span>
                    </div>
                    {[
                      {
                        id: "announcements",
                        icon: "📢",
                        name: "announcements",
                      },
                      { id: "general", icon: "🌱", name: "general" },
                      { id: "rules", icon: "📜", name: "rules" },
                      { id: "roles", icon: "👤", name: "roles" },
                      { id: "self-promo", icon: "🔰", name: "self-promo" },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setDefaultLodgeChannel(ch.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] font-medium transition-colors ${defaultLodgeChannel === ch.id ? "bg-blue-50 text-blue-600" : "hover:bg-slate-200/50 hover:text-slate-800"}`}
                      >
                        <span className="text-lg shrink-0 w-6 text-center">
                          {ch.icon}
                        </span>
                        <span className="truncate">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lodge Chat Window */}
          <div className="flex-1 flex bg-white overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 relative">
              {selectedChannel ? (
                <>
                  <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 shadow-sm">
                    <h3 className="font-bold text-[15px] text-slate-800 flex items-center gap-2">
                      <Hash size={20} className="text-slate-400" />
                      {selectedChannel.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-400">
                      <button className="hover:text-slate-600 transition-colors">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                      </button>
                      <button className="hover:text-slate-600 transition-colors">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="17" x2="12" y2="22"></line>
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setIsMembersSidebarOpen(!isMembersSidebarOpen)
                        }
                        className={`transition-colors ${isMembersSidebarOpen ? "text-[#3B82F6]" : "hover:text-slate-600"}`}
                      >
                        <Users size={20} />
                      </button>
                      <div className="relative ml-2">
                        <Search
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-36 bg-slate-100 border border-transparent rounded-md py-1 pl-8 pr-2 text-xs focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <button className="hover:text-slate-600 transition-colors ml-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 pb-32 flex flex-col">
                    <div className="mt-6 mb-8">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Hash size={32} className="text-slate-400" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-900">
                        Welcome to #{selectedChannel.name}!
                      </h2>
                      <p className="text-[15px] font-medium text-slate-500 mt-2">
                        This is the start of the #{selectedChannel.name}{" "}
                        channel.
                      </p>
                    </div>

                    {isChannelMessagesLoading ? (
                      <div className="flex-1 flex justify-center items-center">
                        <Loader2
                          className="animate-spin text-blue-500"
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
                                  {msg.senderId?.displayName || "Unknown"}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-500">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {isMe && (
                                <span className="font-bold text-sm text-[#3B82F6]">
                                  You
                                </span>
                              )}
                            </div>

                            <div
                              className={`flex gap-4 max-w-[80%] ${isMe ? "justify-end" : ""}`}
                            >
                              {!isMe && (
                                <div className="h-10 w-10 rounded-[14px] bg-[#3B82F6] flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                                  {msg.senderId?.avatar &&
                                  !msg.senderId.avatar.includes("default") ? (
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
                                className={`px-5 py-4 text-[15px] leading-relaxed transition-all duration-500 ${
                                  !isMe
                                    ? "bg-white border border-slate-200 text-slate-700 rounded-[20px] rounded-tl-sm shadow-sm"
                                    : "bg-[#E6EAFC] text-slate-800 rounded-[20px] rounded-tr-sm border border-transparent"
                                }`}
                              >
                                {msg.content}
                              </div>

                              {isMe && (
                                <div className="h-10 w-10 rounded-[14px] bg-slate-800 flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
                                  {authUser?.avatar &&
                                  !authUser.avatar.includes("default") ? (
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
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-slate-100 rounded-lg flex items-center p-1 pl-3 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full shrink-0">
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
                        className="flex-1 bg-transparent px-3 py-2.5 focus:outline-none text-slate-700 font-medium text-[15px] placeholder:text-slate-500"
                      />
                      <div className="flex items-center gap-1 pr-2 shrink-0">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <Smile size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-800 bg-white h-full p-8">
                  {/* Mock content based on defaultLodgeChannel */}
                  {defaultLodgeChannel === "Lodge Info" && (
                    <div className="max-w-2xl text-center space-y-6">
                      <div className="w-24 h-24 bg-[#3B82F6] rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-8">
                        <span className="text-5xl">🌞</span>
                      </div>
                      <h2 className="text-4xl font-extrabold text-slate-900">
                        Welcome to the Lodge Space!
                      </h2>
                      <p className="text-slate-600 text-lg leading-relaxed font-medium">
                        A Lodge is a dedicated community hub designed for you
                        and your peers to connect, collaborate, and share ideas.
                        Whether you are studying together, building a project,
                        or just hanging out, Lodges give you the structured
                        environment you need to thrive.
                      </p>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left mt-8 shadow-sm">
                        <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                          <Info size={18} className="text-[#3B82F6]" /> Getting
                          Started
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          We&apos;ve set up a few template channels to show you
                          how a Lodge is organized. Take a look around:
                        </p>
                        <ul className="text-slate-600 text-sm space-y-3 list-disc pl-5">
                          <li>
                            <strong className="text-slate-900">
                              # announcements
                            </strong>
                            : Check out how server owners can broadcast
                            important updates to all members.
                          </li>
                          <li>
                            <strong className="text-slate-900"># roles</strong>:
                            Discover how Lodge hierarchies work, from Captain
                            down to Junior members.
                          </li>
                          <li>
                            <strong className="text-slate-900">
                              # general
                            </strong>
                            : Where the day-to-day casual chat happens.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {defaultLodgeChannel === "announcements" && (
                    <div className="w-full max-w-4xl h-full flex flex-col justify-end pb-8">
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                        Welcome to #announcements!
                      </h2>
                      <p className="text-slate-500 font-medium mb-8">
                        This is the start of the #announcements channel.
                      </p>

                      <div className="flex gap-4 mt-6 hover:bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold shrink-0">
                          D
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-baseline gap-2">
                            Developer{" "}
                            <span className="text-xs font-medium text-slate-400">
                              Today at 10:00 AM
                            </span>
                          </p>
                          <p className="text-slate-700 mt-1">
                            Welcome everyone! We&apos;ve just launched the new
                            Global Feed feature. Check it out on the Explore
                            tab!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {defaultLodgeChannel === "roles" && (
                    <div className="w-full max-w-4xl h-full flex flex-col justify-start pt-4 pb-8 overflow-y-auto">
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 shrink-0">
                        Lodge Hierarchy & Roles
                      </h2>
                      <p className="text-slate-600 font-medium text-lg mb-8 leading-relaxed shrink-0">
                        A lodge is a space for brilliant minds to come together
                        to build something great or to discuss something new or
                        maybe just relax and have a fun chat. But every group
                        needs order, so in a lodge there are dedicated roles
                        assigned to each member:
                      </p>

                      <div className="flex flex-col gap-4">
                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 mb-2">
                            <Crown size={20} className="text-amber-500" />{" "}
                            Captain
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            The creator of the lodge. There can be only one
                            captain. The captain can only pass their position to
                            a Vice Captain. (Moderator).
                          </p>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 mb-2">
                            <Shield size={20} className="text-blue-500" /> Vice
                            Captain
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Second in power after the Captain. Has the power of
                            a moderator.
                          </p>
                        </div>

                        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
                          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 mb-2">
                            <Star size={20} className="text-purple-500" /> Elder
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Trusted members can be promoted to the rank of
                            &apos;elder&apos;. They do not possess moderator
                            power, although they can invoke a vote for a
                            decision to occur.
                          </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 mb-2">
                            <User size={20} className="text-slate-400" /> Junior
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Just a new fellow, nothing much... The starting
                            point for everyone joining the lodge!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {defaultLodgeChannel === "rules" && (
                    <div className="w-full max-w-4xl h-full flex flex-col justify-start pt-4 pb-8 overflow-y-auto">
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 shrink-0">
                        Lodge Rules
                      </h2>
                      <p className="text-slate-600 font-medium text-lg mb-8 leading-relaxed shrink-0">
                        To keep this Lodge a safe and welcoming space for
                        everyone, please adhere to the following rules:
                      </p>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <ul className="space-y-4">
                          <li className="flex items-start gap-3">
                            <span className="font-bold text-blue-500 text-lg mt-0.5">
                              1.
                            </span>
                            <div>
                              <strong className="text-slate-900 block mb-1">
                                Be Kind and Respectful
                              </strong>
                              <p className="text-slate-600 text-sm">
                                Treat all members with respect. No harassment,
                                sexism, racism, or hate speech will be
                                tolerated.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="font-bold text-blue-500 text-lg mt-0.5">
                              2.
                            </span>
                            <div>
                              <strong className="text-slate-900 block mb-1">
                                No Bullying
                              </strong>
                              <p className="text-slate-600 text-sm">
                                Bullying of any kind is strictly prohibited. If
                                you see someone being bullied, please report it
                                to a Moderator.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="font-bold text-blue-500 text-lg mt-0.5">
                              3.
                            </span>
                            <div>
                              <strong className="text-slate-900 block mb-1">
                                No NSFW Content
                              </strong>
                              <p className="text-slate-600 text-sm">
                                This is an academic environment. Keep all
                                content appropriate and safe for work.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="font-bold text-blue-500 text-lg mt-0.5">
                              4.
                            </span>
                            <div>
                              <strong className="text-slate-900 block mb-1">
                                Stay On Topic
                              </strong>
                              <p className="text-slate-600 text-sm">
                                Use the appropriate channels for your
                                discussions. Do not derail ongoing
                                conversations.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="font-bold text-blue-500 text-lg mt-0.5">
                              5.
                            </span>
                            <div>
                              <strong className="text-slate-900 block mb-1">
                                No Spam or Self-Promotion
                              </strong>
                              <p className="text-slate-600 text-sm">
                                Avoid spamming messages. Keep self-promotion
                                strictly to the designated #self-promo channel.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {/* Default fallback for other channels */}
                  {!["Lodge Info", "announcements", "roles", "rules"].includes(
                    defaultLodgeChannel,
                  ) && (
                    <div className="w-full max-w-3xl h-full flex flex-col justify-center items-center text-center pb-8">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Hash size={32} className="text-slate-400" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                        #{defaultLodgeChannel}
                      </h2>
                      <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-xl">
                        {defaultLodgeChannel === "general"
                          ? "This is where all the casual conversation happens! Once you join a real lodge, you&apos;ll be able to chat with peers about anything and everything here."
                          : defaultLodgeChannel === "self-promo"
                            ? "Share your projects, side-hustles, and achievements! In a real lodge, this channel keeps the main chat clean while giving you a dedicated place to shine."
                            : `This is an example of a dedicated #${defaultLodgeChannel} channel.`}
                      </p>
                      <div className="mt-8 px-6 py-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-sm font-bold flex items-center gap-2">
                        <Info size={16} />
                        This is just a preview. Join a real lodge to start
                        chatting!
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Members Sidebar */}
            {isMembersSidebarOpen && (
              <div className="w-64 bg-[#EFF6FF]/40 border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
                <div className="p-4">
                  {currentLodgeMembers.length > 0 && (
                    <>
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                        Moderators — {currentLodgeMembers.length}
                      </h4>
                      <div className="space-y-1 mb-6">
                        {currentLodgeMembers.map(
                          (
                            member: import("../store/useLodgeStore").LodgeMember,
                          ) => (
                            <div
                              key={member._id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group"
                            >
                              <div className="relative shrink-0">
                                <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-white bg-[#00BAE6]">
                                  {member.user?.avatar &&
                                  !member.user.avatar.includes("default") ? (
                                    <img
                                      src={member.user.avatar}
                                      alt={member.user.displayName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    member.user?.displayName
                                      ?.charAt(0)
                                      .toUpperCase() || <User size={14} />
                                  )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-[#3B82F6] truncate group-hover:underline">
                                  {member.user?.displayName}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  Captain
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}

                  {members.length > 0 && (
                    <>
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                        Members — {members.length}
                      </h4>
                      <div className="space-y-1 mb-6">
                        {members.map(
                          (
                            member: import("../store/useLodgeStore").LodgeMember,
                          ) => (
                            <div
                              key={member._id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-200/50 cursor-pointer transition-colors group"
                            >
                              <div className="relative shrink-0">
                                <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-white bg-[#3B82F6]">
                                  {member.user?.avatar &&
                                  !member.user.avatar.includes("default") ? (
                                    <img
                                      src={member.user.avatar}
                                      alt={member.user.displayName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    member.user?.displayName
                                      ?.charAt(0)
                                      .toUpperCase() || <User size={14} />
                                  )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#EFF6FF] rounded-full"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-slate-700 truncate group-hover:underline">
                                  {member.user?.displayName}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  Member
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* State 4: EXPLORE is active */}
      {activeTab === "explore" && (
        <div className="flex-1 flex bg-white relative overflow-hidden">
          {/* Main Content (Center) */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
            {/* Header / Search Area */}
            <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                Explore Bind
              </h2>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search peers and lodges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col custom-scrollbar relative">
              {/* Create Post Box */}
              <div className="p-6 bg-white border-b border-slate-200">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold shrink-0">
                    {authUser?.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-transparent resize-none outline-none text-slate-800 placeholder:text-slate-400 min-h-[60px]"
                    />

                    {postImage && (
                      <div className="relative inline-block mt-2">
                        <img
                          src={URL.createObjectURL(postImage)}
                          alt="Preview"
                          className="h-32 rounded-xl object-cover"
                        />
                        <button
                          onClick={() => setPostImage(null)}
                          className="absolute top-2 right-2 bg-slate-900/50 text-white rounded-full p-1 hover:bg-slate-900/80"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Tag size={16} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tags (comma separated, e.g. AI, Engineering)"
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        className="flex-1 bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={postImageInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              setPostImage(e.target.files[0]);
                          }}
                        />
                        <button
                          onClick={() => postImageInputRef.current?.click()}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Add Image"
                        >
                          <ImageIcon size={20} />
                        </button>
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={isCreatingPost || !postContent.trim()}
                        className="px-6 py-2 bg-[#3B82F6] text-white font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isCreatingPost ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Post"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="p-6 space-y-6">
                {isLoadingPosts ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center p-12 text-slate-500">
                    <p className="font-medium">No posts yet.</p>
                    <p className="text-sm">Be the first to share something!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      authUser={authUser}
                      toggleLike={toggleLike}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[380px] flex flex-col bg-slate-50 shrink-0 overflow-y-auto custom-scrollbar p-6">
            {/* Connect with Peers Container */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Connect with Peers
                </h3>
                <button className="text-[#3B82F6] font-bold text-sm hover:underline">
                  View all
                </button>
              </div>

              <div className="space-y-5">
                {suggestedPeers.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No new peers to discover right now.
                  </p>
                ) : (
                  suggestedPeers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {user.avatar && !user.avatar.includes("default") ? (
                            <img
                              src={user.avatar}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm">
                              {user.displayName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-[12px] font-medium text-slate-500 truncate">
                            {user.specialization || "Student"} • Recommended
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => sendPeerRequest(user._id)}
                        className="w-10 h-10 rounded-full border border-blue-200 text-[#3B82F6] flex items-center justify-center shrink-0 hover:bg-blue-50 transition-colors ml-2"
                        title="Connect"
                      >
                        <UserPlus size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular Lodges Container */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-lg mb-6">
                Popular Lodges
              </h3>

              <div className="space-y-6">
                {publicLodges.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No public lodges available.
                  </p>
                ) : (
                  publicLodges.slice(0, 3).map((lodge, index) => {
                    const isEven = index % 2 === 0;
                    const iconBg = isEven ? "bg-[#EFF6FF]" : "bg-[#FFF7ED]";
                    const iconColor = isEven
                      ? "text-[#3B82F6]"
                      : "text-[#F97316]";
                    const progressBg = isEven
                      ? "bg-[#3B82F6]"
                      : "text-[#F97316]"; // using text color hex
                    const progressClass = isEven
                      ? "bg-[#3B82F6]"
                      : "bg-[#F97316]";
                    const progressWidth = isEven ? "75%" : "100%";

                    return (
                      <div key={lodge._id}>
                        <div className="flex items-center gap-4 mb-3">
                          <div
                            className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                          >
                            <Users size={24} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-slate-900 truncate">
                              {lodge.name}
                            </p>
                            <p className="text-[12px] font-medium text-slate-500 truncate">
                              {lodge.members?.length || 1} members • Recommended
                            </p>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressClass}`}
                            style={{ width: progressWidth }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button className="w-full py-3 mt-6 rounded-[16px] border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                Browse Lodges
              </button>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-10 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden relative">
            {/* Left Sidebar */}
            <div className="w-[280px] bg-[#cff3fd] h-full flex flex-col py-10 px-4 overflow-y-auto shrink-0">
              <div className="w-full flex flex-col h-full">
                <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-4">
                  Settings
                </div>
                <button
                  onClick={() => setActiveSettingsTab("account")}
                  className={`w-full text-left px-4 py-2 rounded-full text-[15px] font-bold transition-all mb-1 flex items-center gap-3 ${activeSettingsTab === "account" ? "bg-blue-500 text-white shadow-md" : "text-slate-700 hover:bg-white/50 hover:text-slate-900"}`}
                >
                  <UserCircle size={18} />
                  Account
                </button>
                <button
                  onClick={() => setActiveSettingsTab("profiles")}
                  className={`w-full text-left px-4 py-2 rounded-full text-[15px] font-bold transition-all mb-1 flex items-center gap-3 ${activeSettingsTab === "profiles" ? "bg-blue-500 text-white shadow-md" : "text-slate-700 hover:bg-white/50 hover:text-slate-900"}`}
                >
                  <User size={18} />
                  Profiles
                </button>
                <button
                  onClick={() => setActiveSettingsTab("data_privacy")}
                  className={`w-full text-left px-4 py-2 rounded-full text-[15px] font-bold transition-all mb-1 flex items-center gap-3 ${activeSettingsTab === "data_privacy" ? "bg-blue-500 text-white shadow-md" : "text-slate-700 hover:bg-white/50 hover:text-slate-900"}`}
                >
                  <Lock size={18} />
                  Privacy
                </button>

                <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-4">
                  App Settings
                </div>
                <button
                  onClick={() => setActiveSettingsTab("appearance")}
                  className={`w-full text-left px-4 py-2 rounded-full text-[15px] font-bold transition-all mb-1 flex items-center gap-3 ${activeSettingsTab === "appearance" ? "bg-blue-500 text-white shadow-md" : "text-slate-700 hover:bg-white/50 hover:text-slate-900"}`}
                >
                  <Palette size={18} />
                  Appearance
                </button>
                <button
                  onClick={() => setActiveSettingsTab("language")}
                  className={`w-full text-left px-4 py-2 rounded-full text-[15px] font-bold transition-all mb-1 flex items-center gap-3 ${activeSettingsTab === "language" ? "bg-blue-500 text-white shadow-md" : "text-slate-700 hover:bg-white/50 hover:text-slate-900"}`}
                >
                  <Settings2 size={18} />
                  General Preferences
                </button>

                <div className="mt-auto px-2">
                  <button
                    onClick={() => {
                      setIsSettingsModalOpen(false);
                      logout();
                    }}
                    className="px-6 py-2 bg-[#f04444] text-white rounded-full font-bold shadow-md hover:bg-[#d93b3b] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 h-full bg-white relative flex justify-start">
              <div className="p-4 pt-6 flex-2 h-full bg-white relative overflow-y-auto">
                {/* Close Button Overlay */}
                <div
                  className="sticky top-2 right-4 float-right flex flex-col items-center gap-1.5 group cursor-pointer z-20 mt-4 ml-4"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  <div className="h-9 w-9 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-800 transition-colors">
                    <X size={18} strokeWidth={2.5} />
                  </div>
                </div>

                {activeSettingsTab === "account" && (
                  <div className="max-w-[600px]">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-6">
                      My Account
                    </h2>

                    {/* Account Info Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Account Info
                      </h3>

                      {/* Username Field */}
                      <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-slate-500 uppercase mb-1">
                            Username
                          </div>
                          {editingField === "username" ? (
                            <div className="flex flex-col gap-2 mt-2 max-w-[300px]">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[4px] p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                              />
                            </div>
                          ) : (
                            <div className="text-[16px] font-medium text-slate-900">
                              {authUser?.username}
                            </div>
                          )}
                        </div>
                        {editingField === "username" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[14px] font-medium transition-colors shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInlineField("username")}
                              disabled={isUpdatingProfile || !editValue}
                              className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-[14px] font-medium rounded-[4px] transition-colors shrink-0 flex items-center gap-2"
                            >
                              {isUpdatingProfile ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingField("username");
                              setEditValue(authUser?.username || "");
                            }}
                            className="px-5 py-1.5 bg-[#3b82f6] hover:bg-blue-600 shadow-md text-white text-[14px] font-bold rounded-full transition-colors shrink-0 ml-4"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-slate-500 uppercase mb-1">
                            Email
                          </div>
                          {editingField === "email" ? (
                            <div className="flex flex-col gap-2 mt-2 max-w-[300px]">
                              <input
                                type="email"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[4px] p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                              />
                            </div>
                          ) : (
                            <div className="text-[16px] font-medium text-slate-900 flex items-center gap-2">
                              {authUser?.email}
                            </div>
                          )}
                        </div>
                        {editingField === "email" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[14px] font-medium transition-colors shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInlineField("email")}
                              disabled={isUpdatingProfile || !editValue}
                              className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-[14px] font-medium rounded-[4px] transition-colors shrink-0 flex items-center gap-2"
                            >
                              {isUpdatingProfile ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingField("email");
                              setEditValue(authUser?.email || "");
                            }}
                            className="px-5 py-1.5 bg-[#3b82f6] hover:bg-blue-600 shadow-md text-white text-[14px] font-bold rounded-full transition-colors shrink-0 ml-4"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {/* Phone Number Field */}
                      <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-slate-500 uppercase mb-1">
                            Phone Number
                          </div>
                          {editingField === "phone" ? (
                            <div className="flex flex-col gap-2 mt-2 max-w-[300px]">
                              <input
                                type="text"
                                placeholder="e.g. +1 555 123 4567"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[4px] p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                              />
                            </div>
                          ) : (
                            <div className="text-[16px] font-medium text-slate-900">
                              {/* @ts-ignore - Phone is added dynamically */}
                              {authUser?.phone ||
                                "You haven't added a phone number yet."}
                            </div>
                          )}
                        </div>
                        {editingField === "phone" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[14px] font-medium transition-colors shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInlineField("phone")}
                              disabled={isUpdatingProfile || !editValue}
                              className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-[14px] font-medium rounded-[4px] transition-colors shrink-0 flex items-center gap-2"
                            >
                              {isUpdatingProfile ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingField("phone");
                              // @ts-ignore
                              setEditValue(authUser?.phone || "");
                            }}
                            className="px-5 py-1.5 bg-[#3b82f6] hover:bg-blue-600 shadow-md text-white text-[14px] font-bold rounded-full transition-colors shrink-0 ml-4"
                          >
                            {/* @ts-ignore */}
                            {authUser?.phone ? "Edit" : "Add"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password & Security Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Password & Security
                      </h3>

                      {/* Password Field */}
                      <div className="flex items-start justify-between py-3 border-b border-slate-200 last:border-0">
                        <div className="flex-1">
                          <div className="text-[16px] font-medium text-slate-900 mb-2">
                            Password
                          </div>
                          {editingField === "password" && (
                            <div className="flex flex-col gap-3 max-w-[300px]">
                              <div>
                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  value={editOldPassword}
                                  onChange={(e) =>
                                    setEditOldPassword(e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-[4px] p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                                />
                              </div>
                              <div>
                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  value={editNewPassword}
                                  onChange={(e) =>
                                    setEditNewPassword(e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 rounded-[4px] p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {editingField === "password" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingField(null);
                                setEditOldPassword("");
                                setEditNewPassword("");
                              }}
                              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[14px] font-medium transition-colors shrink-0"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSavePassword}
                              disabled={
                                isUpdatingProfile ||
                                !editOldPassword ||
                                !editNewPassword
                              }
                              className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-[14px] font-medium rounded-[4px] transition-colors shrink-0 flex items-center gap-2"
                            >
                              {isUpdatingProfile ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingField("password")}
                            className="px-5 py-1.5 bg-[#3b82f6] hover:bg-blue-600 shadow-md text-white text-[14px] font-bold rounded-full transition-colors shrink-0 ml-4"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <div className="text-[16px] font-medium text-slate-900">
                          Multi-Factor Authentication
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 transition-colors">
                          <span className="text-[15px] font-medium">
                            Set up
                          </span>
                          <ChevronRight size={18} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <div className="text-[16px] font-medium text-slate-900">
                          Logged-in Devices
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 transition-colors">
                          <span className="text-[15px] font-medium">
                            1 device
                          </span>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Account Standing Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Account Standing
                      </h3>
                      <div className="py-1">
                        <div className="text-[15px] font-medium text-[#23a559] bg-[#23a559]/10 px-4 py-3 rounded-md border border-[#23a559]/20">
                          Your account is currently in good standing.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "profiles" && (
                  <div className="max-w-[600px]">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-6">
                      Profiles
                    </h2>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-6 border border-slate-200">
                      {/* Banner Area */}
                      <div
                        className="h-[120px] w-full bg-white border border-slate-200 relative group cursor-pointer overflow-hidden"
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        {settingsBannerPreview ? (
                          <img
                            src={settingsBannerPreview}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-teal-500 to-blue-600"></div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold text-[13px] uppercase tracking-wider">
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
                                setSettingsBannerPreview(
                                  reader.result as string,
                                );
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>

                      {/* Avatar Area */}
                      <div className="relative px-6 pb-6">
                        <div className="absolute -top-12 flex items-end">
                          <div
                            className="h-[100px] w-[100px] rounded-full bg-slate-50 border border-slate-200 border-[6px] border-[#2b2d31] shadow-lg relative group cursor-pointer overflow-hidden"
                            onClick={() => setIsSettingsAvatarModalOpen(true)}
                          >
                            <img
                              src={
                                settingsAvatarPreview ||
                                `https://ui-avatars.com/api/?name=${authUser?.displayName}&background=random`
                              }
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Plus size={24} className="text-white" />
                            </div>
                          </div>
                        </div>

                        <AvatarSelectionModal
                          isOpen={isSettingsAvatarModalOpen}
                          onClose={() => setIsSettingsAvatarModalOpen(false)}
                          onSelect={(file, url) => {
                            setSettingsAvatarFile(file);
                            setSettingsAvatarPreview(url);
                          }}
                        />

                        <div className="pt-16 space-y-5">
                          {/* Name */}
                          <div>
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={settingsDisplayName}
                              onChange={(e) =>
                                setSettingsDisplayName(e.target.value)
                              }
                              className="w-full bg-white border border-slate-200 border-none rounded-[4px] p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                            />
                          </div>

                          {/* Bio */}
                          <div>
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              About Me
                            </label>
                            <textarea
                              value={settingsBio}
                              onChange={(e) => setSettingsBio(e.target.value)}
                              className="w-full bg-white border border-slate-200 border-none rounded-[4px] p-2.5 h-24 resize-none text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00a8fc] text-[15px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isUpdatingProfile || !settingsDisplayName}
                        className="px-6 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[4px] font-medium transition-colors flex items-center gap-2"
                      >
                        {isUpdatingProfile ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "data_privacy" && (
                  <div className="max-w-[600px]">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-6">
                      Data & Privacy
                    </h2>

                    <div className="mb-8">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        How We Use Your Data
                      </h3>

                      <div className="flex items-start justify-between py-4 border-b border-slate-200">
                        <div className="pr-8">
                          <div className="text-[16px] font-medium text-slate-900 mb-1">
                            Use data to improve Talk
                          </div>
                          <div className="text-[14px] text-slate-500">
                            This setting allows us to use and process
                            information about how you navigate and use Talk for
                            analytical purposes.
                          </div>
                        </div>
                        <div className="w-10 h-6 shrink-0 bg-[#23a559] rounded-full relative cursor-pointer mt-1">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                        </div>
                      </div>

                      <div className="flex items-start justify-between py-4 border-b border-slate-200">
                        <div className="pr-8">
                          <div className="text-[16px] font-medium text-slate-900 mb-1">
                            Use data to customize my experience
                          </div>
                          <div className="text-[14px] text-slate-500">
                            This setting allows us to use information to
                            customize your experience on Talk.
                          </div>
                        </div>
                        <div className="w-10 h-6 shrink-0 bg-[#23a559] rounded-full relative cursor-pointer mt-1">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                        </div>
                      </div>

                      <div className="flex items-start justify-between py-4 border-b border-slate-200">
                        <div className="pr-8">
                          <div className="text-[16px] font-medium text-slate-900 mb-1">
                            Allow direct messages from server members
                          </div>
                          <div className="text-[14px] text-slate-500">
                            This setting is applied when you join a new server.
                            It does not affect your existing servers.
                          </div>
                        </div>
                        <div className="w-10 h-6 shrink-0 bg-[#23a559] rounded-full relative cursor-pointer mt-1">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Request Data
                      </h3>
                      <div className="text-[14px] text-slate-500 mb-4">
                        You can request a copy of your personal data. It may
                        take up to 30 days to process your request.
                      </div>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[14px] font-medium rounded-[4px] transition-colors">
                        Request all of my data
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "appearance" && (
                  <div className="max-w-[600px]">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-6">
                      Appearance
                    </h2>

                    <div className="mb-8">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Theme
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white border border-slate-200 border-2 border-[#5865f2] rounded-[8px] p-4 cursor-pointer relative">
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#5865f2] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="w-full h-[60px] bg-white rounded-md mb-3 flex items-center px-3">
                            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 shrink-0 mr-3"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="w-16 h-2 bg-slate-50 border border-slate-200 rounded-full"></div>
                              <div className="w-full h-2 bg-slate-50 border border-slate-200 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 text-center">
                            Dark
                          </div>
                        </div>

                        <div className="flex-1 bg-white border-2 border-transparent rounded-[8px] p-4 cursor-pointer relative">
                          <div className="w-full h-[60px] bg-[#f2f3f5] rounded-md mb-3 flex items-center px-3">
                            <div className="w-6 h-6 rounded-full bg-white shrink-0 mr-3 shadow-sm"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="w-16 h-2 bg-white shadow-sm rounded-full"></div>
                              <div className="w-full h-2 bg-white shadow-sm rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-[14px] font-bold text-slate-600 text-center">
                            Light
                          </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-[#1e1f22] to-[#e3e5e8] border-2 border-transparent rounded-[8px] p-4 cursor-pointer relative">
                          <div className="w-full h-[60px] flex rounded-md mb-3 overflow-hidden">
                            <div className="flex-1 bg-white h-full flex items-center px-2">
                              <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-200"></div>
                            </div>
                            <div className="flex-1 bg-[#f2f3f5] h-full flex items-center px-2">
                              <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                            </div>
                          </div>
                          <div className="text-[14px] font-bold text-slate-300 text-center">
                            Sync
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Message Display
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                          <div className="w-5 h-5 rounded-full border-2 border-[#5865f2] flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 bg-[#5865f2] rounded-full"></div>
                          </div>
                          <span className="text-[15px] font-medium text-slate-900">
                            Cozy{" "}
                            <span className="text-slate-500 font-normal text-[13px] ml-1">
                              Modern, beautiful, and easy on your eyes.
                            </span>
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                          <span className="text-[15px] font-medium text-slate-900">
                            Compact{" "}
                            <span className="text-slate-500 font-normal text-[13px] ml-1">
                              Fit as many messages on screen as possible.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "language" && (
                  <div className="max-w-[600px] pb-10">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-6">
                      General Preferences
                    </h2>

                    {/* Language Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Language
                      </h3>
                      <div className="text-[14px] text-slate-500 mb-6">
                        Select the language you want to use Talk in.
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-3 rounded bg-slate-200 cursor-pointer">
                          <div>
                            <div className="text-[15px] font-medium text-slate-900">
                              English (US)
                            </div>
                            <div className="text-[13px] text-slate-500">
                              English (US)
                            </div>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-[#5865f2] flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 bg-[#5865f2] rounded-full"></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded hover:bg-slate-100 cursor-pointer transition-colors">
                          <div>
                            <div className="text-[15px] font-medium text-slate-900">
                              English (UK)
                            </div>
                            <div className="text-[13px] text-slate-500">
                              English (UK)
                            </div>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded hover:bg-slate-100 cursor-pointer transition-colors">
                          <div>
                            <div className="text-[15px] font-medium text-slate-900">
                              Español
                            </div>
                            <div className="text-[13px] text-slate-500">
                              Spanish
                            </div>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                        </div>
                      </div>
                    </div>

                    {/* Other Preferences Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                      <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Other Preferences
                      </h3>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <span className="text-[16px] font-medium text-slate-900">
                          Autoplay videos
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            On
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-slate-500 group-hover:text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <span className="text-[16px] font-medium text-slate-900">
                          Sound effects
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            On
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-slate-500 group-hover:text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <span className="text-[16px] font-medium text-slate-900">
                          Showing profile photos
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            All Talk members
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-slate-500 group-hover:text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <span className="text-[16px] font-medium text-slate-900">
                          Preferred feed view
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            Most relevant posts (Recommended)
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-slate-500 group-hover:text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0 cursor-pointer group">
                        <span className="text-[16px] font-medium text-slate-900">
                          People you unfollowed
                        </span>
                        <ArrowRight
                          size={18}
                          className="text-slate-500 group-hover:text-slate-800 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lodge Modal (Discover & Create) */}
      {isLodgeModalOpen && (
        <div className="fixed inset-0 bg-[#1e2532]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900">Lodges</h2>
              <button
                onClick={() => setIsLodgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-slate-100 shrink-0">
              <button
                onClick={() => setLodgeModalTab("discover")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${lodgeModalTab === "discover" ? "text-[#3B82F6] border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-700"}`}
              >
                Discover
              </button>
              <button
                onClick={() => setLodgeModalTab("create")}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${lodgeModalTab === "create" ? "text-[#3B82F6] border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-700"}`}
              >
                Create Lodge
              </button>
            </div>

            <div className="overflow-y-auto">
              {lodgeModalTab === "create" ? (
                <>
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
                          <Building2 size={32} className="text-[#3B82F6]" />
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

                  <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <button
                      onClick={handleCreateLodge}
                      disabled={isCreating || !lodgeName}
                      className="px-6 py-3 bg-[#3B82F6] hover:bg-[#10239E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      {isCreating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Create Lodge"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 space-y-3">
                  {publicLodges.filter(
                    (pl) => !myLodges.find((ml) => ml._id === pl._id),
                  ).length === 0 ? (
                    <div className="text-center py-10">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Compass size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">
                        No new lodges to discover.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Check back later or create your own!
                      </p>
                    </div>
                  ) : (
                    publicLodges
                      .filter((pl) => !myLodges.find((ml) => ml._id === pl._id))
                      .map((lodge) => (
                        <div
                          key={lodge._id}
                          className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-[14px] bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                              {lodge.avatar ? (
                                <img
                                  src={lodge.avatar}
                                  alt="lodge"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                lodge.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {lodge.name}
                              </p>
                              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                <Users size={12} /> Public
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              joinLodge(lodge._id);
                              setIsLodgeModalOpen(false);
                            }}
                            disabled={isJoining}
                            className="w-full py-2 bg-slate-50 hover:bg-[#EFF6FF] text-[#3B82F6] rounded-xl text-xs font-bold transition-colors border border-slate-100 hover:border-blue-200"
                          >
                            Join Lodge
                          </button>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Creation Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-[#1e2532]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                    <Plus size={36} className="text-[#3B82F6] mb-3" />
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
                className="px-6 py-3 bg-[#3B82F6] hover:bg-[#10239E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
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
          <div className="relative w-full max-w-md aspect-[9/16] bg-[#1e2532] rounded-[32px] overflow-hidden flex flex-col items-center justify-center shadow-2xl">
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
