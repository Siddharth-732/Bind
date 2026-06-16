import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

interface ChatState {
  users: any[];
  messages: any[];
  selectedUser: any | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;
  isTyping: boolean;
  getUsers: () => Promise<void>;
  setSelectedUser: (user: any | null) => void;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (userId: string, content: string) => Promise<boolean>;
  emitStartTyping: (receiverId: string) => void;
  emitStopTyping: (receiverId: string) => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isTyping: false,

  // fetch all users for the sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/users"); 
      set({ users: response.data.data || response.data }); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // remember who we clicked on
  setSelectedUser: (user) => set({ selectedUser: user }),

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (userId: string, content: string) => {
    if (!content.trim()) return false;
    set({ isSendingMessage: true });
    try {
      const response = await axiosInstance.post(`/messages/send/${userId}`, { content });
      const newMessage = response.data.data;
      set({ messages: [...get().messages, newMessage] });
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return false;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  emitStartTyping: (receiverId: string) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("typing", { receiverId });
    }
  },

  emitStopTyping: (receiverId: string) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("stopTyping", { receiverId });
    }
  },

  subscribeToMessages: () => {
    const selectedUser = get().selectedUser;
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage: any) => {
      // Check if the incoming message is from the user we are currently chatting with
      // If it is, append it to the messages array
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("userTyping", ({ senderId }: { senderId: string }) => {
      const selectedUser = get().selectedUser;
      if (selectedUser && senderId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("userStoppedTyping", ({ senderId }: { senderId: string }) => {
      const selectedUser = get().selectedUser;
      if (selectedUser && senderId === selectedUser._id) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    set({ isTyping: false });
  },
}));