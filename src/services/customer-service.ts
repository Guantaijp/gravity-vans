import api from "./api"

export interface Customer {
    _id: string
    customerId: string
    fullName: string
    email: string
    phone: string
    location: string
    idNumber?: string
    notes?: string
    bookings?: number
    totalSpent?: number
    lastBooking?: string
    createdAt: string
    updatedAt: string
}

export interface CustomerInput {
    fullName: string
    email: string
    phone: string
    location: string
    idNumber?: string
    notes?: string
}

const CustomerService = {
    async getAll(): Promise<Customer[]> {
        const response = await api.get<Customer[]>("/customers")
        return response.data
    },

    async getById(id: string): Promise<Customer> {
        const response = await api.get<Customer>(`/customers/${id}`)
        return response.data
    },

    async create(customerData: CustomerInput): Promise<Customer> {
        const response = await api.post<Customer>("/customers", customerData)
        return response.data
    },

    async update(id: string, data: CustomerInput): Promise<Customer> {
        const response = await api.put<Customer>(`/customers/${id}`, data)
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/customers/${id}`)
    },

    async getBookingStats(id: string): Promise<{ bookings: number; totalSpent: number; lastBooking: string }> {
        const response = await api.get<{ stats: { bookings: number; totalSpent: number; lastBooking: string } }>(
            `/customers/${id}/stats`
        )
        return response.data.stats
    },
}

export default CustomerService