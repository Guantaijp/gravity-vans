import api from "./api"

export interface Vehicle {
    _id: string
    name: string
    make: string
    model: string
    year: number
    type: string
    licensePlate: string
    capacity: number
    dailyRate: number
    status: "Available" | "Booked" | "Maintenance"
    fuel: string
    transmission: string
    insurance: string
    insuranceExpiry: string
    description: string
    features: string[]
    image: string
    createdAt: string
    updatedAt: string
}

export interface VehicleInput {
    name: string
    make: string
    model: string
    year: number
    type: string
    licensePlate: string
    capacity: number
    dailyRate: number
    status: "Available" | "Booked" | "Maintenance"
    fuel: string
    transmission: string
    insurance: string
    insuranceExpiry: string
    description: string
    features: string[]
    image?: string
}

const VehicleService = {
    async getAll(): Promise<Vehicle[]> {
        const response = await api.get<{ vehicles: Vehicle[] }>("/vehicles")
        return response.data.vehicles
    },

    async getById(id: string): Promise<Vehicle> {
        const response = await api.get<{ vehicle: Vehicle }>(`/vehicles/${id}`)
        return response.data.vehicle
    },

    async create(vehicleData: VehicleInput): Promise<Vehicle> {
        const response = await api.post<{ vehicle: Vehicle }>("/vehicles", vehicleData)
        return response.data.vehicle
    },

    async update(id: string, vehicleData: Partial<VehicleInput>): Promise<Vehicle> {
        const response = await api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, vehicleData)
        return response.data.vehicle
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/vehicles/${id}`)
    },
}

export default VehicleService
