import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthstore = create((set, get) => ({
    authUser: null,
    isSigningup: false,
    isLoggingin: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    ischekingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("error in checkAuth", error);
            set({ authUser: null });
        }
        finally {
            set({ ischekingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningup: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success(`Welcome ${res.data.fullname}! Account created successfully`);
            get().connectSocket();
        } catch (error) {
            console.log("error in signup in useAuthstore", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningup: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("error in logout in useAuthstore", error);
        }
    },

    login: async (data) => {
        set({ isLoggingin: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            // console.log(res.data);
            toast.success("logged in successfully");
            get().connectSocket();
        } catch (error) {
            console.log("error in login in useAuthstore", error);
            toast.error(error.response.data.message);
        }
        finally {
            set({ isLoggingin: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("profile updated successfully");
        } catch (error) {
            console.log("error in updateProfile in useAuthstore", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: async () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();
         // console.log({socket});
        set({ socket:socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: async () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
        }
    },
}))
