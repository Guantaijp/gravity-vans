"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { ChevronLeft, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import DriverService from "../../services/driver-service.ts" // Assuming this is where DriverService is located

export default function NewDriverPage() {
    const navigate = useNavigate()

    const [driverData, setDriverData] = useState({
        name: "",
        phoneNumber: "",
        idNumber: "",
        licenseNumber: "",
        psvNumber: "",
        photoId: "",
        status: "active" as "active" | "inactive" | "on-leave" | "suspended",
        hireDate: "",
        // notes: "",
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setDriverData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSelectChange = (field: string, value: string) => {
        setDriverData((prev) => ({ ...prev, [field]: value }))
    }

    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!driverData.name || !driverData.phoneNumber || !driverData.licenseNumber || !driverData.psvNumber || !photoFile) {
            toast.error("Please fill in all required fields and upload a photo.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();

        Object.entries(driverData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        formData.append("photoId", photoFile);

        try {
            const response = await DriverService.create(formData);

            const newDriver = response;
            console.log(newDriver);

            toast.success("Driver added successfully", {
                description: `Driver has been added to the system.`,
            });

            navigate("/drivers");
        } catch (err: any) {
            console.error("Failed to add driver:", err);
            toast.error("Failed to add driver", {
                description: err.message || "There was a problem adding the driver. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/drivers" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Driver</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Information</CardTitle>
                                <CardDescription>Enter the details for the new driver</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. John Doe"
                                            value={driverData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            placeholder="e.g. +254 712 345 678"
                                            value={driverData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="idNumber">ID Number</Label>
                                        <Input
                                            id="idNumber"
                                            placeholder="e.g. 123456789"
                                            value={driverData.idNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="licenseNumber">License Number</Label>
                                        <Input
                                            id="licenseNumber"
                                            placeholder="e.g. DL12345678"
                                            value={driverData.licenseNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="psvNumber">PSV Number</Label>
                                        <Input
                                            id="psvNumber"
                                            placeholder="e.g. PSV123456"
                                            value={driverData.psvNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hireDate">Hire Date</Label>
                                        <Input
                                            id="hireDate"
                                            type="date"
                                            value={driverData.hireDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={driverData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="on-leave">On Leave</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photoId">Driver Photo</Label>
                                    <div className="border border-dashed rounded-md p-8 text-center">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mb-2">Upload a photo of the driver</p>
                                        <Input type="file" id="photoId" accept="image/*" onChange={handlePhotoChange} required />
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/drivers">Cancel</Link>
                                </Button>
                                <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Driver...
                                        </>
                                    ) : (
                                        "Add Driver"
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
