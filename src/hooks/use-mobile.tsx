"use client"

import { useEffect, useState } from "react"

/**
 * A hook that returns true if the current device is mobile based on screen width.
 * @param breakpoint The breakpoint to consider as mobile (default: 768px)
 * @returns A boolean indicating if the current device is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check if window is defined (to avoid SSR issues)
        if (typeof window === "undefined") return

        // Function to update state based on window width
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint)
        }

        // Initial check
        checkMobile()

        // Add event listener for resize
        window.addEventListener("resize", checkMobile)

        // Clean up event listener
        return () => {
            window.removeEventListener("resize", checkMobile)
        }
    }, [breakpoint])

    return isMobile
}
