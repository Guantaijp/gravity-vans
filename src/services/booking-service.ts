import api from "./api"

export interface Booking {
    _id: string
    customer: string | { _id: string; fullName: string; email: string; phone: string }
    vehicle: string | { _id: string; name: string; licensePlate: string; type: string; capacity: string }
    driver?: string | { _id: string; name: string; phone: string }
    bookedBy?: string | { _id: string; name: string; email: string }
    startDate: string
    endDate: string
    status: "Pending" | "Active" | "Completed" | "Cancelled"
    totalAmount: number
    paymentStatus: "Unpaid" | "Partially Paid" | "Paid"
    additionalServices?: Array<{ name: string; cost: number }>
    commissions: {
        companyRevenue: {
            type: number
            default: 0
        }
        ownerPayout?: {
            amount: number
            paid: boolean
            ownerName: string
        }
        referrerPayout?: {
            amount: number
            paid: boolean
            referrerName: string
        }
    }
    notes?: string
    timeline: Array<{ status: string; date: string; note: string }>
    payments?: Array<Payment>
    calculatedBalance?:string
    balance?: number
    deposit?: number

    createdAt?: string
    updatedAt?: string
}

export interface Payment {
    _id: string
    booking: string
    amount: number
    method: string
    reference?: string
    notes?: string
    paymentDate: string
    recordedBy: string
}

export interface BookingInput {
    customer: string
    vehicle: string | null;
    bookedBy: string // Changed from optional to required
    driver?: string
    startDate: string
    endDate: string
    status?: "Pending" | "Active" | "Completed" | "Cancelled"
    totalAmount: number
    paymentStatus?: "Unpaid" | "Partially Paid" | "Paid"
    additionalServices?: Array<{ name: string; cost: number }>
    commissions?: {
        companyRevenue?: number
        ownerPayout?: {
            amount: number
            paid?: boolean
            ownerName?: string
        }
        referrerPayout?: {
            amount: number
            paid?: boolean
            referrerName?: string
        }
    }
    notes?: string
    timeline?: Array<{ status: string; date: string; note: string }>
}

export interface PaymentInput {
    bookingId: string
    amount: number
    method: string
    reference?: string
    notes?: string
    paymentDate?: string
}

const bookingService = {
    async getAll(): Promise<Booking[]> {
        const response = await api.get<Booking[]>("/bookings")
        return response.data || []
    },

    async getOne(id: string): Promise<Booking> {
        const response = await api.get<{ booking: Booking }>(`/bookings/${id}`)
        return response.data.booking
    },

    async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>(`/bookings/customer/${customerId}`)
        return response.data.bookings || []
    },

    async getBookingsByVehicle(vehicleId: string): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>(`/bookings/vehicle/${vehicleId}`)
        return response.data.bookings || []
    },

    async getBookingsByDriver(driverId: string): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>(`/bookings/driver/${driverId}`)
        return response.data.bookings || []
    },

    async create(bookingData: BookingInput): Promise<Booking> {
        // Format the booking data to match backend expectations
        const formattedData = this.formatBookingData(bookingData)

        // If driver is "no-driver", remove it from the request
        if (formattedData.driver === "no-driver") {
            const { driver, ...bookingDataWithoutDriver } = formattedData
            const response = await api.post<{ booking: Booking }>("/bookings", bookingDataWithoutDriver)
            return response.data.booking
        }

        const response = await api.post<{ booking: Booking }>("/bookings", formattedData)
        return response.data.booking
    },

    async update(id: string, bookingData: Partial<BookingInput>): Promise<Booking> {
        // Format the booking data to match backend expectations
        const formattedData = this.formatBookingData(bookingData)

        // If driver is "no-driver", remove it from the request or set to null
        if (formattedData.driver === "no-driver") {
            const { driver, ...bookingDataWithoutDriver } = formattedData
            const response = await api.put<{ booking: Booking }>(`/bookings/${id}`, bookingDataWithoutDriver)
            return response.data.booking
        }

        const response = await api.put<{ booking: Booking }>(`/bookings/${id}`, formattedData)
        return response.data.booking
    },

    async updateStatus(id: string, status: Booking["status"], note?: string): Promise<Booking> {
        const response = await api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status, note })
        return response.data.booking
    },

    async addPayment(
        id: string,
        paymentData: {
            amount: number
            paymentMethod: string
            reference?: string
            notes?: string
        },
    ): Promise<{ booking: Booking; payment: Payment }> {
        const payment: PaymentInput = {
            bookingId: id,
            amount: paymentData.amount,
            method: paymentData.paymentMethod,
            reference: paymentData.reference,
            notes: paymentData.notes,
        }

        const response = await api.post<{ booking: Booking; payment: Payment }>(`/bookings/${id}/payments`, payment)
        return response.data
    },

    async recordCommissionPayment(id: string, paymentData: { amount: number; notes?: string }): Promise<Booking> {
        const response = await api.post<{ booking: Booking }>(`/bookings/${id}/commission-payment`, paymentData)
        return response.data.booking
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/bookings/${id}`)
    },

    // Helper method to format booking data to match backend expectations
    formatBookingData(bookingData: Partial<BookingInput>): any {
        const formattedData = { ...bookingData }

        // Format commissions if provided
        if (bookingData.commissions) {
            formattedData.commissions = {
                companyRevenue: bookingData.commissions.companyRevenue || 0,
                ownerPayout: bookingData.commissions.ownerPayout
                    ? {
                        amount: bookingData.commissions.ownerPayout.amount,
                        paid: bookingData.commissions.ownerPayout.paid || false,
                        ownerName: bookingData.commissions.ownerPayout.ownerName || "",
                    }
                    : undefined,
                referrerPayout: bookingData.commissions.referrerPayout
                    ? {
                        amount: bookingData.commissions.referrerPayout.amount,
                        paid: bookingData.commissions.referrerPayout.paid || false,
                        referrerName: bookingData.commissions.referrerPayout.referrerName || "",
                    }
                    : undefined,
            }
        }

        // Initialize timeline if not provided
        if (!formattedData.timeline) {
            formattedData.timeline = [
                {
                    status: formattedData.status || "Pending",
                    date: new Date().toISOString(),
                    note: "Booking created",
                },
            ]
        }

        return formattedData
    },
}

export default bookingService
