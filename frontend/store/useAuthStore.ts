import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { AxiosError } from "axios";

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  banner?: string;
  displayName: string;
  bio?: string;
  specialization?: string;
  institute?: string;
  createdAt: string;
  [key: string]: unknown;
}

// Define the shape of our store for TypeScript
interface AuthState {
  authUser: AuthUser | null;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isUpdatingProfile: boolean;
  socket: Socket | null;
  login: (data: Record<string, unknown> | FormData) => Promise<boolean>;
  register: (data: Record<string, unknown> | FormData) => Promise<void>;
  logout: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateAccountDetails: (data: {
    displayName?: string;
    bio?: string;
  }) => Promise<boolean>;
  updateUserAvatar: (file: File) => Promise<boolean>;
  updateUserBanner: (file: File) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null, // Holds the user's data when logged in
  isLoggingIn: false,
  isRegistering: false,
  isUpdatingProfile: false,

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const response = await axiosInstance.post("/users/login", data);
      set({ authUser: response.data.user });
      toast.success("Logged in successfully!");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to log in");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  register: async (data) => {
    set({ isRegistering: true });
    try {
      const response = await axiosInstance.post("/users/register", data);
      // Our backend returns the registered user in the 'user' field
      set({ authUser: response.data.user });
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to create account",
      );
    } finally {
      set({ isRegistering: false });
    }
  },

  logout: async () => {
    try {
      // tell the Express backend to clear the HTTP-Only cookies
      await axiosInstance.post("/users/logout");

      // clear the user from our frontend global memory
      set({ authUser: null });

      toast.success("Logged out successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to log out");
    }
  },

  updateAccountDetails: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.patch("/users/update-account", data);
      set({ authUser: response.data.user });
      toast.success("Profile updated successfully");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update profile",
      );
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateUserAvatar: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await axiosInstance.patch(
        "/users/update-avatar",
        formData,
      );
      set({ authUser: response.data.user });
      toast.success("Avatar updated successfully");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update avatar",
      );
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateUserBanner: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const response = await axiosInstance.patch(
        "/users/update-banner",
        formData,
      );
      set({ authUser: response.data.user });
      toast.success("Banner updated successfully");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update banner",
      );
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  socket: null,
  connectSocket: () => {
    const { authUser, socket } = get();

    // if we aren't logged in, or the socket is already connected, do nothing!
    if (!authUser || socket?.connected) return;

    // dial the backend phone number and pass our User ID
    const newSocket = io("http://localhost:5000", {
      query: {
        userId: authUser._id,
      },
    });

    newSocket.connect();
    set({ socket: newSocket });
    console.log("🔌 Socket connected!");
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
      console.log("🔌 Socket disconnected!");
    }
  },
}));
