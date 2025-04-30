"use client"

import { Outlet, useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import { useAuth } from "../contexts/auth-context"
import { LogOut, User } from "lucide-react"
import { useState } from "react"

export default function RootLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header with user menu */}
                <header className="bg-background border-b border-sidebar-border h-14 flex items-center justify-end px-4">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent"
                        >
                            <div className="w-8 h-8 rounded-full bg-sidebar-accent-foreground text-white flex items-center justify-center">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user?.name}</span>
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-background border border-sidebar-border rounded-md shadow-lg py-1 z-10">
                                <div className="px-4 py-2 border-b border-sidebar-border">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false)
                                        // Navigate to profile page when implemented
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-sidebar-accent"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
