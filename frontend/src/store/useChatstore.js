import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios.js";
import { useAuthstore } from "./useAuthstore.js";



export const useChatstore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserloading: false,
    isMessagesloading: false,
    replyingTo: null,

    getUsers: async () => {
        set({ isUserloading: true })
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUserloading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesloading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesloading: false });
        }
    },

    sendMessage: async (messagedata) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messagedata);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        const socket = useAuthstore.getState().socket;



        socket.on("newMessage", (newMessage) => {

            if (newMessage.senderId !== selectedUser._id) return;

            set({
                messages: [...get().messages, newMessage],
            })
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthstore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    },

    setReplyingTo: (message) => {
        set({ replyingTo: message });
    },

    clearReplyingTo: () => {
        set({ replyingTo: null });
    },
}));