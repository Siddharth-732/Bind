import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface ConnectionState {
  peers: any[];
  pendingRequests: any[];
  discoverUsers: any[];
  isLoading: boolean;
  
  getPeers: () => Promise<void>;
  getPeerRequests: () => Promise<void>;
  getDiscoverUsers: () => Promise<void>;
  sendPeerRequest: (peerId: string) => Promise<boolean>;
  acceptPeerRequest: (peerId: string) => Promise<boolean>;
  rejectPeerRequest: (peerId: string) => Promise<boolean>;
  removePeer: (peerId: string) => Promise<boolean>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  peers: [],
  pendingRequests: [],
  discoverUsers: [],
  isLoading: false,

  getPeers: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/users/peers");
      set({ peers: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load peers");
    } finally {
      set({ isLoading: false });
    }
  },

  getPeerRequests: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/users/peers/requests");
      set({ pendingRequests: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load requests");
    } finally {
      set({ isLoading: false });
    }
  },

  getDiscoverUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/users");
      set({ discoverUsers: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load discover users");
    } finally {
      set({ isLoading: false });
    }
  },

  sendPeerRequest: async (peerId: string) => {
    try {
      const response = await axiosInstance.post(`/users/peers/${peerId}/request`);
      toast.success(response.data.message);
      // Remove the user from discoverUsers
      set((state) => ({
        discoverUsers: state.discoverUsers.filter((u) => u._id !== peerId),
      }));
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send request");
      return false;
    }
  },

  acceptPeerRequest: async (peerId: string) => {
    try {
      const response = await axiosInstance.post(`/users/peers/${peerId}/accept`);
      toast.success(response.data.message);
      
      // We should ideally refetch peers and requests, or manually move the user
      // For simplicity, let's just refetch
      get().getPeers();
      get().getPeerRequests();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return false;
    }
  },

  rejectPeerRequest: async (peerId: string) => {
    try {
      const response = await axiosInstance.post(`/users/peers/${peerId}/reject`);
      toast.success(response.data.message);
      // Refetch requests
      get().getPeerRequests();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return false;
    }
  },

  removePeer: async (peerId: string) => {
    try {
      const response = await axiosInstance.post(`/users/peers/${peerId}/remove`);
      toast.success(response.data.message);
      // Remove from peers
      set((state) => ({
        peers: state.peers.filter((p) => p._id !== peerId),
      }));
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove peer");
      return false;
    }
  },
}));
