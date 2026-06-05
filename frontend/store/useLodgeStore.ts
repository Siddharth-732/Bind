import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

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
  
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
}));
