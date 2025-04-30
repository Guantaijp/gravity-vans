import api from "./api"

export interface Driver {
    _id: string
    name: string
    phoneNumber: string
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
    idNumber: string
    licenseNumber: string
    psvNumber: string
    photoId?: string
    status: "active" | "inactive" | "on-leave" | "suspended"
    hireDate: string
    notes?: string
}

const DriverService = {
    async getAll(): Promise< Driver[]> {
        const response = await api.get<Driver[]>("/drivers")
        return response.data  // returns { drivers: Driver[] }
    },

    async getById(id: string): Promise<{ driver: Driver }> {
        const response = await api.get<{ driver: Driver }>(`/drivers/${id}`)
        return response.data  // returns { driver: Driver }
    },

    async create(driverData: FormData): Promise<{ driver: Driver }> {
        const response = await api.post<{ driver: Driver }>("/drivers", driverData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data  // returns { driver: Driver }
    },

    async update(id: string, driverData: Partial<DriverInput>): Promise<{ driver: Driver }> {
        const response = await api.put<{ driver: Driver }>(`/drivers/${id}`, driverData)
        return response.data  // returns { driver: Driver }
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/drivers/${id}`)
    },

    async updateStatus(id: string, status: Driver["status"]): Promise<{ driver: Driver }> {
        const response = await api.patch<{ driver: Driver }>(`/drivers/${id}/status`, { status })
        return response.data  // returns { driver: Driver }
    },

    async getAvailableDrivers(startDate: string, endDate: string): Promise<{ drivers: Driver[] }> {
        const response = await api.get<{ drivers: Driver[] }>("/drivers/available", {
            params: { startDate, endDate },
        })
        return response.data  // returns { drivers: Driver[] }
    },
}

export default DriverService
