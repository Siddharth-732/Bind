import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface StatusState {
  statuses: any[];
  isLoadingStatuses: boolean;
  isCreatingStatus: boolean;
  
  getStatuses: () => Promise<void>;
  createStatus: (data: FormData) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load stories");
    } finally {
      set({ isLoadingStatuses: false });
    }
  },

  createStatus: async (data: FormData) => {
    set({ isCreatingStatus: true });
    try {
      const response = await axiosInstance.post("/statuses", data);
      toast.success("Story posted successfully!");
      // Automatically refresh the stories
      get().getStatuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post story");
    } finally {
      set({ isCreatingStatus: false });
    }
  },

  deleteStatus: async (statusId: string) => {
    try {
      await axiosInstance.delete(`/statuses/${statusId}`);
      toast.success("Story deleted");
      get().getStatuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete story");
    }
  }
}));
