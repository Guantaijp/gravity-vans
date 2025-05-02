"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { ChevronLeft, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { VehicleInput } from "../../services/vehicle-service.ts"

export default function NewVehiclePage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [form, setForm] = useState<
        VehicleInput & {
        ownershipType: string
        roadServiceLicense: string
        speedGovernor: string
        speedGovernorExpiry: string
        ownerName?: string
        ownerContact?: string
    }
    >({
        name: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        type: "",
        capacity: 0,
        seatSize: "",
        dailyRate: 0,
        fuel: "",
        transmission: "",
        insurance: "",
        insuranceExpiry: "",
        description: "",
        features: [],
        imageUrl: "",
        status: "available",
        ownershipType: "owned",
        roadServiceLicense: "",
        speedGovernor: "",
        speedGovernorExpiry: "",
        ownerName: "",
        ownerContact: "",
    })

    const [imageFile, setImageFile] = useState<File | null>(null)

    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Get the first file if it exists
        if (file) {
            setImageFile(file); // Update the state with the selected file

            // Create a preview URL for the selected image
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl); // Set the preview URL for displaying the image
        }
    }

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }))
    }

    // Update the handleSubmit function to properly handle the image file
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Check for all required fields
        if (!form.make || !form.model || !form.year || !form.licensePlate) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsLoading(true)

        try {
            // Generate a name if not provided
            const name = form.name || `${form.make} ${form.model} - ${form.licensePlate}`

            // Create a FormData object
            const formData = new FormData()

            // Add all the vehicle data fields
            const vehicleData = {
                name,
                make: form.make,
                model: form.model,
                year: form.year,
                type: form.type || "",
                licensePlate: form.licensePlate,
                capacity: form.capacity || 0,
                seatSize: form.seatSize || "",
                dailyRate: form.dailyRate || 0,
                status: form.status || "available",
                fuel: form.fuel || "",
                transmission: form.transmission || "",
                insurance: form.insurance || "",
                insuranceExpiry: form.insuranceExpiry || "",
                roadServiceLicense: form.roadServiceLicense || "",
                speedGovernor: form.speedGovernor || "",
                speedGovernorExpiry: form.speedGovernorExpiry || "",
                description: form.description || "",
                features: form.features || [],
                mileage: 0,
                notes: ""
            }

            // If it's outsourced, add owner details to the description
            if (form.ownershipType === "outsourced" && form.ownerName && form.ownerContact) {
                vehicleData.description = `Owner: ${form.ownerName}, Contact: ${form.ownerContact}\n${vehicleData.description}`
            }

            // Add each field individually to FormData
            Object.entries(vehicleData).forEach(([key, value]) => {
                // Special handling for arrays like features
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        // If array is empty, still add it as an empty array identifier
                        formData.append(`${key}`, "")
                    } else {
                        value.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, item)
                        })
                    }
                } else {
                    // Convert all values to strings
                    formData.append(key, String(value))
                }
            })

            // Add the image file if provided
            if (imageFile) {
                console.log("Adding image file:", imageFile.name, "Type:", imageFile.type, "Size:", imageFile.size)
                formData.append("imageUrl", imageFile, imageFile.name)
            }

            // Log the FormData contents for debugging
            console.log("FormData contents:")
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${typeof pair[1] === "object" ? "File object" : pair[1]}`)
            }

            // Make the API request with the correct endpoint
            const token = localStorage.getItem("gravity_vans_token")

            // const response = await fetch("http://localhost:5000/api/vehicles", {
            const response = await fetch("https://gravity-backend-beige.vercel.app/api/vehicles", {
                method: "POST",
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
                body: formData, // Don't set Content-Type when using FormData
            })

            // Check if the response is ok before trying to parse JSON
            if (!response.ok) {
                const errorText = await response.text()
                console.error("Error response:", errorText)

                let errorMessage = "Failed to create vehicle"
                try {
                    // Try to parse the error as JSON if possible
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.message || errorMessage
                } catch (e) {
                    // If parsing fails, use the raw text
                    errorMessage = errorText || errorMessage
                }

                throw new Error(errorMessage)
            }

            const data = await response.json()
            const newVehicle = data.vehicle

            console.log("Vehicle created successfully:", newVehicle)

            toast.success("Vehicle added successfully", {
                description: `${newVehicle.make} ${newVehicle.model} has been added to the system.`,
            })

            navigate("/vehicles")
        } catch (err: any) {
            console.error("Failed to add vehicle:", err)
            toast.error("Failed to add vehicle", {
                description: err.message || "There was a problem adding the vehicle. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Function to handle specific seat size options based on vehicle type
    const getSeatSizeOptions = () => {
        switch (form.type) {
            case "van":
                return [10, 14].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                        {size} Seater
                    </SelectItem>
                ))
            case "minibus":
                return [14, 16].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                        {size} Seater
                    </SelectItem>
                ))
            case "bus":
                return [22, 33, 45].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                        {size} Seater
                    </SelectItem>
                ))
            default:
                return [4, 5, 7, 10, 14, 16, 22, 33, 45].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                        {size} Seater
                    </SelectItem>
                ))
        }
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/vehicles" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Vehicle</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                                <CardDescription>Enter the details for the new vehicle</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Vehicle Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="make">
                                            Make <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="make"
                                            name="make"
                                            value={form.make}
                                            onChange={handleChange}
                                            placeholder="e.g. Toyota"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">
                                            Model <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="model"
                                            name="model"
                                            value={form.model}
                                            onChange={handleChange}
                                            placeholder="e.g. Hiace"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">
                                            Year <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="year"
                                            name="year"
                                            type="number"
                                            value={form.year}
                                            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                                            placeholder="e.g. 2022"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="licensePlate">
                                            License Plate <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="licensePlate"
                                            name="licensePlate"
                                            value={form.licensePlate}
                                            onChange={handleChange}
                                            placeholder="e.g. KCB 123A"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Vehicle Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })} required>
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="van">Van</SelectItem>
                                                <SelectItem value="minibus">Minibus</SelectItem>
                                                <SelectItem value="suv">SUV</SelectItem>
                                                <SelectItem value="bus">Bus</SelectItem>
                                                <SelectItem value="sedan">Sedan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seatSize">
                                            Seat Size <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={form.seatSize}
                                            onValueChange={(value) => {
                                                setForm({ ...form, seatSize: value, capacity: Number.parseInt(value) })
                                            }}
                                            required
                                        >
                                            <SelectTrigger id="seatSize">
                                                <SelectValue placeholder="Select seat size" />
                                            </SelectTrigger>
                                            <SelectContent>{getSeatSizeOptions()}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Ownership Section */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-medium">Ownership Information</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownershipType">
                                            Ownership Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={form.ownershipType}
                                            onValueChange={(value) => setForm({ ...form, ownershipType: value })}
                                        >
                                            <SelectTrigger id="ownershipType">
                                                <SelectValue placeholder="Select ownership" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owned">Owned</SelectItem>
                                                <SelectItem value="outsourced">Outsourced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {form.ownershipType === "outsourced" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="ownerName">
                                                    Owner Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="ownerName"
                                                    name="ownerName"
                                                    value={form.ownerName}
                                                    onChange={handleChange}
                                                    placeholder="Owner's full name"
                                                    required={form.ownershipType === "outsourced"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="ownerContact">
                                                    Owner Contact <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="ownerContact"
                                                    name="ownerContact"
                                                    value={form.ownerContact}
                                                    onChange={handleChange}
                                                    placeholder="Owner's phone number"
                                                    required={form.ownershipType === "outsourced"}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Technical Details */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-medium">Technical Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel">
                                                Fuel Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={form.fuel} onValueChange={(value) => setForm({ ...form, fuel: value })} required>
                                                <SelectTrigger id="fuel">
                                                    <SelectValue placeholder="Select fuel type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="petrol">Petrol</SelectItem>
                                                    <SelectItem value="diesel">Diesel</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                    <SelectItem value="electric">Electric</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="transmission">
                                                Transmission <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={form.transmission}
                                                onValueChange={(value) => setForm({ ...form, transmission: value })}
                                                required
                                            >
                                                <SelectTrigger id="transmission">
                                                    <SelectValue placeholder="Select transmission" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="manual">Manual</SelectItem>
                                                    <SelectItem value="automatic">Automatic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="roadServiceLicense">
                                                Road Service License <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="roadServiceLicense"
                                                name="roadServiceLicense"
                                                value={form.roadServiceLicense}
                                                onChange={handleChange}
                                                placeholder="License number"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="speedGovernor">
                                                Speed Governor <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="speedGovernor"
                                                name="speedGovernor"
                                                value={form.speedGovernor}
                                                onChange={handleChange}
                                                placeholder="Speed governor serial number"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="speedGovernorExpiry">Speed Governor Expiry</Label>
                                            <Input
                                                id="speedGovernorExpiry"
                                                name="speedGovernorExpiry"
                                                type="date"
                                                value={form.speedGovernorExpiry}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Insurance Details */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-medium">Insurance Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="insurance">
                                                Insurance Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="insurance"
                                                name="insurance"
                                                value={form.insurance}
                                                onChange={handleChange}
                                                placeholder="Insurance policy number"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="insuranceExpiry">
                                                Insurance Expiry <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="insuranceExpiry"
                                                name="insuranceExpiry"
                                                type="date"
                                                value={form.insuranceExpiry}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Vehicle Image</Label>
                                    <div className="border border-dashed rounded-md p-8 text-center">
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-lg">
                                                    <img
                                                        src={imagePreview || "/placeholder.svg"}
                                                        alt="Vehicle preview"
                                                        className="h-auto w-full object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setImageFile(null)
                                                        setImagePreview(null)
                                                    }}
                                                >
                                                    Remove Image
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground mb-2">Upload a primary image of the vehicle</p>
                                                <Input type="file" id="imageUrl" accept="image/*" onChange={handleImageChange} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Feature Points List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="features">Vehicle Features/Description (Add as points)</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (form.description.trim()) {
                                                    const updatedFeatures = [...form.features, form.description.trim()]
                                                    setForm({ ...form, features: updatedFeatures, description: "" })
                                                }
                                            }}
                                        >
                                            Add Point
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            id="description"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Enter a feature or description point"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && form.description.trim()) {
                                                    e.preventDefault()
                                                    const updatedFeatures = [...form.features, form.description.trim()]
                                                    setForm({ ...form, features: updatedFeatures, description: "" })
                                                }
                                            }}
                                        />
                                    </div>

                                    {form.features.length > 0 && (
                                        <div className="mt-4 border rounded-md p-3">
                                            <p className="font-medium mb-2">Feature Points:</p>
                                            <ul className="space-y-1 list-disc pl-5">
                                                {form.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center justify-between">
                                                        <span>{feature}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updatedFeatures = [...form.features]
                                                                updatedFeatures.splice(index, 1)
                                                                setForm({ ...form, features: updatedFeatures })
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/vehicles">Cancel</Link>
                                </Button>
                                <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Vehicle...
                                        </>
                                    ) : (
                                        "Add Vehicle"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </main>
        </div>
    )
}
