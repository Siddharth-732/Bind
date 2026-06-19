import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AuthUser } from "./useAuthStore";
import { AxiosError } from "axios";

export interface Post {
  _id: string;
  author: AuthUser;
  content: string;
  image?: string;
  tags: string[];
  likes: string[];
  createdAt: string;
}

interface PostState {
  posts: Post[];
  isLoadingPosts: boolean;
  isCreatingPost: boolean;

  getGlobalFeed: () => Promise<void>;
  createPost: (data: FormData) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoadingPosts: false,
  isCreatingPost: false,

  getGlobalFeed: async () => {
    set({ isLoadingPosts: true });
    try {
      const response = await axiosInstance.get("/posts");
      set({ posts: response.data.data });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to load posts",
      );
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  createPost: async (data: FormData) => {
    set({ isCreatingPost: true });
    try {
      const response = await axiosInstance.post("/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Add the new post to the top of the feed
      set((state) => ({ posts: [response.data.data, ...state.posts] }));
      toast.success("Post created successfully!");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to create post",
      );
      return false;
    } finally {
      set({ isCreatingPost: false });
    }
  },

  toggleLike: async (postId: string) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/like`);
      const updatedPost = response.data.data;
      
      // We'll update the specific post in the UI state
      set((state) => ({
        posts: state.posts.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes } : p)),
      }));
    } catch (error: unknown) {
      console.error("Error toggling like:", error);
    }
  },
}));
