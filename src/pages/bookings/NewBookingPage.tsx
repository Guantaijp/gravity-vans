"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, Plus, Trash2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input } from "../../components/ui/input"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import BookingService, { type BookingInput } from "../../services/booking-service"
import CustomerService, { type Customer } from "../../services/customer-service"
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import DriverService, { type Driver } from "../../services/driver-service"
import { toast } from "sonner"

interface AdditionalService {
    name: string
}

export default function NewBookingPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [selectedVehicle, setSelectedVehicle] = useState<string>("")
    const [selectedCustomer, setSelectedCustomer] = useState<string>("")
    const [selectedDriver, setSelectedDriver] = useState<string>("")
    const [totalAmount, setTotalAmount] = useState<number>(0)
    const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([{ name: "Driver Allowance" }])
    const [notes, setNotes] = useState<string>("")
    const [status, setStatus] = useState<"Pending" | "Active" | "Completed" | "Cancelled">("Pending")
    const [deposit, setDeposit] = useState<number>(0)

    // Outsourced vehicle state
    const [vehicleSource, setVehicleSource] = useState<"company" | "outsourced">("company")
    const [outsourcedOwnerName, setOutsourcedOwnerName] = useState<string>("")
    const [outsourcedOwnerPhone, setOutsourcedOwnerPhone] = useState<string>("")

    // Data lists
    const [customers, setCustomers] = useState<Customer[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    console.log(vehicles)
    const [drivers, setDrivers] = useState<Driver[]>([])
    console.log(drivers)
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])

    // Fetch initial data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch customers
                const customersData = await CustomerService.getAll()
                setCustomers(customersData)

                // Fetch all vehicles
                const vehiclesData = await VehicleService.getAll()
                setVehicles(vehiclesData)

                // Fetch all drivers
                const driversData = await DriverService.getAll()
                setDrivers(driversData)
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load data")
            }
        }

        fetchData()
    }, [])

    // Fetch available vehicles and drivers when dates change
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!startDate || !endDate) return

            try {
                const startDateStr = startDate.toISOString()
                const endDateStr = endDate.toISOString()

                // Get the VehicleService singleton/instance first
                // const availableVehiclesData = await VehicleService.getAvailableVehicles(startDateStr, endDateStr)
                setAvailableVehicles(await VehicleService.getAvailableVehicles(startDateStr, endDateStr))

                // Same for driver service
                const availableDriversData = await DriverService.getAvailableDrivers(startDateStr, endDateStr)
                setAvailableDrivers(availableDriversData.filter((driver) => driver.status === "active"))
            } catch (error) {
                console.error("Error fetching availability:", error)
                toast.error("Failed to check availability")
            }
        }
        fetchAvailability()
    }, [startDate, endDate])

    const handleAddService = () => {
        setAdditionalServices([...additionalServices, { name: "" }])
    }

    const handleRemoveService = (index: number) => {
        const updatedServices = [...additionalServices]
        updatedServices.splice(index, 1)
        setAdditionalServices(updatedServices)
    }

    const handleServiceChange = (index: number, value: string) => {
        const updatedServices = [...additionalServices]
        updatedServices[index].name = value
        setAdditionalServices(updatedServices)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!startDate || !endDate || (!selectedVehicle && vehicleSource === "company") || !selectedCustomer) {
            toast.error("Please fill in all required fields")
            return
        }

        if (vehicleSource === "outsourced" && (!outsourcedOwnerName || !outsourcedOwnerPhone)) {
            toast.error("Please provide outsourced vehicle owner details")
            return
        }

        if (totalAmount <= 0) {
            toast.error("Total amount must be greater than zero")
            return
        }

        setIsLoading(true)

        try {
            // Prepare additional services without cost
            const services = additionalServices
                .filter((service) => service.name)
                .map((service) => ({
                    name: service.name,
                    cost: 0, // Cost is now handled by the manual total amount
                }))

            // Add outsourced vehicle info to notes if applicable
            let bookingNotes = notes
            if (vehicleSource === "outsourced") {
                const outsourcedInfo = `- Outsourced Vehicle\n- Owner: ${outsourcedOwnerName}\n- Contact: ${outsourcedOwnerPhone}\n\n`
                bookingNotes = outsourcedInfo + bookingNotes
            }

            const bookingData: BookingInput = {
                customer: selectedCustomer,
                vehicle: vehicleSource === "company" ? selectedVehicle : "", // Empty if outsourced
                driver: selectedDriver && selectedDriver !== "no-driver" ? selectedDriver : undefined,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status,
                totalAmount,
                deposit, // Add the deposit field
                additionalServices: services,
                notes: bookingNotes || undefined,
            }

            const result = await BookingService.create(bookingData)

            toast.success("Booking created successfully")
            navigate(`/bookings/${result._id}`)
        } catch (error) {
            console.error("Error creating booking:", error)
            toast.error("Failed to create booking")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/bookings" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Create New Booking</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Information</CardTitle>
                                <CardDescription>Enter the details for the new booking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Date Selection Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="startDate"
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
                                                    selected={startDate}
                                                    onSelect={(date) => {
                                                        setStartDate(date)
                                                        // Clear end date if it's before new start date
                                                        if (date && endDate && date > endDate) {
                                                            setEndDate(undefined)
                                                        }
                                                        // Clear selected vehicle and driver as availability may change
                                                        setSelectedVehicle("")
                                                        setSelectedDriver("")
                                                    }}
                                                    initialFocus
                                                    disabled={(date) => date < new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="endDate"
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
                                                    selected={endDate}
                                                    onSelect={(date) => {
                                                        setEndDate(date)
                                                        // Clear selected vehicle and driver as availability may change
                                                        setSelectedVehicle("")
                                                        setSelectedDriver("")
                                                    }}
                                                    initialFocus
                                                    disabled={(date) => date < (startDate || new Date())}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Vehicle Source Selection */}
                                <div className="space-y-3">
                                    <Label>Vehicle Source *</Label>
                                    <RadioGroup
                                        value={vehicleSource}
                                        onValueChange={(value: "company" | "outsourced") => setVehicleSource(value)}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="company" id="company" />
                                            <Label htmlFor="company">Company Vehicle</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="outsourced" id="outsourced" />
                                            <Label htmlFor="outsourced">Outsourced Vehicle</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Company Vehicle Selection */}
                                {vehicleSource === "company" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">Select Vehicle *</Label>
                                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                                            <SelectTrigger id="vehicle">
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {startDate && endDate ? (
                                                    availableVehicles.length > 0 ? (
                                                        availableVehicles.map((vehicle) => (
                                                            <SelectItem key={vehicle._id} value={vehicle._id}>
                                                                {vehicle.name || `${vehicle.make} ${vehicle.model}`} - {vehicle.licensePlate} (
                                                                {vehicle.capacity} seater)
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>
                                                            No vehicles available for selected dates
                                                        </SelectItem>
                                                    )
                                                ) : (
                                                    <SelectItem value="none" disabled>
                                                        Please select dates first
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {startDate && endDate && availableVehicles.length === 0 && (
                                            <p className="text-sm text-red-500 mt-1">
                                                No vehicles available for the selected dates. Please choose different dates or use an outsourced
                                                vehicle.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Outsourced Vehicle Details */}
                                {vehicleSource === "outsourced" && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="outsourcedOwnerName">Owner Name *</Label>
                                            <Input
                                                id="outsourcedOwnerName"
                                                value={outsourcedOwnerName}
                                                onChange={(e) => setOutsourcedOwnerName(e.target.value)}
                                                placeholder="Enter vehicle owner's name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="outsourcedOwnerPhone">Owner Phone *</Label>
                                            <Input
                                                id="outsourcedOwnerPhone"
                                                value={outsourcedOwnerPhone}
                                                onChange={(e) => setOutsourcedOwnerPhone(e.target.value)}
                                                placeholder="Enter vehicle owner's phone number"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Customer Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Customer *</Label>
                                    <div className="flex gap-2">
                                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                            <SelectTrigger id="customer"  className="flex-1">
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer._id} value={customer._id}>
                                                        {customer.fullName} - {customer.phone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" type="button" asChild>
                                            <Link to="/customers/new">
                                                <Plus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Driver Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="driver">Driver (Optional)</Label>
                                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                        <SelectTrigger id="driver">
                                            <SelectValue placeholder="Select driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-driver">No driver</SelectItem>
                                            {startDate && endDate ? (
                                                availableDrivers.length > 0 ? (
                                                    availableDrivers.map((driver) => (
                                                        <SelectItem key={driver._id} value={driver._id}>
                                                            {driver.name} - {driver.phoneNumber}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>
                                                        No drivers available for selected dates
                                                    </SelectItem>
                                                )
                                            ) : (
                                                <SelectItem value="none" disabled>
                                                    Please select dates first
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Additional Services (without cost) */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Additional Services</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="h-8">
                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                            Add Service
                                        </Button>
                                    </div>
                                    <div className="space-y-3 border rounded-md p-4">
                                        {additionalServices.map((service, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-11">
                                                    <Select value={service.name} onValueChange={(value) => handleServiceChange(index, value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select service" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Driver Allowance">Driver Allowance</SelectItem>
                                                            <SelectItem value="Fuel">Fuel</SelectItem>
                                                            <SelectItem value="Park Fee">Park Fee</SelectItem>
                                                            <SelectItem value="Toll Charges">Toll Charges</SelectItem>
                                                            <SelectItem value="Extra Insurance">Extra Insurance</SelectItem>
                                                            <SelectItem value="GPS Navigation">GPS Navigation</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveService(index)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {additionalServices.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-2">No additional services added</p>
                                        )}
                                    </div>
                                </div>

                                {/* Manual Total Amount Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="totalAmount">Total Amount (KES) *</Label>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-sm font-medium">KES</span>
                                        <Input
                                            id="totalAmount"
                                            type="number"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(Number(e.target.value))}
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Deposit Amount Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="deposit">Deposit Amount (KES) *</Label>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-sm font-medium">KES</span>
                                        <Input
                                            id="deposit"
                                            type="number"
                                            value={deposit}
                                            onChange={(e) => setDeposit(Number(e.target.value))}
                                            min={0}
                                            max={totalAmount}
                                            className="w-full"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Required deposit amount from the customer</p>
                                </div>

                                {/* Booking Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Booking Status</Label>
                                    <Select
                                        value={status}
                                        onValueChange={(value: "Pending" | "Active" | "Completed" | "Cancelled") => setStatus(value)}
                                    >
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

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Bullet Points)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Enter notes in bullet points format:
- First point
- Second point
- Third point"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                {/* Booking Summary */}
                                <div className="border rounded-md p-4 bg-muted/50">
                                    <h3 className="font-medium mb-2">Booking Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Vehicle:</span>
                                            <span>
                        {vehicleSource === "company"
                            ? availableVehicles.find((v) => v._id === selectedVehicle)?.name || "Not selected"
                            : `Outsourced (${outsourcedOwnerName || "Owner not specified"})`}
                      </span>
                                        </div>
                                        {additionalServices.map((service, index) =>
                                            service.name ? (
                                                <div key={index} className="flex justify-between">
                                                    <span>{service.name}</span>
                                                    <span>Included</span>
                                                </div>
                                            ) : null,
                                        )}
                                        <div className="flex justify-between">
                                            <span>Deposit:</span>
                                            <span>KES {deposit.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Balance:</span>
                                            <span>KES {(totalAmount - deposit).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-2 border-t mt-2">
                                            <span>Total Amount:</span>
                                            <span>KES {totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/bookings">Cancel</Link>
                                </Button>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Booking"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </main>
        </div>
    )
}
