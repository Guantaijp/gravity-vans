"use client"

import { useState, useCallback } from "react"

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}

export function useApi<T, P = any>(apiFunction: (params?: P) => Promise<T>, options: UseApiOptions<T> = {}) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const execute = useCallback(
        async (params?: P) => {
            try {
                setIsLoading(true)
                setError(null)
                const result = await apiFunction(params)
                setData(result)
                options.onSuccess?.(result)
                return result
            } catch (err) {
                const error = err instanceof Error ? err : new Error("An unknown error occurred")
                setError(error)
                options.onError?.(error)
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [apiFunction, options],
    )

    return { execute, data, isLoading, error, setData }
}
