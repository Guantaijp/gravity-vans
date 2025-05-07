"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Edit, Calendar, Users, Car, Fuel, User, Phone } from 'lucide-react'
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import { useApi } from "../../hooks/use-api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const [vehicle, setVehicle] = useState<Vehicle>()
    const [bookingHistory, setBookingHistory] = useState<any[]>([])
    const [loadingBookings, setLoadingBookings] = useState(false)
    const [bookingError, setBookingError] = useState<Error | null>(null)
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
    const [maintenanceDate, setMaintenanceDate] = useState<string>("")
    const [maintenanceType, setMaintenanceType] = useState<string>("")
    const [maintenanceNotes, setMaintenanceNotes] = useState<string>("")
    const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false)

    // Fetch vehicle data using the service
    const {
        execute: fetchVehicle,
        isLoading,
        error,
    } = useApi((id) => {
        if (!id) return Promise.reject(new Error("ID is required"))
        return VehicleService.getById(id)
    })

    // Mock data for maintenance history (would normally come from API)
    const maintenanceHistory = [
        { date: "2023-03-15", type: "Oil Change", cost: "KES 5,000", notes: "Regular maintenance" },
        { date: "2023-01-20", type: "Tire Replacement", cost: "KES 32,000", notes: "Replaced all four tires" },
        { date: "2022-11-05", type: "Brake Service", cost: "KES 12,000", notes: "Replaced brake pads" },
    ]

    useEffect(() => {
        if (id) {
            loadVehicle()
            loadBookingHistory()
        }
    }, [id])

    const loadVehicle = async () => {
        try {
            const data = await fetchVehicle(id)
            setVehicle(data)
        } catch (err) {
            console.error("Error loading vehicle details:", err)
        }
    }

    const loadBookingHistory = async () => {
        if (!id) return

        setLoadingBookings(true)
        setBookingError(null)

        try {
            const bookings = await VehicleService.getBookingHistory(id)
            setBookingHistory(bookings)
        } catch (err) {
            console.error("Error loading booking history:", err)
            setBookingError(err instanceof Error ? err : new Error("Failed to load booking history"))
        } finally {
            setLoadingBookings(false)
        }
    }

    // Create a skeleton loading component for the vehicle details
    const VehicleDetailsSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-t-lg w-full"></div>
            <div className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        </div>
    )

    if (isLoading) {
        return <VehicleDetailsSkeleton />
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">Failed to load vehicle details. Please try again.</p>
                <Button onClick={loadVehicle} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    if (!vehicle) {
        return null
    }

    // Helper function to get the badge color based on status
    const getStatusBadgeColor = (status?: string) => {
        if (!status) return "bg-gray-500"

        switch (status.toLowerCase()) {
            case "available":
                return "bg-green-500"
            case "booked":
                return "bg-[#0a192f]"
            case "maintenance":
            case "out-of-service":
                return "bg-[#e31c39]"
            default:
                return "bg-gray-500"
        }
    }

    // Helper function to format ownership type for display
    const formatOwnershipType = (ownership?: string) => {
        if (!ownership) return "Not specified"
        return ownership.charAt(0).toUpperCase() + ownership.slice(1)
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
                    <h1 className="text-2xl font-bold">Vehicle Details</h1>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/vehicles/${id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Vehicle
                            </Link>
                        </Button>
                        <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                            <Link to={`/bookings/new?vehicleId=${id}`}>Create Booking</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <div className="relative">
                                <img
                                    src={vehicle.imageUrl || "/placeholder.svg?height=300&width=500"}
                                    alt={vehicle.name}
                                    className="w-full h-64 object-cover rounded-t-lg"
                                />
                                <Badge className={`absolute top-4 right-4 ${getStatusBadgeColor(vehicle.status)}`}>
                                    {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : "Unknown"}
                                </Badge>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{vehicle.name}</CardTitle>
                                        <CardDescription>
                                            {vehicle.type} • {vehicle.capacity} Seater
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                                        <Car className="h-5 w-5 mb-1 text-[#e31c39]" />
                                        <span className="text-xs text-muted-foreground">Make</span>
                                        <span className="text-sm font-medium">{vehicle.make}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                                        <Calendar className="h-5 w-5 mb-1 text-[#e31c39]" />
                                        <span className="text-xs text-muted-foreground">Year</span>
                                        <span className="text-sm font-medium">{vehicle.year}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                                        <Users className="h-5 w-5 mb-1 text-[#e31c39]" />
                                        <span className="text-xs text-muted-foreground">Capacity</span>
                                        <span className="text-sm font-medium">{vehicle.capacity} Seater</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                                        <Fuel className="h-5 w-5 mb-1 text-[#e31c39]" />
                                        <span className="text-xs text-muted-foreground">Fuel</span>
                                        <span className="text-sm font-medium">{vehicle.fuel}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                                </div>

                                {vehicle.features && vehicle.features.length > 0 && (
                                    <div>
                                        <h3 className="font-medium mb-2">Features</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {vehicle.features.map((feature, index) => (
                                                <div key={index} className="flex items-center text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#e31c39] mr-2"></div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="bookings">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                                {/*<TabsTrigger value="maintenance">Maintenance History</TabsTrigger>*/}
                            </TabsList>
                            <TabsContent value="bookings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booking History</CardTitle>
                                        <CardDescription>Past and upcoming bookings for this vehicle</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {loadingBookings ? (
                                            <div className="flex justify-center items-center h-24">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
                                            </div>
                                        ) : bookingError ? (
                                            <div className="text-center py-4">
                                                <p className="text-red-500 mb-2">Failed to load booking history</p>
                                                <Button size="sm" onClick={loadBookingHistory}>
                                                    Try Again
                                                </Button>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Booking ID</TableHead>
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead>Start Date</TableHead>
                                                        <TableHead>End Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bookingHistory && bookingHistory.length > 0 ? (
                                                        bookingHistory.map((booking) => (
                                                            <TableRow key={booking._id || booking.id}>
                                                                <TableCell className="font-medium">{booking.bookingId || booking.bookingId}</TableCell>
                                                                <TableCell>{booking.customer?.fullName || booking.customerName || "N/A"}</TableCell>
                                                                <TableCell>{new Date(booking.startDate).toLocaleDateString()}</TableCell>
                                                                <TableCell>{new Date(booking.endDate).toLocaleDateString()}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                                                                        {booking.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button variant="ghost" size="sm" asChild>
                                                                        <Link to={`/bookings/${booking._id || booking.id}`}>View</Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-4 text-sm text-muted-foreground">
                                                                No booking history available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="maintenance">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Maintenance History</CardTitle>
                                        <CardDescription>Service and repair records for this vehicle</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Service Type</TableHead>
                                                    <TableHead>Cost</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {maintenanceHistory.length > 0 ? (
                                                    maintenanceHistory.map((record, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{record.date}</TableCell>
                                                            <TableCell>{record.type}</TableCell>
                                                            <TableCell>{record.cost}</TableCell>
                                                            <TableCell>{record.notes}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                                                            No maintenance history available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">License Plate:</div>
                                    <div className="font-medium">{vehicle.licensePlate}</div>

                                    <div className="text-muted-foreground">Make:</div>
                                    <div className="font-medium">{vehicle.make}</div>

                                    <div className="text-muted-foreground">Model:</div>
                                    <div className="font-medium">{vehicle.model}</div>

                                    <div className="text-muted-foreground">Year:</div>
                                    <div className="font-medium">{vehicle.year}</div>

                                    <div className="text-muted-foreground">Type:</div>
                                    <div className="font-medium">{vehicle.type}</div>

                                    <div className="text-muted-foreground">Capacity:</div>
                                    <div className="font-medium">{vehicle.capacity} Seater</div>

                                    <div className="text-muted-foreground">Fuel Type:</div>
                                    <div className="font-medium">{vehicle.fuel}</div>

                                    <div className="text-muted-foreground">Transmission:</div>
                                    <div className="font-medium">{vehicle.transmission}</div>

                                    <div className="text-muted-foreground">Insurance No:</div>
                                    <div className="font-medium">{vehicle.insurance}</div>

                                    <div className="text-muted-foreground">Insurance Expiry:</div>
                                    <div className="font-medium"> {new Date(vehicle.insuranceExpiry).toLocaleDateString()}</div>

                                    {vehicle.speedGovernor && (
                                        <>
                                            <div className="text-muted-foreground">Speed Governor:</div>
                                            <div className="font-medium">{vehicle.speedGovernor}</div>
                                        </>
                                    )}

                                    {vehicle.speedGovernorExpiry && (
                                        <>
                                            <div className="text-muted-foreground">Speed Gov. Expiry:</div>
                                            <div className="font-medium">{new Date(vehicle.speedGovernorExpiry).toLocaleDateString()}</div>
                                        </>
                                    )}

                                    {vehicle.roadServiceLicense && (
                                        <>
                                            <div className="text-muted-foreground">Road Service License:</div>
                                            <div className="font-medium">{vehicle.roadServiceLicense}</div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* New Ownership Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ownership Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Ownership Type:</div>
                                    <div className="font-medium">
                                        <Badge variant={vehicle.ownership === "owned" ? "outline" : "secondary"}>
                                            {formatOwnershipType(vehicle.ownership)}
                                        </Badge>
                                    </div>

                                    {vehicle.ownership === "outsourced" && vehicle.ownerName && (
                                        <>
                                            <div className="text-muted-foreground">Owner Name:</div>
                                            <div className="font-medium flex items-center">
                                                <User className="h-3.5 w-3.5 mr-1 text-[#e31c39]" />
                                                {vehicle.ownerName}
                                            </div>
                                        </>
                                    )}

                                    {vehicle.ownership === "outsourced" && vehicle.ownerContact && (
                                        <>
                                            <div className="text-muted-foreground">Owner Contact:</div>
                                            <div className="font-medium flex items-center">
                                                <Phone className="h-3.5 w-3.5 mr-1 text-[#e31c39]" />
                                                {vehicle.ownerContact}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full bg-[#e31c39] hover:bg-[#e31c39]/90"
                                    disabled={vehicle.status !== "available"}
                                    asChild
                                >
                                    <Link to={`/bookings/new?vehicleId=${id}`}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Book This Vehicle
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/vehicles/${id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </Link>
                                </Button>
                                {/*<Button variant="outline" className="w-full" onClick={() => setShowMaintenanceModal(true)}>*/}
                                {/*    <Wrench className="mr-2 h-4 w-4" />*/}
                                {/*    Schedule Maintenance*/}
                                {/*</Button>*/}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            {/* Maintenance Modal */}
            <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Schedule Maintenance</DialogTitle>
                        <DialogDescription>
                            Schedule maintenance for {vehicle?.name}. This will mark the vehicle as unavailable during the maintenance
                            period.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maintenance-date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="maintenance-date"
                                type="date"
                                value={maintenanceDate}
                                onChange={(e) => setMaintenanceDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maintenance-type" className="text-right">
                                Type
                            </Label>
                            <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select maintenance type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="oil-change">Oil Change</SelectItem>
                                    <SelectItem value="tire-replacement">Tire Replacement</SelectItem>
                                    <SelectItem value="brake-service">Brake Service</SelectItem>
                                    <SelectItem value="general-service">General Service</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maintenance-notes" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="maintenance-notes"
                                value={maintenanceNotes}
                                onChange={(e) => setMaintenanceNotes(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter maintenance details"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!maintenanceDate || !maintenanceType) return

                                setIsSubmittingMaintenance(true)
                                try {
                                    // This would be replaced with an actual API call
                                    await new Promise((resolve) => setTimeout(resolve, 1000))

                                    // Add to maintenance history (this is just for demo)
                                    // const newRecord = {
                                    //     date: maintenanceDate,
                                    //     type: maintenanceType
                                    //         .split("-")
                                    //         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    //         .join(" "),
                                    //     cost: "Pending",
                                    //     notes: maintenanceNotes || "No notes provided",
                                    // }

                                    // In a real app, you would update the state with the new record
                                    // and make an API call to save it

                                    setShowMaintenanceModal(false)
                                    setMaintenanceDate("")
                                    setMaintenanceType("")
                                    setMaintenanceNotes("")

                                    // Show success message
                                    alert("Maintenance scheduled successfully!")
                                } catch (error) {
                                    console.error("Error scheduling maintenance:", error)
                                    alert("Failed to schedule maintenance. Please try again.")
                                } finally {
                                    setIsSubmittingMaintenance(false)
                                }
                            }}
                            disabled={!maintenanceDate || !maintenanceType || isSubmittingMaintenance}
                        >
                            {isSubmittingMaintenance ? "Scheduling..." : "Schedule"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}