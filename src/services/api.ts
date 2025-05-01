import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    // baseURL:  "https://gravity-backend-beige.vercel.app/api",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("gravity_vans_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem("gravity_vans_token")
            localStorage.removeItem("gravity_vans_user")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

export default api
