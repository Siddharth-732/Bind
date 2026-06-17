import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { AxiosError } from "axios";

export interface Status {
  _id: string;
  user?: import("./useAuthStore").AuthUser;
  content?: string;
  textContent?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  [key: string]: unknown;
}

interface StatusState {
  statuses: Status[];
  isLoadingStatuses: boolean;
  isCreatingStatus: boolean;

  getStatuses: () => Promise<void>;
  createStatus: (data: FormData) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
  subscribeToStatuses: () => void;
  unsubscribeFromStatuses: () => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  statuses: [],
  isLoadingStatuses: false,
  isCreatingStatus: false,

  getStatuses: async () => {
    set({ isLoadingStatuses: true });
    try {
      const response = await axiosInstance.get("/statuses");
      set({ statuses: response.data.data });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to load stories",
      );
    } finally {
      set({ isLoadingStatuses: false });
    }
  },

  createStatus: async (data: FormData) => {
    set({ isCreatingStatus: true });
    try {
      await axiosInstance.post("/statuses", data);
      toast.success("Story posted successfully!");
      // We don't need to manually refresh here if we are subscribed to socket events
      // But it's good as a fallback.
      get().getStatuses();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to post story");
    } finally {
      set({ isCreatingStatus: false });
    }
  },

  deleteStatus: async (statusId: string) => {
    try {
      await axiosInstance.delete(`/statuses/${statusId}`);
      toast.success("Story deleted");
      get().getStatuses();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete story",
      );
    }
  },

  subscribeToStatuses: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newStatus", (newStatus: Status) => {
      set((state) => ({
        // Add new status to the beginning of the array
        statuses: [newStatus, ...state.statuses],
      }));
    });
  },

  unsubscribeFromStatuses: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newStatus");
  },
}));
