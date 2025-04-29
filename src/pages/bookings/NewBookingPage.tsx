import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, Plus } from 'lucide-react'
import { Checkbox } from "../../components/ui/checkbox"
import { cn } from "../../lib/utils"

export default function NewBookingPage() {
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [totalAmount, setTotalAmount] = useState(0)
    const [additionalServices, setAdditionalServices] = useState({
        driver: false,
        fuel: false,
        insurance: false,
        gps: false
    })

    // Mock data
    const vehicles = [
        { id: "V-001", name: "Toyota Hiace (14 Seater)", rate: 8000 },
        { id: "V-002", name: "Nissan Urvan (16 Seater)", rate: 7000 },
        { id: "V-003", name: "Toyota Coaster (29 Seater)", rate: 12000 },
        { id: "V-004", name: "Mitsubishi Rosa (25 Seater)", rate: 10000 },
        { id: "V-005", name: "Toyota Land Cruiser (7 Seater)", rate: 15000 },
    ]

    const customers = [
        { id: "C-001", name: "John Kamau" },
        { id: "C-002", name: "Mary Wanjiku" },
        { id: "C-003", name: "David Ochieng" },
        { id: "C-004", name: "Sarah Njeri" },
    ]

    const calculateTotal = (vehicleId: string) => {
        if (!startDate || !endDate) return 0

        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const vehicle = vehicles.find((v) => v.id === vehicleId)
        if (!vehicle) return 0

        let total = vehicle.rate * days

        // Add additional services
        if (additionalServices.driver) total += 2500 * days
        if (additionalServices.fuel) total += 5000
        if (additionalServices.insurance) total += 3000
        if (additionalServices.gps) total += 1000

        return total
    }

    const handleVehicleChange = (vehicleId: string) => {
        setTotalAmount(calculateTotal(vehicleId))
    }

    const handleAdditionalServiceChange = (service: keyof typeof additionalServices, checked: boolean) => {
        setAdditionalServices(prev => {
            const updated = { ...prev, [service]: checked }

            // Recalculate total when services change
            const vehicleSelect = document.getElementById("vehicle") as HTMLSelectElement
            if (vehicleSelect?.value) {
                setTimeout(() => setTotalAmount(calculateTotal(vehicleSelect.value)), 0)
            }

            return updated
        })
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Information</CardTitle>
                            <CardDescription>Enter the details for the new booking</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Customer</Label>
                                    <div className="flex gap-2">
                                        <Select>
                                            <SelectTrigger id="customer">
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle">Vehicle</Label>
                                    <Select onValueChange={handleVehicleChange}>
                                        <SelectTrigger id="vehicle">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.name} - KES {vehicle.rate.toLocaleString()}/day
                                                </SelectItem>
                                            ))}
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
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date)
                                                    // Clear end date if it's before new start date
                                                    if (date && endDate && date > endDate) {
                                                        setEndDate(undefined)
                                                    }
                                                }}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
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
                                                selected={endDate}
                                                onSelect={(date) => {
                                                    setEndDate(date)

                                                    // Recalculate total when dates change
                                                    const vehicleSelect = document.getElementById("vehicle") as HTMLSelectElement
                                                    if (vehicleSelect?.value && startDate && date) {
                                                        setTimeout(() => setTotalAmount(calculateTotal(vehicleSelect.value)), 0)
                                                    }
                                                }}
                                                initialFocus
                                                disabled={(date) => date < (startDate || new Date())}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Additional Services</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="driver"
                                            checked={additionalServices.driver}
                                            onCheckedChange={(checked) =>
                                                handleAdditionalServiceChange('driver', checked === true)
                                            }
                                        />
                                        <Label htmlFor="driver">Driver (KES 2,500/day)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="fuel"
                                            checked={additionalServices.fuel}
                                            onCheckedChange={(checked) =>
                                                handleAdditionalServiceChange('fuel', checked === true)
                                            }
                                        />
                                        <Label htmlFor="fuel">Full Tank Fuel (KES 5,000)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="insurance"
                                            checked={additionalServices.insurance}
                                            onCheckedChange={(checked) =>
                                                handleAdditionalServiceChange('insurance', checked === true)
                                            }
                                        />
                                        <Label htmlFor="insurance">Extra Insurance (KES 3,000)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="gps"
                                            checked={additionalServices.gps}
                                            onCheckedChange={(checked) =>
                                                handleAdditionalServiceChange('gps', checked === true)
                                            }
                                        />
                                        <Label htmlFor="gps">GPS Navigation (KES 1,000)</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Special Requests / Notes</Label>
                                <Textarea id="notes" placeholder="Enter any special requests or notes" />
                            </div>

                            <div className="border rounded-md p-4 bg-muted/50">
                                <h3 className="font-medium mb-2">Booking Summary</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Vehicle Rental:</span>
                                        <span>KES {totalAmount > 0 ? totalAmount.toLocaleString() : '0'}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-2 border-t mt-2">
                                        <span>Total Amount:</span>
                                        <span>KES {totalAmount > 0 ? totalAmount.toLocaleString() : '0'}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        A 20% deposit (KES {Math.round(totalAmount * 0.2).toLocaleString()}) is required to confirm the booking.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" asChild>
                                <Link to="/bookings">Cancel</Link>
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline">Save as Draft</Button>
                                <Button>Create Booking</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
