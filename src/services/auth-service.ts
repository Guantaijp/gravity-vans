import api from "./api"

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

const AuthService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/login", credentials)
        return response.data
    },

    async getCurrentUser(): Promise<AuthResponse["user"] | null> {
        try {
            const response = await api.get<{ user: AuthResponse["user"] }>("/auth/me")
            return response.data.user
        } catch (error:any) {
            return null
        }
    },

    logout(): void {
        localStorage.removeItem("gravity_vans_token")
        localStorage.removeItem("gravity_vans_user")
    },
}

export default AuthService
