import api from "./api"

export interface Customer {
    _id: string
    name: string
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
    name: string
    email: string
    phone: string
    location: string
    idNumber?: string
    notes?: string
}

const CustomerService = {
    async getAll(): Promise<Customer[]> {
        const response = await api.get<{ customers: Customer[] }>("/customers")
        return response.data.customers
    },

    async getById(id: string): Promise<Customer> {
        const response = await api.get<{ customer: Customer }>(`/customers/${id}`)
        return response.data.customer
    },

    async create(customerData: CustomerInput): Promise<Customer> {
        const response = await api.post<{ customer: Customer }>("/customers", customerData)
        return response.data.customer
    },

    async update(id: string, customerData: Partial<CustomerInput>): Promise<Customer> {
        const response = await api.put<{ customer: Customer }>(`/customers/${id}`, customerData)
        return response.data.customer
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