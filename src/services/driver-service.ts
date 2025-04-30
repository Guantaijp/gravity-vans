import api from "./api"

export interface Driver {
    _id: string
    name: string
    phone: string
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
    phone: string
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
        const response = await api.get<{ drivers: Driver[] }>("/drivers")
        return response.data.drivers
    },

    async getById(id: string): Promise<Driver> {
        const response = await api.get<{ driver: Driver }>(`/drivers/${id}`)
        return response.data.driver
    },

    async create(driverData: DriverInput): Promise<Driver> {
        const response = await api.post<{ driver: Driver }>("/drivers", driverData)
        return response.data.driver
    },

    async update(id: string, driverData: Partial<DriverInput>): Promise<Driver> {
        const response = await api.put<{ driver: Driver }>(`/drivers/${id}`, driverData)
        return response.data.driver
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/drivers/${id}`)
    },

    async updateStatus(id: string, status: Driver["status"]): Promise<Driver> {
        const response = await api.patch<{ driver: Driver }>(`/drivers/${id}/status`, { status })
        return response.data.driver
    },

    async getAvailableDrivers(startDate: string, endDate: string): Promise<Driver[]> {
        const response = await api.get<{ drivers: Driver[] }>("/drivers/available", {
            params: { startDate, endDate },
        })
        return response.data.drivers
    },
}

export default DriverService
