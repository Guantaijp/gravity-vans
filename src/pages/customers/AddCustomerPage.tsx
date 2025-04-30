"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, FileText, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import CustomerService, { type CustomerInput } from "../../services/customer-service"
import { useApi } from "../../hooks/use-api"

export default function AddCustomerPage() {
    const navigate = useNavigate()
    // Using Sonner toast directly

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        idNumber: "",
        notes: ""
    })

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        idNumber: ""
    })

    const { execute: createCustomer, isLoading } = useApi(
        (data: CustomerInput | undefined) => {
            if (data) {
                return CustomerService.create(data)
            } else {
                // Handle case where data is undefined (maybe throw an error or return a default)
                throw new Error("Customer data is required")
            }
        }
    )

    const validateForm = () => {
        const newErrors = {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            idNumber: ""
        }

        let isValid = true

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Customer name is required"
            isValid = false
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
            isValid = false
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required"
            isValid = false
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required"
            isValid = false
        }

        if (!formData.idNumber.trim()) {
            newErrors.idNumber = "ID Number is required"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleInputChange = (e:any) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        // Clear error when user starts typing
        if (name in errors) {
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    }

    const handleSubmit = async (e:any) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            const newCustomer = await createCustomer(formData)
            toast.success("Customer added", {
                description: `${newCustomer.fullName} has been successfully added.`,
            })
            navigate("/customers")
        } catch (err:any) {
            console.error("Customer creation failed", err)

            const message = err?.response?.data?.message || "There was a problem adding the customer."

            toast.error("Failed to add customer", {
                description: message,
            })

        }
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/customers">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Add New Customer</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>
                            Enter customer details to add them to your database.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Enter customer's full name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={errors.fullName ? "border-red-500" : ""}
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="customer@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="+254 XXX XXX XXX"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={errors.phone ? "border-red-500" : ""}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Location <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="City, Country"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={errors.location ? "border-red-500" : ""}
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.location}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="idNumber" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        ID Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="idNumber"
                                        name="idNumber"
                                        placeholder="National ID or Passport Number"
                                        value={formData.idNumber}
                                        onChange={handleInputChange}
                                        className={errors.idNumber ? "border-red-500" : ""}
                                    />
                                    {errors.idNumber && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.idNumber}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/customers")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#e31c39] hover:bg-[#e31c39]/90"
                                disabled={isLoading}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? "Saving..." : "Save Customer"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    )
}