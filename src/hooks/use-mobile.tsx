"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the current device is mobile based on screen width
 * @param breakpoint - The width threshold to consider a device mobile (default: 768px)
 * @returns boolean - True if the device is mobile, false otherwise
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
    )

    useEffect(() => {
        if (typeof window === "undefined") return

        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint)
        }

        // Check on mount and add resize listener
        checkMobile()
        window.addEventListener("resize", checkMobile)

        // Clean up event listener
        return () => {
            window.removeEventListener("resize", checkMobile)
        }
    }, [breakpoint])

    return isMobile
}
