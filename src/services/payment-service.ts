import api from "./api"

export interface Payment {
    _id: string
    booking: string | {
        _id: string
        customer: string | {
            _id: string
            fullName: string
            email: string
        }
        vehicle: string | {
            _id: string
            name: string
            model: string
            licensePlate: string
        }
        startDate: string
        endDate: string
        totalAmount: number
        paidAmount: number
    }
    amount: number
    method: "cash" | "card" | "bank" | "mobile" | "mpesa"
    status: "pending" | "completed" | "failed" | "refunded"
    notes?: string
    processedBy: string | {
        _id: string
        name: string
        email: string
    }
    ownerCommission?: number
    paidOutCommission?: number
    reference?: string
    paymentDate?: string
    createdAt: string
    updatedAt: string
}

export interface PaymentInput {
    bookingId: string
    amount: number
    method: "cash" | "card" | "bank" | "mobile" | "mpesa"
    reference?: string
    notes?: string
    ownerCommission?: number
    paidOutCommission?: number
    paymentDate?: string
}

const paymentService = {
    async getAll(): Promise<Payment[]> {
        const response = await api.get<Payment[]>("/payments")
        return response.data || []
    },

    async getOne(id: string): Promise<Payment> {
        const response = await api.get<Payment>(`/payments/${id}`)
        return response.data
    },

    async create(paymentData: PaymentInput): Promise<Payment> {
        const response = await api.post<Payment>("/payments", paymentData)
        return response.data
    },

    async updateStatus(id: string, status: Payment["status"], notes?: string): Promise<Payment> {
        const response = await api.patch<Payment>(`/payments/${id}/status`, { status, notes })
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/payments/${id}`)
    }
}

export default paymentService