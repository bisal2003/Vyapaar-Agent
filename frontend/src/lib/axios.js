import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
})

// Interceptor to add demo user info to requests
axiosInstance.interceptors.request.use((config) => {
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
        config.headers['X-Demo-User'] = demoUser;
    }
    return config;
});

export default axiosInstance;