"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { ChevronLeft, Save, Trash2, AlertCircle } from "lucide-react"
// import { toast } from "sonner"
// import { DatePicker } from "../../components/ui/date-picker"
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import { useApi } from "../../hooks/use-api"
import { Alert, AlertDescription } from "../../components/ui/alert"

export default function VehicleEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const isEditing = !!id

    const [vehicle, setVehicle] = useState<Vehicle>({
        _id: "", createdAt: "", dailyRate: 0, seatSize: "", updatedAt: "",
        name: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        type: "",
        capacity: 0,
        fuel: "Petrol",
        transmission: "Automatic",
        licensePlate: "",
        description: "",
        features: [],
        insurance: "",
        insuranceExpiry: new Date().toISOString(),
        status: "available",
        speedGovernor: "",
        speedGovernorExpiry: "",
        roadServiceLicense: "",
        imageUrl: ""
    })

    const [featureInput, setFeatureInput] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formSubmitted, setFormSubmitted] = useState(false)

    // Fetch vehicle data using the service
    const { execute: fetchVehicle, isLoading: isLoadingVehicle } = useApi((id) => {
        if (!id) return Promise.reject(new Error('ID is required'));
        return VehicleService.getById(id);
    });

    // Save vehicle data using the service
    const { execute: saveVehicle, isLoading: isSaving, error: saveError } = useApi((vehicleData) => {
        if (isEditing) {
            // @ts-ignore
            return VehicleService.update(vehicleData);
        } else {
            return VehicleService.create(vehicleData);
        }
    });

    // Delete vehicle using the service
    const { execute: deleteVehicle, isLoading: isDeleting } = useApi((id) => {
        if (!id) return Promise.reject(new Error('ID is required'));
        return VehicleService.delete(id);
    });

    useEffect(() => {
        if (isEditing && id) {
            loadVehicle()
        }
    }, [id])

    const loadVehicle = async () => {
        try {
            const data = await fetchVehicle(id)
            setVehicle(data)
        } catch (err) {
            console.error("Error loading vehicle details:", err)
            // toast({
            //     title: "Error",
            //     description: "Failed to load vehicle details. Please try again.",
            //     variant: "destructive"
            // })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setVehicle({ ...vehicle, [name]: value })

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" })
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setVehicle({ ...vehicle, [name]: value })

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" })
        }
    }

    // const handleDateChange = (name: string, date: Date | undefined) => {
    //     if (date) {
    //         setVehicle({ ...vehicle, [name]: date.toISOString() })
    //
    //         // Clear error for this field if it exists
    //         if (errors[name]) {
    //             setErrors({ ...errors, [name]: "" })
    //         }
    //     }
    // }

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setVehicle({
                ...vehicle,
                features: [...(vehicle.features || []), featureInput.trim()]
            })
            setFeatureInput("")
        }
    }

    const handleRemoveFeature = (index: number) => {
        const updatedFeatures = [...(vehicle.features || [])]
        updatedFeatures.splice(index, 1)
        setVehicle({ ...vehicle, features: updatedFeatures })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!vehicle.name.trim()) newErrors.name = "Vehicle name is required"
        if (!vehicle.make.trim()) newErrors.make = "Make is required"
        if (!vehicle.model.trim()) newErrors.model = "Model is required"
        if (!vehicle.year) newErrors.year = "Year is required"
        if (!vehicle.type.trim()) newErrors.type = "Vehicle type is required"
        if (!vehicle.capacity || vehicle.capacity <= 0) newErrors.capacity = "Valid capacity is required"
        if (!vehicle.licensePlate.trim()) newErrors.licensePlate = "License plate is required"
        if (!vehicle.insurance.trim()) newErrors.insurance = "Insurance number is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormSubmitted(true)

        if (!validateForm()) {
            // toast({
            //     title: "Validation Error",
            //     description: "Please correct the errors in the form",
            //     variant: "destructive"
            // })
            return
        }

        try {
            await saveVehicle(vehicle)
            // toast({
            //     title: "Success",
            //     description: isEditing ? "Vehicle updated successfully" : "Vehicle created successfully"
            // })
            navigate(`/vehicles/${isEditing ? id : ''}`)
        } catch (err) {
            console.error("Error saving vehicle:", err)
            // toast({
            //     title: "Error",
            //     description: "Failed to save vehicle. Please try again.",
            //     variant: "destructive"
            // })
        }
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
            try {
                await deleteVehicle(id)
                // toast({
                //     title: "Success",
                //     description: "Vehicle deleted successfully"
                // })
                navigate("/vehicles")
            } catch (err:any) {
                console.error("Error deleting vehicle:", err)
                // toast({
                //     title: "Error",
                //     description: "Failed to delete vehicle. Please try again.",
                //     variant: "destructive"
                // })
            }
        }
    }

    if (isLoadingVehicle) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to={isEditing ? `/vehicles/${id}` : "/vehicles"} className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEditing ? "Edit Vehicle" : "Add New Vehicle"}</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vehicle Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {saveError && (
                                        <Alert variant="destructive" className="mb-6">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                An error occurred while saving the vehicle. Please try again.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className={errors.name && formSubmitted ? "text-red-500" : ""}>
                                                Vehicle Name*
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={vehicle.name}
                                                onChange={handleInputChange}
                                                className={errors.name && formSubmitted ? "border-red-500" : ""}
                                            />
                                            {errors.name && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="licensePlate" className={errors.licensePlate && formSubmitted ? "text-red-500" : ""}>
                                                License Plate*
                                            </Label>
                                            <Input
                                                id="licensePlate"
                                                name="licensePlate"
                                                value={vehicle.licensePlate}
                                                onChange={handleInputChange}
                                                className={errors.licensePlate && formSubmitted ? "border-red-500" : ""}
                                            />
                                            {errors.licensePlate && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="make" className={errors.make && formSubmitted ? "text-red-500" : ""}>
                                                Make*
                                            </Label>
                                            <Input
                                                id="make"
                                                name="make"
                                                value={vehicle.make}
                                                onChange={handleInputChange}
                                                className={errors.make && formSubmitted ? "border-red-500" : ""}
                                            />
                                            {errors.make && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="model" className={errors.model && formSubmitted ? "text-red-500" : ""}>
                                                Model*
                                            </Label>
                                            <Input
                                                id="model"
                                                name="model"
                                                value={vehicle.model}
                                                onChange={handleInputChange}
                                                className={errors.model && formSubmitted ? "border-red-500" : ""}
                                            />
                                            {errors.model && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year" className={errors.year && formSubmitted ? "text-red-500" : ""}>
                                                Year*
                                            </Label>
                                            <Input
                                                id="year"
                                                name="year"
                                                type="number"
                                                value={vehicle.year}
                                                onChange={handleInputChange}
                                                className={errors.year && formSubmitted ? "border-red-500" : ""}
                                                min={1900}
                                                max={new Date().getFullYear() + 1}
                                            />
                                            {errors.year && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className={errors.type && formSubmitted ? "text-red-500" : ""}>
                                                Vehicle Type*
                                            </Label>
                                            <Select
                                                value={vehicle.type}
                                                onValueChange={(value) => handleSelectChange("type", value)}
                                            >
                                                <SelectTrigger className={errors.type && formSubmitted ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sedan">Sedan</SelectItem>
                                                    <SelectItem value="SUV">SUV</SelectItem>
                                                    <SelectItem value="Van">Van</SelectItem>
                                                    <SelectItem value="Coaster">Coaster</SelectItem>
                                                    <SelectItem value="Bus">Bus</SelectItem>
                                                    <SelectItem value="Truck">Truck</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.type && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="capacity" className={errors.capacity && formSubmitted ? "text-red-500" : ""}>
                                                Seating Capacity*
                                            </Label>
                                            <Input
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                value={vehicle.capacity}
                                                onChange={handleInputChange}
                                                className={errors.capacity && formSubmitted ? "border-red-500" : ""}
                                                min={1}
                                            />
                                            {errors.capacity && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <Select
                                                value={vehicle.status}
                                                onValueChange={(value) => handleSelectChange("status", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="available">Available</SelectItem>
                                                    <SelectItem value="booked">Booked</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="out-of-service">Out of Service</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel">
                                                Fuel Type
                                            </Label>
                                            <Select
                                                value={vehicle.fuel}
                                                onValueChange={(value) => handleSelectChange("fuel", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select fuel type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Petrol">Petrol</SelectItem>
                                                    <SelectItem value="Diesel">Diesel</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                    <SelectItem value="Electric">Electric</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="transmission">
                                                Transmission
                                            </Label>
                                            <Select
                                                value={vehicle.transmission}
                                                onValueChange={(value) => handleSelectChange("transmission", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select transmission" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Automatic">Automatic</SelectItem>
                                                    <SelectItem value="Manual">Manual</SelectItem>
                                                    <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={vehicle.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="imageUrl">
                                            Image URL
                                        </Label>
                                        <Input
                                            id="imageUrl"
                                            name="imageUrl"
                                            value={vehicle.imageUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/vehicle-image.jpg"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Features</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            placeholder="Add a feature (e.g., Air Conditioning)"
                                        />
                                        <Button type="button" onClick={handleAddFeature} variant="outline">
                                            Add
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {vehicle.features && vehicle.features.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {vehicle.features.map((feature, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#e31c39] mr-2"></div>
                                                            {feature}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFeature(index)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No features added yet</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documentation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="insurance" className={errors.insurance && formSubmitted ? "text-red-500" : ""}>
                                            Insurance Number*
                                        </Label>
                                        <Input
                                            id="insurance"
                                            name="insurance"
                                            value={vehicle.insurance}
                                            onChange={handleInputChange}
                                            className={errors.insurance && formSubmitted ? "border-red-500" : ""}
                                        />
                                        {errors.insurance && formSubmitted && <p className="text-red-500 text-xs mt-1">{errors.insurance}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="insuranceExpiry">
                                            Insurance Expiry Date
                                        </Label>
                                        {/*<DatePicker*/}
                                        {/*    date={vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : undefined}*/}
                                        {/*    onSelect={(date) => handleDateChange("insuranceExpiry", date)}*/}
                                        {/*/>*/}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="speedGovernor">
                                            Speed Governor Number
                                        </Label>
                                        <Input
                                            id="speedGovernor"
                                            name="speedGovernor"
                                            value={vehicle.speedGovernor}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="speedGovernorExpiry">
                                            Speed Governor Expiry Date
                                        </Label>
                                        {/*<DatePicker*/}
                                        {/*    date={vehicle.speedGovernorExpiry ? new Date(vehicle.speedGovernorExpiry) : undefined}*/}
                                        {/*    onSelect={(date) => handleDateChange("speedGovernorExpiry", date)}*/}
                                        {/*/>*/}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="roadServiceLicense">
                                            Road Service License
                                        </Label>
                                        <Input
                                            id="roadServiceLicense"
                                            name="roadServiceLicense"
                                            value={vehicle.roadServiceLicense}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col space-y-2">
                                <Button
                                    type="submit"
                                    className="bg-[#e31c39] hover:bg-[#e31c39]/90"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {isEditing ? "Update Vehicle" : "Create Vehicle"}
                                        </>
                                    )}
                                </Button>

                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-red-500 text-red-500 hover:bg-red-50"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
                                                Deleting...
                                            </div>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Vehicle
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(isEditing ? `/vehicles/${id}` : "/vehicles")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}