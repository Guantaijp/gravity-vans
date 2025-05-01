"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
    ChevronLeft,
    Phone,
    MapPin,
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import DriverService, { Driver } from "../../services/driver-service"
import  { Booking } from "../../services/booking-service"
import  { Vehicle } from "../../services/vehicle-service.ts"
import  {Customer } from "../../services/customer-service.ts"

import { useApi } from "../../hooks/use-api"


// Update BookingType to properly type customer and vehicle
type BookingType = Booking & {
    customer: Customer | string;
    vehicle: Vehicle | string;
}

export default function DriverDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [driver, setDriver] = useState<Driver | null>(null)
    const [driverBookings, setDriverBookings] = useState<BookingType[]>([])
    const [photoModalOpen, setPhotoModalOpen] = useState(false)

    // Using the useApi hook for API operations
    const { execute: fetchDriver, isLoading, error } = useApi<Driver>(() =>
        DriverService.getById(id as string)
    )
    const { execute: fetchDriverBookings, isLoading: isLoadingBookings } = useApi<BookingType[]>(() =>
        DriverService.getBookings(id as string)
    )
    const { execute: updateDriverStatus, isLoading: isUpdatingStatus } = useApi<{ driver: Driver }>((status: Driver["status"]) =>
        DriverService.updateStatus(id as string, status)
    );
    const { execute: deleteDriver, isLoading: isDeleting } = useApi(() =>
        DriverService.delete(id as string)
    )

    useEffect(() => {
        if (id) {
            loadDriverData()
        }
    }, [id])

    const loadDriverData = async () => {
        try {
            // Fetch driver details
            const driverResponse = await fetchDriver()
            setDriver(driverResponse)

            // Fetch driver's bookings
            try {
                const bookingsData = await fetchDriverBookings()
                setDriverBookings(bookingsData || [])
            } catch (err) {
                console.error("Error loading driver bookings:", err)
                toast.error("Could not load booking history")
            }
        } catch (err) {
            console.error("Error loading driver:", err)
            toast.error("Error loading driver details")
        }
    }

    const handleUpdateStatus = async (status: string) => {
        try {
            const updatedDriver = await updateDriverStatus(status)
            setDriver(updatedDriver.driver)
            toast.success(`Driver status updated to ${status}`)
        } catch (err) {
            console.error("Error updating driver status:", err)
            toast.error("Failed to update driver status")
        }
    }

    const handleDeleteDriver = async () => {
        try {
            await deleteDriver()
            toast.success("Driver deleted successfully")
            navigate("/drivers")
        } catch (err) {
            console.error("Error deleting driver:", err)
            toast.error("Failed to delete driver")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Available
                    </Badge>
                )
            case "on-leave":
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="mr-1 h-3 w-3" /> On Leave
                    </Badge>
                )
            case "suspended":
                return (
                    <Badge className="bg-[#0a192f]">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Suspended
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge className="bg-[#e31c39]">
                        <XCircle className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <header className="border-b">
                    <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                        <Link to="/drivers" className="mr-4">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Driver Details</h1>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e31c39]"></div>
                            <p className="mt-4 text-muted-foreground">Loading driver details...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !driver) {
        // Check if the error response contains the "No bookings found" message
        const isNoBookingsFound = error && error.message === "No bookings found";
        return (
            <div className="flex flex-col">
                <header className="border-b">
                    <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                        <Link to="/drivers" className="mr-4">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Driver Details</h1>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="text-center p-8">
                        {/* Display a specific message if no bookings are found */}
                        {isNoBookingsFound ? (
                            <p className="text-[#e31c39] mb-4">No bookings found for this driver.</p>
                        ) : (
                            <p className="text-[#e31c39] mb-4">Failed to load driver details.</p>
                        )}
                        <Button asChild>
                            <Link to="/drivers">Back to Drivers</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/drivers" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Driver Details</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            {driver.photoId ? (
                                                <AvatarImage src={driver.photoId} alt={driver.name} />
                                            ) : null}
                                            <AvatarFallback className="bg-[#0a192f] text-white text-xl">
                                                {driver.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-2xl">{driver.name}</CardTitle>
                                            <CardDescription>
                                                ID: {driver.idNumber} • PSV: {driver.psvNumber}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(driver.status)}</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="details">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                                        <TabsTrigger value="documents">Documents</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="details" className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>{driver.phoneNumber}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                                                            <span>{driver.address || "No address provided"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Employment Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>Hire Date: {new Date(driver.hireDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {driver.photoId && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Photo ID</h3>
                                                        <div
                                                            className="cursor-pointer rounded-md overflow-hidden border border-gray-200 hover:border-gray-300"
                                                            onClick={() => setPhotoModalOpen(true)}
                                                        >
                                                            <img
                                                                src={driver.photoId}
                                                                alt="Driver's Photo ID"
                                                                className="w-full h-auto max-h-48 object-cover"
                                                            />
                                                            <div className="bg-gray-50 p-2 text-sm text-center">
                                                                <span className="flex items-center justify-center">
                                                                    <ImageIcon className="h-4 w-4 mr-1" />
                                                                    Click to enlarge
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">License Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>License Number: {driver.licenseNumber}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>PSV Number: {driver.psvNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Status Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>Status: {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>Member Since: {new Date(driver.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {driver.notes && (
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                                                <p className="text-sm">{driver.notes}</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="bookings">
                                        {isLoadingBookings ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e31c39]"></div>
                                            </div>
                                        ) : driverBookings.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No bookings found for this driver.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {driverBookings.map((booking) => (
                                                    <Card key={booking._id}>
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-medium">Booking ID: {booking._id}</h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                                                                        {new Date(booking.endDate).toLocaleDateString()}
                                                                    </p>
                                                                    <p className="text-sm mt-1">
                                                                        {typeof booking.customer === 'object' ? booking.customer.name : 'Customer'} •
                                                                        {typeof booking.vehicle === 'object' ? ` ${booking.vehicle.name}` : ' Vehicle'}
                                                                    </p>
                                                                </div>
                                                                <Badge
                                                                    className={
                                                                        booking.status === "Active"
                                                                            ? "bg-green-500"
                                                                            : booking.status === "Pending"
                                                                                ? "bg-yellow-500"
                                                                                : booking.status === "Completed"
                                                                                    ? "bg-[#0a192f]"
                                                                                    : "bg-[#e31c39]"
                                                                    }
                                                                >
                                                                    {booking.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link to={`/bookings/${booking._id}`}>View Booking</Link>
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="documents">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium">Driver's Photo ID</h3>
                                                {driver.photoId ? (
                                                    <div className="mt-2">
                                                        <div
                                                            className="cursor-pointer rounded-md overflow-hidden border border-gray-200 hover:border-gray-300"
                                                            onClick={() => setPhotoModalOpen(true)}
                                                        >
                                                            <img
                                                                src={driver.photoId}
                                                                alt="Driver's Photo ID"
                                                                className="w-full h-auto max-h-64 object-cover"
                                                            />
                                                            <div className="bg-gray-50 p-2 text-sm text-center">
                                                                <span className="flex items-center justify-center">
                                                                    <ImageIcon className="h-4 w-4 mr-1" />
                                                                    Click to view full image
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-md mt-2">
                                                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500">No Photo ID uploaded</p>
                                                        <Button variant="outline" size="sm" className="mt-4">
                                                            Upload Photo ID
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center py-4 text-muted-foreground">
                                                <p>No additional documents uploaded for this driver.</p>
                                                <Button variant="outline" className="mt-4">
                                                    Upload Documents
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full bg-[#0a192f] hover:bg-[#0a192f]/90" asChild>
                                    <Link to={`/drivers/${id}/edit`}>Edit Driver</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleUpdateStatus("active")}
                                    disabled={isUpdatingStatus || driver.status === "active"}
                                >
                                    Set as Available
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleUpdateStatus("on-leave")}
                                    disabled={isUpdatingStatus || driver.status === "on-leave"}
                                >
                                    Set as On Leave
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleUpdateStatus("suspended")}
                                    disabled={isUpdatingStatus || driver.status === "suspended"}
                                >
                                    Set as Suspended
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleUpdateStatus("inactive")}
                                    disabled={isUpdatingStatus || driver.status === "inactive"}
                                >
                                    Set as Inactive
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" disabled={isDeleting}>
                                            {isDeleting ? "Deleting..." : "Delete Driver"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete {driver.name}? This action cannot be undone.
                                                Any bookings assigned to this driver will need to be reassigned.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteDriver}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Driver"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Photo ID Modal */}
            {photoModalOpen && driver.photoId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-medium">Driver's Photo ID</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPhotoModalOpen(false)}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                            <img
                                src={driver.photoId}
                                alt="Driver's Photo ID"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setPhotoModalOpen(false)}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}