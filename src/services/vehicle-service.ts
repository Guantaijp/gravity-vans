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
    seatSize: string
    dailyRate?: number
    status: "available" | "booked" | "maintenance" | "out-of-service"
    fuel: string
    transmission: string
    insurance: string
    insuranceExpiry: string
    roadServiceLicense: string
    speedGovernor: string
    speedGovernorExpiry: string
    description: string
    features: string[]
    imageUrl: string
    createdAt: string
    updatedAt: string
    ownershipType?:string
    ownerName?: string
    ownerContact?: string
}

export interface VehicleInput {
    name: string
    make: string
    model: string
    year: number
    type: string
    licensePlate: string
    capacity: number
    seatSize: string
    dailyRate: number
    status: "available" | "booked" | "maintenance" | "out-of-service"
    fuel: string
    transmission: string
    insurance: string
    insuranceExpiry: string
    roadServiceLicense: string
    speedGovernor: string
    speedGovernorExpiry: string
    description: string
    features: string[]
    imageUrl?: string
}

const VehicleService = {
    async getAll(): Promise<Vehicle[]> {
        const response = await api.get<Vehicle[]>("/vehicles")
        return response.data
    },

    async getById(id: string): Promise<Vehicle> {
        const response = await api.get< Vehicle >(`/vehicles/${id}`)
        return response.data
    },

    async create(vehicleData: VehicleInput, imageFile?: File | null): Promise<Vehicle> {
        // Ensure all required fields have values
        const completeVehicleData = {
            ...vehicleData,
            // Make sure name is set
            name: vehicleData.name || `${vehicleData.make} ${vehicleData.model} - ${vehicleData.licensePlate}`,
            // Make sure dailyRate has a value (it's required by schema)
            dailyRate: vehicleData.dailyRate ?? 0
        };

        // Create a new FormData instance
        const formData = new FormData();

        // Add the vehicle data as JSON
        formData.append("data", JSON.stringify(completeVehicleData));

        // Add the image file if provided
        if (imageFile) {
            console.log("Adding image file:", imageFile.name, "Type:", imageFile.type, "Size:", imageFile.size);
            formData.append("imageUrl", imageFile);
        }

        try {
            // Debug: log formdata entries
            console.log("FormData contents:");
            for (const pair of (formData as any).entries()) {
                console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
            }

            // Important: DO NOT set Content-Type header when using FormData
            // Let the browser set it automatically with the correct boundary
            const response = await api.post<{ vehicle: Vehicle }>("/vehicles", formData);

            console.log("Create vehicle response:", response.data);
            return response.data.vehicle;
        } catch (error: any) {
            console.error("Failed to create vehicle:", error?.response?.data || error);
            throw error;
        }
    },

    async update(id: string, vehicleData: Partial<VehicleInput>, imageFile?: File): Promise<Vehicle> {
        const formData = new FormData();
        formData.append("data", JSON.stringify(vehicleData));

        if (imageFile) {
            console.log("Adding image file for update:", imageFile.name);
            formData.append("imageUrl", imageFile);
        }

        // Again, do not set Content-Type header
        const response = await api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, formData);

        return response.data.vehicle;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/vehicles/${id}`)
    },

    async uploadImage(vehicleId: string, imageFile: File): Promise<{ imageUrl: string }> {
        const formData = new FormData()
        console.log("Uploading image:", imageFile.name, "Type:", imageFile.type, "Size:", imageFile.size);
        formData.append("imageUrl", imageFile);

        // Do not set Content-Type header
        const response = await api.post<{ imageUrl: string }>(`/vehicles/${vehicleId}/image`, formData);

        return response.data
    },
}

export default VehicleService
