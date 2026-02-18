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
        // Demo mode - check localStorage for saved user
        try {
            const savedUser = localStorage.getItem('demoUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                set({ authUser: user });
                get().connectSocket();
            }
        } catch (error) {
            console.log("error in checkAuth", error);
            set({ authUser: null });
        }
        finally {
            set({ ischekingAuth: false });
        }
    },

    // Simple demo login - just save name
    quickLogin: (name) => {
        // Create consistent ID based on name (not timestamp)
        const userId = 'user-' + name.toLowerCase().replace(/\s+/g, '-');
        const user = {
            _id: userId,
            fullName: name,
            email: `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
            profilePic: `https://avatar.iran.liara.run/public/boy?username=${name}`,
        };
        localStorage.setItem('demoUser', JSON.stringify(user));
        set({ authUser: user });
        toast.success(`Welcome ${name}! 🎉`);
        get().connectSocket();
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
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningup: false });
        }
    },

    logout: async () => {
        try {
            // Demo mode - just clear localStorage
            localStorage.removeItem('demoUser');
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
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
            toast.error(error.response?.data?.message || "Login failed");
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
            toast.error(error.response?.data?.message || "Profile update failed");
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
