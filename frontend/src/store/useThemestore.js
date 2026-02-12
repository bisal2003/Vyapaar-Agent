import { create } from "zustand";

export const useThemestore=create((set)=>({
    theme:localStorage.getItem("chat-theme") || "coffee",

    setTheme:(theme)=>{
        set({theme});
        localStorage.setItem("chat-theme",theme);
        // console.log("Theme set to: ",theme);
    }
}));
   
