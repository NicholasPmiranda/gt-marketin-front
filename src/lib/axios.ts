import axios, {InternalAxiosRequestConfig} from "axios";

// Create axios instance with base URL from env
const api = axios.create({
    // NEXT_PUBLIC_API_BASE_URL deve ser definida no .env
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
})

// Request interceptor to add JWT token automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        if (token && config.headers) {
            config.headers["Authorization"] = `Bearer ${token}`
        }
    }
    return config
})

export default api
