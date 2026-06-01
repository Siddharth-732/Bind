import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Define the shape of our store for TypeScript
interface AuthState {
  authUser: any;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null, // Holds the user's data when logged in
  isLoggingIn: false,
  isRegistering: false,

login: async (data) => {
    console.log("📍 TRACE 1: Login function triggered with:", data);
    set({ isLoggingIn: true });
    
    try {
      console.log("📍 TRACE 2: Sending request to backend...");
      const response = await axiosInstance.post("/users/login", data);
      
      console.log("📍 TRACE 3: Backend responded perfectly!", response);
      console.log("📍 TRACE 4: The exact user data is:", response.data.user);
      
      set({ authUser: response.data.user }); 
      console.log("📍 TRACE 5: Zustand store successfully updated!");
      
      toast.success("Logged in successfully!");
      
    } catch (error: any) {
      console.log("❌ TRACE CRASH: Execution fell into the catch block!");
      console.log("❌ EXACT ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to log in");
      
    } finally {
      console.log("📍 TRACE 6: Resetting loading state.");
      set({ isLoggingIn: false });
    }
  },

  register: async (data) => {
    set({ isRegistering: true });
    try {
      const response = await axiosInstance.post("/users/register", data);
      // Our backend returns the registered user in the 'createdUser' field
      set({ authUser: response.data.data }); 
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      set({ isRegistering: false });
    }
  },
  logout: async () => {
    try {
      // 1. Tell the Express backend to clear the HTTP-Only cookies
      await axiosInstance.post("/users/logout");
      
      // 2. Clear the user from our frontend global memory
      set({ authUser: null }); 
      
      // 3. Show a success notification
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to log out");
    }
  },
}));