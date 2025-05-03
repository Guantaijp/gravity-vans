"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, Loader2 } from "lucide-react"
import { Checkbox } from "../../components/ui/checkbox"
import { cn } from "../../lib/utils"
import BookingService, { type Booking, type BookingInput } from "../../services/booking-service"
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import DriverService, { type Driver } from "../../services/driver-service"
import { toast } from "sonner"

export default function EditBookingPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [booking, setBooking] = useState<Booking | null>(null)

    // Form state
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [totalAmount, setTotalAmount] = useState(0)
    const [deposit, setDeposit] = useState(0)
    const [selectedCustomerId, setSelectedCustomerId] = useState("")
    const [selectedVehicleId, setSelectedVehicleId] = useState("")
    const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(undefined)
    const [status, setStatus] = useState<Booking["status"]>("Pending")
    const [notes, setNotes] = useState("")
    const [additionalServices, setAdditionalServices] = useState<
        {
            name: string
            cost: number
            selected: boolean
        }[]
    >([])

    // Data from API
    // const [ setVehicles] = useState<Vehicle[]>([])
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
    // const [ setDrivers] = useState<Driver[]>([])
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [loadingVehicles, setLoadingVehicles] = useState(false)
    const [loadingDrivers, setLoadingDrivers] = useState(false)

    // Fetch booking data
    useEffect(() => {
        const loadBooking = async () => {
            if (!id) return

            try {
                setLoading(true)

                // Fetch the booking
                const data = await BookingService.getOne(id)
                setBooking(data)

                // Initialize form state with booking data
                if (data) {
                    setStartDate(new Date(data.startDate))
                    setEndDate(new Date(data.endDate))
                    setStatus(data.status)
                    setNotes(data.notes || "")

                    setTotalAmount(data.totalAmount || 0)
                    setDeposit(data.deposit || 0)

                    // Set customer ID
                    if (typeof data.customer === "object" && data.customer?._id) {
                        setSelectedCustomerId(data.customer._id)
                    } else if (typeof data.customer === "string") {
                        setSelectedCustomerId(data.customer)
                    }

                    // Set vehicle ID
                    if (typeof data.vehicle === "object" && data.vehicle?._id) {
                        setSelectedVehicleId(data.vehicle._id)
                    } else if (typeof data.vehicle === "string") {
                        setSelectedVehicleId(data.vehicle)
                    }

                    // Set driver ID if exists
                    if (data.driver) {
                        if (typeof data.driver === "object" && data.driver?._id) {
                            setSelectedDriverId(data.driver._id)
                        } else if (typeof data.driver === "string") {
                            setSelectedDriverId(data.driver)
                        }
                    } else {
                        setSelectedDriverId("no-driver")
                    }

                    // Set additional services
                    if (data.additionalServices && data.additionalServices.length > 0) {
                        const defaultServices = [
                            { name: "Driver", cost: 2500, selected: false },
                            { name: "Full Tank Fuel", cost: 5000, selected: false },
                            { name: "Extra Insurance", cost: 3000, selected: false },
                            { name: "GPS Navigation", cost: 1000, selected: false },
                        ]

                        // Mark services as selected if they exist in the booking
                        const mergedServices = defaultServices.map((defaultService) => {
                            const existingService = data.additionalServices?.find((s) => s.name === defaultService.name)
                            return existingService
                                ? { ...defaultService, cost: existingService.cost, selected: true }
                                : defaultService
                        })

                        // Add any additional services that aren't in the default list
                        data.additionalServices.forEach((service) => {
                            if (!mergedServices.some((s) => s.name === service.name)) {
                                mergedServices.push({ ...service, selected: true })
                            }
                        })

                        setAdditionalServices(mergedServices)
                    } else {
                        // Default services if none exist
                        setAdditionalServices([
                            { name: "Driver", cost: 2500, selected: false },
                            { name: "Full Tank Fuel", cost: 5000, selected: false },
                            { name: "Extra Insurance", cost: 3000, selected: false },
                            { name: "GPS Navigation", cost: 1000, selected: false },
                        ])
                    }
                }

                // Load customers
                await fetchCustomers()

                // Load vehicles and drivers
                await fetchVehiclesAndDrivers(data.startDate, data.endDate)

                setError(null)
            } catch (err) {
                console.error("Error loading booking:", err)
                setError("Failed to load booking details")
            } finally {
                setLoading(false)
            }
        }

        loadBooking()
    }, [id])

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            // Start with the actual customer from the booking if it exists
            const customersList = []

            if (booking && booking.customer && typeof booking.customer === "object") {
                customersList.push(booking.customer)
            }

            // Remove duplicates if any
            const uniqueCustomers = customersList.filter(
                (customer, index, self) => index === self.findIndex((c) => c._id === customer._id),
            )

            setCustomers(uniqueCustomers)
        } catch (err) {
            console.error("Error fetching customers:", err)
            toast.error("Failed to load customers")
        }
    }

    // Fetch vehicles and drivers based on date range
    const fetchVehiclesAndDrivers = async (startDateStr: string, endDateStr: string) => {
        if (!startDateStr || !endDateStr) return

        try {
            // Fetch all vehicles for reference (to get daily rates)
            const allVehicles = await VehicleService.getAll()
            // setVehicles(allVehicles)

            // Fetch available vehicles for the date range
            setLoadingVehicles(true)
            const availVehicles = await VehicleService.getAvailableVehicles(startDateStr, endDateStr)

            // If editing an existing booking, we need to include the currently selected vehicle
            // even if it's not in the available list
            if (selectedVehicleId) {
                const currentVehicle = allVehicles.find((v) => v._id === selectedVehicleId)
                if (currentVehicle && !availVehicles.some((v) => v._id === selectedVehicleId)) {
                    availVehicles.push(currentVehicle)
                }
            }

            setAvailableVehicles(availVehicles)
            setLoadingVehicles(false)

            // Fetch all drivers
            const allDrivers = await DriverService.getAll()

            // // Add a "no driver" option
            // const driversWithNoOption = [
            //     ...allDrivers,
            //     {
            //         _id: "no-driver",
            //         name: "No Driver Required",
            //         phoneNumber: "",
            //         idNumber: "",
            //         licenseNumber: "",
            //         psvNumber: "",
            //         photoId: "",
            //         status: "active" as const,
            //         hireDate: "",
            //         createdAt: "",
            //         updatedAt: "",
            //     },
            // ]
            // setDrivers(driversWithNoOption)

            // Fetch available drivers for the date range
            setLoadingDrivers(true)
            const availDrivers = await DriverService.getAvailableDrivers(startDateStr, endDateStr)

            // If editing an existing booking, include the currently selected driver
            if (selectedDriverId && selectedDriverId !== "no-driver") {
                const currentDriver = allDrivers.find((d) => d._id === selectedDriverId)
                if (currentDriver && !availDrivers.some((d) => d._id === selectedDriverId)) {
                    availDrivers.push(currentDriver)
                }
            }

            // Add the "no driver" option to available drivers
            const availDriversWithNoOption = [
                ...availDrivers,
                {
                    _id: "no-driver",
                    name: "No Driver Required",
                    phoneNumber: "",
                    idNumber: "",
                    licenseNumber: "",
                    psvNumber: "",
                    photoId: "",
                    status: "active" as const,
                    hireDate: "",
                    createdAt: "",
                    updatedAt: "",
                },
            ]

            setAvailableDrivers(availDriversWithNoOption)
            setLoadingDrivers(false)
        } catch (err) {
            console.error("Error fetching vehicles and drivers:", err)
            toast.error("Failed to load vehicles and drivers")
            setLoadingVehicles(false)
            setLoadingDrivers(false)
        }
    }

    // Update available vehicles and drivers when dates change
    useEffect(() => {
        let ignore = false

        if (startDate && endDate) {
            if (!ignore) {
                fetchVehiclesAndDrivers(startDate.toISOString(), endDate.toISOString())
            }
        }

        return () => {
            ignore = true
        }
    }, [startDate, endDate])

    // Calculate total amount when relevant fields change
    useEffect(() => {
        if (booking) {
            // Use the booking's total amount
            setTotalAmount(booking.totalAmount || 0)
        }
    }, [booking])

    const handleVehicleChange = (vehicleId: string) => {
        setSelectedVehicleId(vehicleId)
    }

    const handleAdditionalServiceChange = (index: number, checked: boolean) => {
        setAdditionalServices((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], selected: checked }
            return updated
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!id || !booking || !startDate || !endDate) {
            toast.error("Missing required booking information")
            return
        }

        try {
            setSubmitting(true)

            // Prepare the update data
            const updatedBookingData: Partial<BookingInput> = {
                customer: selectedCustomerId,
                vehicle: selectedVehicleId,
                driver: selectedDriverId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: status,
                totalAmount: totalAmount,
                deposit: deposit,
                notes: notes,
                additionalServices: additionalServices
                    .filter((service) => service.selected)
                    .map(({ name, cost }) => ({ name, cost })),
            }

            // Update the booking
            await BookingService.update(id, updatedBookingData)

            toast.success("Booking updated successfully")

            // Navigate back to booking details
            navigate(`/bookings/${id}`)
        } catch (err) {
            console.error("Error updating booking:", err)
            toast.error("Failed to update booking")
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (booking) {
            setTotalAmount(booking.totalAmount || 0)
            setDeposit(booking.deposit || 0)
        }
    }, [booking])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="p-4 text-center">
                <p className="text-destructive">{error || "Booking not found"}</p>
                <Button onClick={() => id && window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to={`/bookings/${id}`} className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Booking</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <div className="border rounded-md p-4 bg-muted/10 mb-6">
                                <h3 className="font-medium mb-2">Customer Information</h3>
                                {booking.customer && typeof booking.customer === "object" ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <span className="font-medium">Name:</span>
                                            <span className="ml-2">{booking.customer.fullName}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium">Email:</span>
                                            <span className="ml-2">{booking.customer.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium">Phone:</span>
                                            <span className="ml-2">{booking.customer.phone}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No customer information available</p>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle>Booking Information</CardTitle>
                                <CardDescription>Update the details for this booking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Customer</Label>
                                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                            <SelectTrigger id="customer">
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer._id} value={customer._id}>
                                                        {customer.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={(value) => setStatus(value as Booking["status"])}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !startDate && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Select date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate || undefined}
                                                    onSelect={(date) => setStartDate(date || null)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !endDate && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : "Select date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate || undefined}
                                                    onSelect={(date) => setEndDate(date || null)}
                                                    initialFocus
                                                    disabled={(date) => date < (startDate || new Date())}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">
                                            Vehicle {loadingVehicles && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                                        </Label>
                                        <Select value={selectedVehicleId} onValueChange={handleVehicleChange} disabled={loadingVehicles}>
                                            <SelectTrigger id="vehicle">
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableVehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle._id} value={vehicle._id}>
                                                        {vehicle.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="driver">
                                            Driver {loadingDrivers && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                                        </Label>
                                        <Select value={selectedDriverId} onValueChange={setSelectedDriverId} disabled={loadingDrivers}>
                                            <SelectTrigger id="driver">
                                                <SelectValue placeholder="Select driver" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableDrivers.map((driver) => (
                                                    <SelectItem key={driver._id} value={driver._id}>
                                                        {driver.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Additional Services</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                                        {additionalServices.map((service, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`service-${index}`}
                                                    checked={service.selected}
                                                    onCheckedChange={(checked) => handleAdditionalServiceChange(index, checked === true)}
                                                />
                                                <Label htmlFor={`service-${index}`}>{service.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="totalAmount">Total Amount (KES)</Label>
                                        <Input
                                            id="totalAmount"
                                            type="number"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deposit">Deposit Amount (KES)</Label>
                                        <Input
                                            id="deposit"
                                            type="number"
                                            value={deposit}
                                            onChange={(e) => setDeposit(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentStatus">Payment Status</Label>
                                        <Select value={booking.paymentStatus || "Unpaid"} disabled={true}>
                                            <SelectTrigger id="paymentStatus">
                                                <SelectValue placeholder="Payment status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="balance">Balance Due (KES)</Label>
                                        <Input
                                            id="balance"
                                            type="number"
                                            value={booking.calculatedBalance || booking.balance || totalAmount - deposit}
                                            disabled={true}
                                        />
                                    </div>
                                </div>

                                {booking.timeline && booking.timeline.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Booking Timeline</Label>
                                        <div className="border rounded-md p-4">
                                            <ul className="space-y-2">
                                                {booking.timeline.map((event, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
                                                        <div>
                                                            <p className="text-sm font-medium">{event.note}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Special Requests / Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Enter any special requests or notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="border rounded-md p-4 bg-muted/50">
                                    <h3 className="font-medium mb-2">Booking Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Customer:</span>
                                            <span>
                        {booking.customer && typeof booking.customer === "object"
                            ? `${booking.customer.fullName} (${booking.customer.phone})`
                            : "Selected Customer"}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Vehicle:</span>
                                            <span>{typeof booking.vehicle === "object" ? booking.vehicle.name : "Selected Vehicle"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Booking Period:</span>
                                            <span>
                        {startDate && endDate
                            ? `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`
                            : "Selected Dates"}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Vehicle Rental:</span>
                                            <span>KES {totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Deposit Paid:</span>
                                            <span>KES {deposit.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment Status:</span>
                                            <span>{booking.paymentStatus || "Unpaid"}</span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-2 border-t mt-2">
                                            <span>Balance Due:</span>
                                            <span>
                        KES {(booking.calculatedBalance || booking.balance || totalAmount - deposit).toLocaleString()}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" asChild>
                                    <Link to={`/bookings/${id}`}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Booking"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    )
}
