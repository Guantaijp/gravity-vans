"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AuthService from "../services/auth-service"

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "staff"
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void> // Changed return type to match implementation
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // First check if we have a token
                const token = localStorage.getItem("gravity_vans_token")
                if (!token) {
                    setIsLoading(false)
                    return
                }

                // If we have a token, verify it by getting the current user
                const userData = await AuthService.getCurrentUser()
                if (userData) {
                    setUser({
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role as "admin" | "staff",
                    })
                }
            } catch (error) {
                console.error("Authentication error:", error)
                // Clear invalid auth data
                localStorage.removeItem("gravity_vans_token")
                localStorage.removeItem("gravity_vans_user")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true)
        try {
            const response = await AuthService.login({ email, password })

            // Save token to localStorage
            localStorage.setItem("gravity_vans_token", response.token)

            // Save user data
            const userData = {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
                role: response.user.role,
            }
            localStorage.setItem("gravity_vans_user", JSON.stringify(userData))

            setUser({
                ...userData,
                role: userData.role as 'admin' | 'staff',
            });
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        AuthService.logout()
        setUser(null)
    }

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}