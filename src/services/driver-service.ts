import api  from "./api"

export interface Driver {
    _id: string
    driverId?: string
    name: string
    phoneNumber: string
    email?: string
    address?: string
    idNumber: string
    licenseNumber: string
    psvNumber: string
    photoId: string
    status: "active" | "inactive" | "on-leave" | "suspended"
    hireDate: string
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface DriverInput {
    name: string
    phoneNumber: string
    email?: string
    address?: string
    idNumber: string
    licenseNumber: string
    psvNumber: string
    photoId?: string
    status: "active" | "inactive" | "on-leave" | "suspended"
    hireDate: string
    notes?: string
}

const DriverService = {
    async getAll(): Promise<Driver[]> {
        const response = await api.get<Driver[]>("/drivers")
        return response.data
    },

    async getById(id: string | undefined): Promise<Driver> {
        const response = await api.get<Driver>(`/drivers/${id}`)
        return response.data
    },

    async create(driverData: FormData): Promise<{ driver: Driver }> {
        const response = await api.post<{ driver: Driver }>("/drivers", driverData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    },

    async update(id: string, driverData: FormData): Promise<{ driver: Driver }> {
        const response = await api.put<{ driver: Driver }>(`/drivers/${id}`, driverData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/drivers/${id}`)
    },

    async updateStatus(id: string, status: Driver["status"]): Promise<{ driver: Driver }> {
        const response = await api.patch<{ driver: Driver }>(`/drivers/${id}/status`, { status })
        return response.data
    },

    async getAvailableDrivers(startDate: string, endDate: string): Promise<Driver[]> {
        const response = await api.get<{ drivers: Driver[] }>("/drivers/available", {
            params: { startDate, endDate },
        })
        // console.log(response)
        return response.data.drivers || []
    },

    async getBookings(driverId: string): Promise<any[]> {
        const response = await api.get<any[]>(`/drivers/${driverId}/bookings`)
        return response.data
    },
}

export default DriverService
