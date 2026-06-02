import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface ChatState {
  users: any[];
  messages: any[];
  selectedUser: any | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  setSelectedUser: (user: any | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // fetch all users for the sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      // NOTE: Adjust this URL if your backend route for getting users is different!
      const response = await axiosInstance.get("/users"); 
      
      // assume backend sends the array of users in `response.data.data`
      set({ users: response.data.data || response.data }); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // remember who we clicked on
  setSelectedUser: (user) => set({ selectedUser: user }),
}));