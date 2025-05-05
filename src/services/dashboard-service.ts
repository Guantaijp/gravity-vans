import api from "./api"

// Define types for the dashboard data
export interface DashboardData {
    counts: {
        totalVehicles: number
        totalBookings: number
        activeBookings: number
        totalCustomers: number
    }
    revenue: {
        totalRevenue: number
        totalPaid: number
        outstanding: number
        companyRevenue: number
        ownerCommissions: number
        paidOwnerCommissions: number
        unpaidOwnerCommissions: number
        referrerCommissions: number
    }
    vehicleStatus: {
        available: number
        rented: number
        maintenance: number
        [key: string]: number
    }
    bookingOverview: Array<{
        period: string
        count: number
        dateRange: string
    }>
    recentBookings: Array<{
        id: string
        customer: string
        vehicle: string
        startDate: string
        endDate: string
        amount: number
        status: string
    }>
    upcomingReturns: Array<{
        id: string
        customer: string
        vehicle: string
        returnDate: string
        daysLeft: number
    }>
}

// Optional parameters for dashboard data
export interface DashboardParams {
    startDate?: string
    endDate?: string
    period?: "day" | "week" | "month" | "year"
}

const dashboardService = {
    async getDashboardData(params?: DashboardParams): Promise<DashboardData> {
        try {
            // Build query parameters if provided
            let queryString = ""
            if (params) {
                const queryParams = new URLSearchParams()
                if (params.startDate) queryParams.append("startDate", params.startDate)
                if (params.endDate) queryParams.append("endDate", params.endDate)
                if (params.period) queryParams.append("period", params.period)
                queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
            }

            const response = await api.get<DashboardData>(`/dashboard/dash${queryString}`)
            return response.data
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
            throw error
        }
    },

    // Helper function to format currency (KES)
    formatCurrency(amount: number): string {
        return `KES ${amount.toLocaleString()}`
    },

    // Helper function to calculate percentage change
    calculatePercentageChange(current: number, previous: number): string {
        if (previous === 0) return "+100%"

        const change = ((current - previous) / previous) * 100
        const sign = change >= 0 ? "+" : ""
        return `${sign}${change.toFixed(0)}%`
    },

    // Helper function to get trend data for charts
    getBookingTrendData(bookingOverview: DashboardData["bookingOverview"]) {
        return {
            labels: bookingOverview.map((week) => week.period),
            data: bookingOverview.map((week) => week.count),
        }
    },

    // Helper function to get vehicle status data for charts
    getVehicleStatusData(vehicleStatus: DashboardData["vehicleStatus"]) {
        return {
            labels: Object.keys(vehicleStatus).map((status) => status.charAt(0).toUpperCase() + status.slice(1)),
            data: Object.values(vehicleStatus),
            total: Object.values(vehicleStatus).reduce((sum, count) => sum + count, 0),
        }
    },

    // Helper function to calculate fleet utilization
    calculateFleetUtilization(activeBookings: number, totalVehicles: number): string {
        if (totalVehicles === 0) return "0%"
        return `${Math.round((activeBookings / totalVehicles) * 100)}%`
    },

    // Helper function to format date
    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    },

    // Helper function to get status badge color
    getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "completed":
                return "bg-blue-100 text-blue-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    },

    // Helper function to get days left badge color
    getDaysLeftColor(daysLeft: number): string {
        if (daysLeft <= 1) return "bg-red-100 text-red-800"
        if (daysLeft <= 3) return "bg-yellow-100 text-yellow-800"
        return "bg-green-100 text-green-800"
    },
}

export default dashboardService
