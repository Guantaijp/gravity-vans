"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "manager" | "staff"
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem("gravity_vans_user")
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                } catch (error) {
                    console.error("Failed to parse stored user", error)
                    localStorage.removeItem("gravity_vans_user")
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        // In a real app, this would make an API call to validate credentials
        // For demo purposes, we'll accept any email with a password longer than 5 chars
        if (!email || password.length < 6) {
            throw new Error("Invalid credentials")
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Create mock user based on email
        const mockUser: User = {
            id: "usr_" + Math.random().toString(36).substr(2, 9),
            name: email.split("@")[0].replace(/[.]/g, " "),
            email,
            role: "admin",
        }

        // Save to localStorage for persistence
        localStorage.setItem("gravity_vans_user", JSON.stringify(mockUser))
        setUser(mockUser)
    }

    const logout = () => {
        localStorage.removeItem("gravity_vans_user")
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
