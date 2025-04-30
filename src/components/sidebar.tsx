"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Car, Calendar, Users, Menu, X, Home, CreditCard } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"

export default function Sidebar() {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)

    const routes = [
        { name: "Dashboard", path: "/", icon: Home },
        { name: "Vehicles", path: "/vehicles", icon: Car },
        { name: "Bookings", path: "/bookings", icon: Calendar },
        { name: "Customers", path: "/customers", icon: Users },
        { name: "Drivers", path: "/drivers", icon: Users },
        { name: "Payments", path: "/payments", icon: CreditCard },

    ]

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out bg-sidebar text-sidebar-foreground md:relative md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-sidebar-border">
                        <div className="flex items-center justify-center py-4">
                            <h1 className="text-xl font-bold text-white">
                                <span className="text-sidebar-accent">Gravity</span> Vans
                            </h1>
                        </div>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        {routes.map((route) => {
                            const Icon = route.icon
                            return (
                                <Link
                                    key={route.path}
                                    to={route.path}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                                        location.pathname === route.path
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/10",
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {route.name}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="p-4 border-t border-sidebar-border">
                        <div className="flex items-center px-4 py-2">
                            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                                <span className="text-white font-bold">GV</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">Admin User</p>
                                <p className="text-xs text-gray-400">admin@gravityvans.co.ke</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
