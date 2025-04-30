import api from "./api"

export interface Booking {
    _id: string
    customer:
        | string
        | {
        _id: string
        name: string
        email: string
        phone: string
    }
    vehicle:
        | string
        | {
        _id: string
        name: string
        licensePlate: string
        type: string
        capacity: number
    }
    driver?:
        | string
        | {
        _id: string
        name: string
        phone: string
    }
    startDate: string
    endDate: string
    status: "Pending" | "Active" | "Completed" | "Cancelled"
    totalAmount: number
    deposit: number
    balance: number
    paymentStatus: "Unpaid" | "Partially Paid" | "Paid"
    additionalServices: Array<{
        name: string
        cost: number
    }>
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface BookingInput {
    customer: string
    vehicle: string
    driver?: string
    startDate: string
    endDate: string
    status: "Pending" | "Active" | "Completed" | "Cancelled"
    totalAmount: number
    deposit: number
    additionalServices?: Array<{
        name: string
        cost: number
    }>
    notes?: string
}

const BookingService = {
    async getAll(): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>("/bookings")
        return response.data.bookings
    },

    async getById(id: string): Promise<Booking> {
        const response = await api.get<{ booking: Booking }>(`/bookings/${id}`)
        return response.data.booking
    },

    async create(bookingData: BookingInput): Promise<Booking> {
        const response = await api.post<{ booking: Booking }>("/bookings", bookingData)
        return response.data.booking
    },

    async update(id: string, bookingData: Partial<BookingInput>): Promise<Booking> {
        const response = await api.put<{ booking: Booking }>(`/bookings/${id}`, bookingData)
        return response.data.booking
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/bookings/${id}`)
    },

    async updateStatus(id: string, status: Booking["status"]): Promise<Booking> {
        const response = await api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status })
        return response.data.booking
    },

    async getBookingsByVehicle(vehicleId: string): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>(`/bookings/vehicle/${vehicleId}`)
        return response.data.bookings
    },

    async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
        const response = await api.get<{ bookings: Booking[] }>(`/bookings/customer/${customerId}`)
        return response.data.bookings
    },
}

export default BookingService
