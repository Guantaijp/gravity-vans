"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { ChevronLeft, Save, Trash2, Calendar, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Calendar as CalendarComponent } from "../../components/ui/calendar"
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import { useApi } from "../../hooks/use-api"

export default function VehicleEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isEditing = !!id
    const [isLoading, setIsLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [vehicle, setVehicle] = useState<Vehicle>({
        _id: "",
        createdAt: "",
        updatedAt: "",
        name: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        type: "",
        capacity: 0,
        seatSize: "",
        fuel: "Petrol",
        transmission: "Automatic",
        licensePlate: "",
        description: "",
        features: [] as string[],
        insurance: "",
        insuranceExpiry: new Date().toISOString(),
        status: "available",
        speedGovernor: "",
        speedGovernorExpiry: "",
        roadServiceLicense: "",
        imageUrl: "",
        ownershipType: "owned",
        ownerName: "",
        ownerContact: "",
    })

    const [featureInput, setFeatureInput] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formSubmitted, setFormSubmitted] = useState(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    // Fetch vehicle data using the service
    const { execute: fetchVehicle} = useApi((id) => {
        if (!id) return Promise.reject(new Error("ID is required"))
        return VehicleService.getById(id)
    })

    useEffect(() => {
        if (isEditing && id) {
            loadVehicle()
        }
    }, [id])

    useEffect(() => {
        // Update image preview when imageUrl changes
        if (vehicle.imageUrl) {
            setImagePreviewUrl(vehicle.imageUrl)
        } else {
            setImagePreviewUrl("")
        }
    }, [vehicle.imageUrl])

    const loadVehicle = async () => {
        try {
            const data = await fetchVehicle(id)
            setVehicle(data)
        } catch (err) {
            console.error("Error loading vehicle details:", err)
            toast.error("Failed to load vehicle details")
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

    const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) {
            setVehicle({ ...vehicle, [name]: date.toISOString() })

            // Clear error for this field if it exists
            if (errors[name]) {
                setErrors({ ...errors, [name]: "" })
            }
        }
    }

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setVehicle({
                ...vehicle,
                features: [...(vehicle.features || []), featureInput.trim()],
            })
            setFeatureInput("")
        }
    }

    const handleRemoveFeature = (index: number) => {
        const updatedFeatures = [...(vehicle.features || [])]
        updatedFeatures.splice(index, 1)
        setVehicle({ ...vehicle, features: updatedFeatures })
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB")
            return
        }

        setImageFile(file)
        setIsUploading(true)

        // Create a preview URL
        const reader = new FileReader()
        reader.onloadend = () => {
            const imageUrl = reader.result as string
            setImagePreviewUrl(imageUrl)
            setIsUploading(false)
            toast.success("Image uploaded successfully")
        }
        reader.readAsDataURL(file)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const removeImage = () => {
        setImageFile(null)
        setVehicle({ ...vehicle, imageUrl: "" })
        setImagePreviewUrl("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        toast.success("Image removed successfully")
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!vehicle.make) newErrors.make = "Make is required"
        if (!vehicle.model) newErrors.model = "Model is required"
        if (!vehicle.year) newErrors.year = "Year is required"
        if (!vehicle.licensePlate) newErrors.licensePlate = "License plate is required"

        // Additional validation for outsourced vehicles
        if (vehicle.ownershipType === "outsourced") {
            if (!vehicle.ownerName) newErrors.ownerName = "Owner name is required"
            if (!vehicle.ownerContact) newErrors.ownerContact = "Owner contact is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormSubmitted(true)

        if (!validateForm()) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsLoading(true)

        try {
            // Generate a name if not provided
            const name = vehicle.name || `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`

            // Create a FormData object
            const formData = new FormData()

            // Add all the vehicle data fields
            const vehicleData = {
                name,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                type: vehicle.type || "",
                licensePlate: vehicle.licensePlate,
                capacity: vehicle.capacity || 0,
                seatSize: vehicle.seatSize || "",
                status: vehicle.status || "available",
                fuel: vehicle.fuel || "petrol",
                transmission: vehicle.transmission || "automatic",
                insurance: vehicle.insurance || "",
                insuranceExpiry: vehicle.insuranceExpiry || "",
                roadServiceLicense: vehicle.roadServiceLicense || "",
                speedGovernor: vehicle.speedGovernor || "",
                speedGovernorExpiry: vehicle.speedGovernorExpiry || "",
                description: vehicle.description || "",
                features: vehicle.features || [],
            }

            // If it's outsourced, add owner details to the description
            if (vehicle.ownershipType === "outsourced" && vehicle.ownerName && vehicle.ownerContact) {
                vehicleData.description = `Owner: ${vehicle.ownerName}, Contact: ${vehicle.ownerContact}\n${vehicleData.description}`
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

            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${typeof pair[1] === "object" ? "File object" : pair[1]}`)
            }

            // Make the API request with the correct endpoint
            const token = localStorage.getItem("gravity_vans_token")
            const url = `https://gravity-backend-beige.vercel.app/api/vehicles/${id}`

            const response = await fetch(url, {
                method: "PUT",
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {},
                body: formData, // Don't set Content-Type when using FormData
            })

            // Check if the response is ok before trying to parse JSON
            if (!response.ok) {
                const errorText = await response.text()
                console.error("Error response:", errorText)

                let errorMessage = "Failed to update vehicle"
                try {
                    // Try to parse the error as JSON if possible
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.message || errorMessage
                } catch (e:any) {
                    // If parsing fails, use the raw text
                    errorMessage = errorText || errorMessage
                }

                throw new Error(errorMessage)
            }

            const data = await response.json()
            const updatedVehicle = data.vehicle

            console.log("Vehicle updated successfully:", updatedVehicle)

            toast.success(`${updatedVehicle.make} ${updatedVehicle.model} has been updated.`)

            navigate("/vehicles")
        } catch (err: any) {
            console.error("Failed to update vehicle:", err)
            toast.error(err.message || "There was a problem updating the vehicle. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
            setIsLoading(true)
            try {
                const token = localStorage.getItem("gravity_vans_token")
                const response = await fetch(`https://gravity-backend-beige.vercel.app/api/vehicles/${id}`, {
                    method: "DELETE",
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                })

                if (!response.ok) {
                    throw new Error("Failed to delete vehicle")
                }

                toast.success("The vehicle has been removed from the system.")

                navigate("/vehicles")
            } catch (err: any) {
                console.error("Error deleting vehicle:", err)
                toast.error(err.message || "Failed to delete vehicle. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }
    }

    if (isLoading && !vehicle._id) {
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
                                    {/* Image Upload Section */}
                                    <div className="mb-6">
                                        <Label>Vehicle Image</Label>
                                        <div className="mt-2">
                                            {imagePreviewUrl ? (
                                                <div className="relative border rounded-md overflow-hidden">
                                                    <img
                                                        src={imagePreviewUrl || "/placeholder.svg"}
                                                        alt={`${vehicle.make} ${vehicle.model}`}
                                                        className="w-full h-auto max-h-[300px] object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = "/placeholder.svg?height=300&width=600"
                                                            target.alt = "Image failed to load"
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2 flex space-x-2">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-8 w-8 rounded-full"
                                                            onClick={removeImage}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8 rounded-full"
                                                            onClick={triggerFileInput}
                                                            disabled={isUploading}
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="border border-dashed rounded-md p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                                    onClick={triggerFileInput}
                                                >
                                                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground mb-1">Click to upload an image</p>
                                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            {isUploading && (
                                                <div className="mt-2 flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                                                    <span className="text-sm">Uploading image...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Vehicle Name <span className="text-xs text-muted-foreground">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={vehicle.name}
                                                onChange={handleInputChange}
                                                placeholder={`${vehicle.make || "Make"} ${vehicle.model || "Model"} - ${vehicle.licensePlate || "License"}`}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="licensePlate"
                                                className={errors.licensePlate && formSubmitted ? "text-red-500" : ""}
                                            >
                                                License Plate*
                                            </Label>
                                            <Input
                                                id="licensePlate"
                                                name="licensePlate"
                                                value={vehicle.licensePlate}
                                                onChange={handleInputChange}
                                                className={errors.licensePlate && formSubmitted ? "border-red-500" : ""}
                                            />
                                            {errors.licensePlate && formSubmitted && (
                                                <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>
                                            )}
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
                                            <Label htmlFor="type">Vehicle Type</Label>
                                            <Select
                                                value={vehicle.type}
                                                onValueChange={(value) => handleSelectChange("type", value)}
                                                defaultValue={vehicle.type}
                                            >
                                                <SelectTrigger>
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
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Seating Capacity</Label>
                                            <Input
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                value={vehicle.capacity}
                                                onChange={handleInputChange}
                                                min={1}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={vehicle.status}
                                                onValueChange={(value) => handleSelectChange("status", value)}
                                                defaultValue={vehicle.status}
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel">Fuel Type</Label>
                                            <Select
                                                value={vehicle.fuel}
                                                onValueChange={(value) => handleSelectChange("fuel", value)}
                                                defaultValue={vehicle.fuel}
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
                                            <Label htmlFor="transmission">Transmission</Label>
                                            <Select
                                                value={vehicle.transmission}
                                                onValueChange={(value) => handleSelectChange("transmission", value)}
                                                defaultValue={vehicle.transmission}
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
                                        <Label htmlFor="ownershipType">Ownership Type</Label>
                                        <Select
                                            value={vehicle.ownershipType}
                                            onValueChange={(value) => handleSelectChange("ownershipType", value)}
                                            defaultValue={vehicle.ownershipType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ownership type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owned">Owned</SelectItem>
                                                <SelectItem value="outsourced">Outsourced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {vehicle.ownershipType === "outsourced" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="ownerName" className={errors.ownerName && formSubmitted ? "text-red-500" : ""}>
                                                    Owner Name*
                                                </Label>
                                                <Input
                                                    id="ownerName"
                                                    name="ownerName"
                                                    value={vehicle.ownerName}
                                                    onChange={handleInputChange}
                                                    className={errors.ownerName && formSubmitted ? "border-red-500" : ""}
                                                />
                                                {errors.ownerName && formSubmitted && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="ownerContact"
                                                    className={errors.ownerContact && formSubmitted ? "text-red-500" : ""}
                                                >
                                                    Owner Contact*
                                                </Label>
                                                <Input
                                                    id="ownerContact"
                                                    name="ownerContact"
                                                    value={vehicle.ownerContact}
                                                    onChange={handleInputChange}
                                                    className={errors.ownerContact && formSubmitted ? "border-red-500" : ""}
                                                />
                                                {errors.ownerContact && formSubmitted && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.ownerContact}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                                    {/*    <div className="space-y-2">*/}
                                    {/*        <Label htmlFor="description">Description</Label>*/}
                                    {/*        <Textarea*/}
                                    {/*            id="description"*/}
                                    {/*            name="description"*/}
                                    {/*            value={vehicle.description}*/}
                                    {/*            onChange={handleInputChange}*/}
                                    {/*            rows={4}*/}
                                    {/*        />*/}
                                    {/*    </div>*/}

                                    {/*</div>*/}
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
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    handleAddFeature()
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={handleAddFeature} variant="outline">
                                            Add
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {vehicle.features && vehicle.features.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {vehicle.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
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
                                        <Label htmlFor="insurance">Insurance Number</Label>
                                        <Input id="insurance" name="insurance" value={vehicle.insurance} onChange={handleInputChange} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {vehicle.insuranceExpiry ? (
                                                        format(new Date(vehicle.insuranceExpiry), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : undefined}
                                                    onSelect={(date) => handleDateChange("insuranceExpiry", date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="speedGovernor">Speed Governor Number</Label>
                                        <Input
                                            id="speedGovernor"
                                            name="speedGovernor"
                                            value={vehicle.speedGovernor}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="speedGovernorExpiry">Speed Governor Expiry Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {vehicle.speedGovernorExpiry ? (
                                                        format(new Date(vehicle.speedGovernorExpiry), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={vehicle.speedGovernorExpiry ? new Date(vehicle.speedGovernorExpiry) : undefined}
                                                    onSelect={(date) => handleDateChange("speedGovernorExpiry", date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="roadServiceLicense">Road Service License</Label>
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
                                <Button type="submit" className="bg-[#e31c39] hover:bg-[#e31c39]/90" disabled={isLoading}>
                                    {isLoading ? (
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
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
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
