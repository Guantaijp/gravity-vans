import api from "./api"

export interface Payment {
    _id: string
    booking:
        | string
        | {
        _id: string
        customer: {
            _id: string
            name: string
        }
        vehicle: {
            _id: string
            name: string
        }
        startDate: string
        endDate: string
    }
    amount: number
    method: "Cash" | "M-Pesa" | "Bank Transfer" | "Credit Card"
    reference: string
    status: "Completed" | "Pending" | "Failed"
    date: string
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface PaymentInput {
    booking: string
    amount: number
    method: "Cash" | "M-Pesa" | "Bank Transfer" | "Credit Card"
    reference: string
    status: "Completed" | "Pending" | "Failed"
    date: string
    notes?: string
}

const PaymentService = {
    async getAll(): Promise<Payment[]> {
        const response = await api.get<{ payments: Payment[] }>("/payments")
        return response.data.payments
    },

    async getById(id: string): Promise<Payment> {
        const response = await api.get<{ payment: Payment }>(`/payments/${id}`)
        return response.data.payment
    },

    async create(paymentData: PaymentInput): Promise<Payment> {
        const response = await api.post<{ payment: Payment }>("/payments", paymentData)
        return response.data.payment
    },

    async update(id: string, paymentData: Partial<PaymentInput>): Promise<Payment> {
        const response = await api.put<{ payment: Payment }>(`/payments/${id}`, paymentData)
        return response.data.payment
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/payments/${id}`)
    },

    async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
        const response = await api.get<{ payments: Payment[] }>(`/payments/booking/${bookingId}`)
        return response.data.payments
    },
}

export default PaymentService
