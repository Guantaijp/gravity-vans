// DriverEditPage.tsx

import { useState, useEffect, useRef } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import { ChevronLeft, Save,  X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import DriverService, { Driver } from "../../services/driver-service"
import { useApi } from "../../hooks/use-api"

export default function DriverEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<Partial<Driver>>({
        name: "",
        idNumber: "",
        licenseNumber: "",
        psvNumber: "",
        phoneNumber: "",
        address: "",
        hireDate: "",
        status: "active",
        notes: "",
        photoId: ""
    })

    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [isUploading] = useState(false)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoChanged, setPhotoChanged] = useState(false)

    const { execute: fetchDriver, isLoading, error } = useApi<Driver>(() =>
        DriverService.getById(id as string)
    )

    const { execute: updateDriver, isLoading: isUpdating } = useApi<Driver>(async (driverData: FormData) => {
        const response = await DriverService.update(id as string, driverData)
        return response.driver
    })

    useEffect(() => {
        if (id) loadDriverData()
    }, [id])

    const loadDriverData = async () => {
        try {
            const driverData = await fetchDriver()
            const formattedHireDate = driverData.hireDate ? new Date(driverData.hireDate).toISOString().split('T')[0] : ""
            setFormData({ ...driverData, hireDate: formattedHireDate })

            if (driverData.photoId) {
                setPhotoPreview(driverData.photoId)
            }
        } catch (err) {
            console.error("Error loading driver:", err)
            toast.error("Error loading driver details")
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleStatusChange = (value: "active" | "inactive" | "on-leave" | "suspended") => {
        setFormData(prev => ({ ...prev, status: value }))
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG)')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        const localPreview = URL.createObjectURL(file)
        setPhotoPreview(localPreview)
        setPhotoFile(file)
        setPhotoChanged(true)
    }

    const handleRemovePhoto = () => {
        setPhotoPreview(null)
        setFormData(prev => ({ ...prev, photoId: "" }))
        setPhotoFile(null)
        setPhotoChanged(true)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const formDataToSend = new FormData()

            // Add all form fields except photoId to FormData
            for (const key in formData) {
                if (
                    key !== "photoId" &&
                    Object.prototype.hasOwnProperty.call(formData, key)
                ) {
                    const value = formData[key as keyof Driver]
                    if (value !== undefined) {
                        formDataToSend.append(key, String(value))
                    }
                }
            }

            // Handle photo upload based on changes
            if (photoChanged) {
                if (photoFile) {
                    // New photo uploaded - use "photoId" as field name to match backend configuration
                    formDataToSend.append("photoId", photoFile)
                    console.log("Uploading new photo with field name 'photoId':", photoFile.name)
                } else {
                    // Photo was removed - we can't send an empty file to multer
                    // Instead we'll add a flag that the backend can check
                    formDataToSend.append("removePhoto", "true")
                    console.log("Removing photo")
                }
            } else if (formData.photoId) {
                // No change to photo, but we don't need to send anything
                // The backend will keep the existing photoId if no new file is uploaded
                console.log("No photo change, keeping existing photoId")
            }

            // Log the FormData contents for debugging
            for (const pair of formDataToSend.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            await updateDriver(formDataToSend)
            toast.success("Driver updated successfully")
            navigate(`/drivers/${id}`)
        } catch (err) {
            console.error("Error updating driver:", err)
            toast.error("Failed to update driver")
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Failed to load driver details.</div>
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to={`/drivers/${id}`} className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Driver</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Driver Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Name, ID, Phone, Photo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="idNumber">ID Number</Label>
                                        <Input id="idNumber" name="idNumber" value={formData.idNumber || ""} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} required />
                                    </div>

                                    {/* Photo upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="photoID">Photo ID</Label>
                                        {photoPreview ? (
                                            <div className="relative mb-2">
                                                <img src={photoPreview} alt="Preview" className="w-full h-auto max-h-48 object-cover rounded border" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={handleRemovePhoto}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md mb-2">
                                                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">No Photo ID uploaded</p>
                                            </div>
                                        )}
                                        <div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
                                            <Button type="button" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isUploading}>
                                                {isUploading ? "Uploading..." : photoPreview ? "Change Photo" : "Upload Photo"}
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-1">JPG, JPEG or PNG, max 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* License, PSV, HireDate, Status */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="licenseNumber">License Number</Label>
                                        <Input id="licenseNumber" name="licenseNumber" value={formData.licenseNumber || ""} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="psvNumber">PSV Number</Label>
                                        <Input id="psvNumber" name="psvNumber" value={formData.psvNumber || ""} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hireDate">Hire Date</Label>
                                        <Input type="date" id="hireDate" name="hireDate" value={formData.hireDate || ""} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status || "active"} onValueChange={handleStatusChange}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Available</SelectItem>
                                                <SelectItem value="on-leave">On Leave</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 space-x-4">
                                <Button variant="outline" onClick={() => navigate(`/drivers/${id}`)}>Cancel</Button>
                                <Button type="submit" disabled={isUpdating || isUploading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    )
}