import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Edit, Printer, Calendar, User, Car, CreditCard, FileText, Clock } from 'lucide-react'

export default function BookingDetailsPage() {
    const { id } = useParams<{ id: string }>()

    // Mock data for a specific booking
    const booking = {
        id,
        customer: {
            id: "C-001",
            name: "John Kamau",
            email: "john.kamau@example.com",
            phone: "+254 712 345 678",
            address: "123 Moi Avenue, Nairobi, Kenya",
        },
        vehicle: {
            id: "V-001",
            name: "Toyota Hiace",
            type: "Van",
            capacity: "14 Seater",
            licensePlate: "KCB 123A",
        },
        startDate: "2023-04-20",
        endDate: "2023-04-30",
        status: "Active",
        totalAmount: "KES 25,000",
        deposit: "KES 5,000",
        balance: "KES 20,000",
        paymentStatus: "Partially Paid",
        additionalServices: [
            { name: "Driver", cost: "KES 2,500" },
            { name: "Full Tank Fuel", cost: "KES 5,000" },
        ],
        notes: "Customer requested early pickup at 8:00 AM. Vehicle should be ready by 7:30 AM.",
        paymentHistory: [
            { date: "2023-04-15", amount: "KES 5,000", method: "M-Pesa", status: "Completed", reference: "MPESA123456" },
        ],
        timeline: [
            { date: "2023-04-15", time: "10:23 AM", event: "Booking Created", user: "Admin" },
            { date: "2023-04-15", time: "10:30 AM", event: "Deposit Payment Received", user: "System" },
            { date: "2023-04-15", time: "11:45 AM", event: "Booking Confirmed", user: "Admin" },
        ],
    }

    // Function to determine badge color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-green-500"
            case "Pending":
                return "bg-yellow-500"
            case "Completed":
                return "bg-primary"
            case "Cancelled":
                return "bg-destructive"
            default:
                return "bg-muted"
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
                    <h1 className="text-2xl font-bold">Booking Details</h1>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/bookings/${id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Booking
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={`/bookings/${id}/invoice`}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Booking #{booking.id}</h2>
                                <p className="text-sm text-muted-foreground">Created on April 15, 2023</p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                            </Badge>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-primary" />
                                        <CardTitle className="text-base">Customer Information</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">{booking.customer.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">({booking.customer.id})</span>
                                        </div>
                                        <div className="text-muted-foreground">{booking.customer.email}</div>
                                        <div className="text-muted-foreground">{booking.customer.phone}</div>
                                        <div className="text-muted-foreground">{booking.customer.address}</div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs" asChild>
                                        <Link to={`/customers/${booking.customer.id}`}>View Customer Profile</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center">
                                        <Car className="h-4 w-4 mr-2 text-primary" />
                                        <CardTitle className="text-base">Vehicle Information</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">{booking.vehicle.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">({booking.vehicle.id})</span>
                                        </div>
                                        <div className="text-muted-foreground">{booking.vehicle.type}</div>
                                        <div className="text-muted-foreground">{booking.vehicle.capacity}</div>
                                        <div className="text-muted-foreground">License Plate: {booking.vehicle.licensePlate}</div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs" asChild>
                                        <Link to={`/vehicles/${booking.vehicle.id}`}>View Vehicle Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Start Date</div>
                                        <div className="font-medium">{booking.startDate}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">End Date</div>
                                        <div className="font-medium">{booking.endDate}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                        <div className="font-medium">11 Days</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Total Amount</div>
                                        <div className="font-medium">{booking.totalAmount}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">Additional Services</h3>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Service</TableHead>
                                                    <TableHead className="text-right">Cost</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {booking.additionalServices.map((service, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{service.name}</TableCell>
                                                        <TableCell className="text-right">{service.cost}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Notes</h3>
                                        <div className="p-3 bg-muted rounded-md text-sm">{booking.notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="payments">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="payments">Payment History</TabsTrigger>
                                <TabsTrigger value="timeline">Booking Timeline</TabsTrigger>
                            </TabsList>
                            <TabsContent value="payments">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment History</CardTitle>
                                        <CardDescription>Track all payments for this booking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Reference</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {booking.paymentHistory.map((payment, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{payment.date}</TableCell>
                                                        <TableCell>{payment.amount}</TableCell>
                                                        <TableCell>{payment.method}</TableCell>
                                                        <TableCell>{payment.reference}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-green-500 text-green-500">
                                                                {payment.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="timeline">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booking Timeline</CardTitle>
                                        <CardDescription>History of actions taken on this booking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {booking.timeline.map((event, index) => (
                                                <div key={index} className="flex">
                                                    <div className="mr-4 flex flex-col items-center">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                                            <Clock className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                        {index < booking.timeline.length - 1 && <div className="h-full w-px bg-border"></div>}
                                                    </div>
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex items-center">
                                                            <p className="font-medium">{event.event}</p>
                                                            <span className="ml-2 text-xs text-muted-foreground">by {event.user}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {event.date} at {event.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Amount:</span>
                                        <span className="font-medium">{booking.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Paid Amount:</span>
                                        <span className="font-medium">{booking.deposit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Balance Due:</span>
                                        <span className="font-medium">{booking.balance}</span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Payment Status:</span>
                                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                                {booking.paymentStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/bookings/${id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Booking
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/bookings/${id}/invoice`}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print Invoice
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Extend Booking
                                </Button>
                                <Button variant="outline" className="w-full text-destructive">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Cancel Booking
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
