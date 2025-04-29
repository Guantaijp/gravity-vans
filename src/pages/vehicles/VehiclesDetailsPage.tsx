"use client"

import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Edit, Calendar, Users, Car, Fuel, Wrench, FileText } from "lucide-react"

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>()

    // Mock data for a specific vehicle
    const vehicle = {
        id,
        name: "Toyota Hiace",
        type: "Van",
        capacity: "14 Seater",
        licensePlate: "KCB 123A",
        status: "Available",
        dailyRate: "KES 8,000",
        make: "Toyota",
        model: "Hiace",
        year: "2022",
        fuel: "Diesel",
        transmission: "Manual",
        insurance: "INS-2023-456",
        insuranceExpiry: "2024-06-30",
        description:
            "The Toyota HiAce is a versatile and reliable van perfect for group transportation. This 14-seater model features comfortable seating, air conditioning, and ample luggage space, making it ideal for airport transfers, corporate events, and group tours around Kenya.",
        features: [
            "Air Conditioning",
            "Power Steering",
            "AM/FM Radio",
            "USB Charging Ports",
            "Seat Belts for All Passengers",
            "Luggage Space",
            "First Aid Kit",
        ],
        maintenanceHistory: [
            { date: "2023-03-15", type: "Oil Change", cost: "KES 5,000", notes: "Regular maintenance" },
            { date: "2023-01-20", type: "Tire Replacement", cost: "KES 32,000", notes: "Replaced all four tires" },
            { date: "2022-11-05", type: "Brake Service", cost: "KES 12,000", notes: "Replaced brake pads" },
        ],
        bookingHistory: [
            { id: "B-2023-001", customer: "John Kamau", startDate: "2023-04-20", endDate: "2023-04-30", status: "Completed" },
            {
                id: "B-2023-005",
                customer: "James Mwangi",
                startDate: "2023-04-15",
                endDate: "2023-04-25",
                status: "Completed",
            },
            {
                id: "B-2023-012",
                customer: "Lucy Akinyi",
                startDate: "2023-03-10",
                endDate: "2023-03-15",
                status: "Completed",
            },
        ],
        image: "/placeholder.svg?height=300&width=500",
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
                            <Link to="/bookings/new">Create Booking</Link>
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
                                    src={vehicle.image || "/placeholder.svg"}
                                    alt={vehicle.name}
                                    className="w-full h-64 object-cover rounded-t-lg"
                                />
                                <Badge
                                    className={`absolute top-4 right-4 ${
                                        vehicle.status === "Available"
                                            ? "bg-green-500"
                                            : vehicle.status === "Booked"
                                                ? "bg-[#0a192f]"
                                                : "bg-[#e31c39]"
                                    }`}
                                >
                                    {vehicle.status}
                                </Badge>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{vehicle.name}</CardTitle>
                                        <CardDescription>
                                            {vehicle.type} • {vehicle.capacity}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{vehicle.dailyRate}</p>
                                        <p className="text-sm text-muted-foreground">per day</p>
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
                                        <span className="text-sm font-medium">{vehicle.capacity}</span>
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
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="bookings">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="bookings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booking History</CardTitle>
                                        <CardDescription>Past and upcoming bookings for this vehicle</CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                                                {vehicle.bookingHistory.map((booking) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-medium">{booking.id}</TableCell>
                                                        <TableCell>{booking.customer}</TableCell>
                                                        <TableCell>{booking.startDate}</TableCell>
                                                        <TableCell>{booking.endDate}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                                                                {booking.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link to={`/bookings/${booking.id}`}>View</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
                                                {vehicle.maintenanceHistory.map((record, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{record.date}</TableCell>
                                                        <TableCell>{record.type}</TableCell>
                                                        <TableCell>{record.cost}</TableCell>
                                                        <TableCell>{record.notes}</TableCell>
                                                    </TableRow>
                                                ))}
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
                                    <div className="font-medium">{vehicle.capacity}</div>

                                    <div className="text-muted-foreground">Fuel Type:</div>
                                    <div className="font-medium">{vehicle.fuel}</div>

                                    <div className="text-muted-foreground">Transmission:</div>
                                    <div className="font-medium">{vehicle.transmission}</div>

                                    <div className="text-muted-foreground">Insurance No:</div>
                                    <div className="font-medium">{vehicle.insurance}</div>

                                    <div className="text-muted-foreground">Insurance Expiry:</div>
                                    <div className="font-medium">{vehicle.insuranceExpiry}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Availability Calendar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center p-4 border rounded-md">
                                    <p className="text-sm text-muted-foreground mb-2">Calendar view will be displayed here</p>
                                    <Button variant="outline" size="sm">
                                        View Full Calendar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                                    <Link to="/bookings/new">
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
                                <Button variant="outline" className="w-full">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Schedule Maintenance
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
