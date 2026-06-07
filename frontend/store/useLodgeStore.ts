import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

interface LodgeState {
  publicLodges: any[];
  myLodges: any[];
  currentLodgeChannels: any[];
  selectedLodge: any | null;
  selectedChannel: any | null;
  isLoadingLodges: boolean;
  isJoining: boolean;
  isCreating: boolean;
  
  getPublicLodges: () => Promise<void>;
  getMyLodges: () => Promise<void>;
  joinLodge: (lodgeId: string) => Promise<boolean>;
  getLodgeChannels: (lodgeId: string) => Promise<void>;
  createLodge: (data: FormData) => Promise<boolean>;
  setSelectedLodge: (lodge: any | null) => void;
  setSelectedChannel: (channel: any | null) => void;

  // Messaging
  channelMessages: any[];
  isChannelMessagesLoading: boolean;
  getChannelMessages: (channelId: string) => Promise<void>;
  sendChannelMessage: (channelId: string, content: string) => Promise<boolean>;
  subscribeToChannelMessages: (channelId: string) => void;
  unsubscribeFromChannelMessages: (channelId: string) => void;
}

export const useLodgeStore = create<LodgeState>((set, get) => ({
  publicLodges: [],
  myLodges: [],
  currentLodgeChannels: [],
  selectedLodge: null,
  selectedChannel: null,
  isLoadingLodges: false,
  isJoining: false,
  isCreating: false,
  channelMessages: [],
  isChannelMessagesLoading: false,

  getPublicLodges: async () => {
    set({ isLoadingLodges: true });
    try {
      const response = await axiosInstance.get("/lodges");
      set({ publicLodges: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load lodges");
    } finally {
      set({ isLoadingLodges: false });
    }
  },

  getMyLodges: async () => {
    try {
      const response = await axiosInstance.get("/lodges/my-lodges");
      set({ myLodges: response.data.data });
    } catch (error: any) {
      console.error("Failed to fetch my lodges", error);
    }
  },

  joinLodge: async (lodgeId: string) => {
    set({ isJoining: true });
    try {
      await axiosInstance.post(`/lodges/${lodgeId}/join`);
      toast.success("Successfully joined the lodge!");
      // Refresh my lodges
      get().getMyLodges();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join lodge");
      return false;
    } finally {
      set({ isJoining: false });
    }
  },

  getLodgeChannels: async (lodgeId: string) => {
    try {
      const response = await axiosInstance.get(`/lodges/${lodgeId}/channels`);
      const channels = response.data.data;
      set({ currentLodgeChannels: channels });
      // Auto-select the first text channel (usually 'general')
      if (channels.length > 0) {
        set({ selectedChannel: channels[0] });
      }
    } catch (error: any) {
      console.error("Failed to load channels", error);
    }
  },

  createLodge: async (data: FormData) => {
    set({ isCreating: true });
    try {
      await axiosInstance.post("/lodges/create", data);
      toast.success("Lodge created successfully!");
      get().getMyLodges();
      get().getPublicLodges();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create lodge");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  setSelectedLodge: (lodge) => {
    set({ selectedLodge: lodge });
    if (lodge) {
      // Automatically fetch channels when a lodge is selected
      get().getLodgeChannels(lodge._id);
    } else {
      set({ currentLodgeChannels: [], selectedChannel: null });
    }
  },
  
  setSelectedChannel: (channel) => {
    const previousChannel = get().selectedChannel;
    if (previousChannel) {
      get().unsubscribeFromChannelMessages(previousChannel._id);
    }
    
    set({ selectedChannel: channel });
    
    if (channel) {
      get().getChannelMessages(channel._id);
      get().subscribeToChannelMessages(channel._id);
    } else {
      set({ channelMessages: [] });
    }
  },

  getChannelMessages: async (channelId: string) => {
    set({ isChannelMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/lodges/channels/${channelId}/messages`);
      set({ channelMessages: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load channel messages");
    } finally {
      set({ isChannelMessagesLoading: false });
    }
  },

  sendChannelMessage: async (channelId: string, content: string) => {
    try {
      await axiosInstance.post(`/lodges/channels/${channelId}/messages`, { content });
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return false;
    }
  },

  subscribeToChannelMessages: (channelId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.emit("join-channel", channelId);

    socket.on("newChannelMessage", (newMessage: any) => {
      if (newMessage.channelId !== get().selectedChannel?._id) return;
      set((state) => ({
        channelMessages: [...state.channelMessages, newMessage],
      }));
    });
  },

  unsubscribeFromChannelMessages: (channelId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.emit("leave-channel", channelId);
    socket.off("newChannelMessage");
  },
}));
