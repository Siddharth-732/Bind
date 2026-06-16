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
  markMessagesAsDelivered: (senderId: string) => Promise<void>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
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

      // Automatically mark them as read now that we fetched them
      get().markMessagesAsRead(userId);
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

  markMessagesAsDelivered: async (senderId: string) => {
    try {
      await axiosInstance.put(`/messages/delivered/${senderId}`);
      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("messageDelivered", { senderId });
    } catch (error) {
      console.error("Failed to mark messages as delivered", error);
    }
  },

  markMessagesAsRead: async (senderId: string) => {
    try {
      await axiosInstance.put(`/messages/read/${senderId}`);
      
      // Update our local state to reflect that WE read them
      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map((msg) => {
        if (msg.senderId === senderId && !msg.isRead) {
          return { ...msg, isRead: true, isDelivered: true };
        }
        return msg;
      });
      set({ messages: updatedMessages });

      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("markAsRead", { senderId });
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  },

  subscribeToMessages: () => {
    const selectedUser = get().selectedUser;
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage: any) => {
      // 1. Immediately tell the sender it was delivered
      socket.emit("messageDelivered", { senderId: newMessage.senderId });

      // 2. Check if the incoming message is from the user we are currently chatting with
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      // 3. Since we are actively looking at the chat, mark it as read!
      get().markMessagesAsRead(newMessage.senderId);

      set({ messages: [...get().messages, { ...newMessage, isDelivered: true, isRead: true }] });
    });

    // Listen for our OUTGOING messages getting delivered or read
    socket.on("messagesDelivered", ({ receiverId }: { receiverId: string }) => {
      if (selectedUser && receiverId === selectedUser._id) {
        set({
          messages: get().messages.map((msg) =>
            msg.receiverId === receiverId && !msg.isDelivered
              ? { ...msg, isDelivered: true }
              : msg
          ),
        });
      }
    });

    socket.on("messagesRead", ({ receiverId }: { receiverId: string }) => {
      if (selectedUser && receiverId === selectedUser._id) {
        set({
          messages: get().messages.map((msg) =>
            msg.receiverId === receiverId && !msg.isRead
              ? { ...msg, isRead: true, isDelivered: true }
              : msg
          ),
        });
      }
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
    socket.off("messagesDelivered");
    socket.off("messagesRead");
    set({ isTyping: false });
  },
}));