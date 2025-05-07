"use client"

import { useState, useEffect } from "react"
import { useParams, Link,useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Edit, Printer, Calendar, User, Car, CreditCard, FileText, Clock } from "lucide-react"
import BookingService, { type Booking } from "../../services/booking-service"
import { useApi } from "../../hooks/use-api"

export default function BookingDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate();
    const { execute: fetchBooking } = useApi((id?: string) => {
        if (!id) return Promise.reject(new Error("Booking ID is required"))
        return BookingService.getOne(id)
    })

    const { execute: updateBookingStatus } = useApi((params?: { id: string; status: Booking["status"] }) => {
        if (!params) return Promise.reject(new Error("Missing params"))
        return BookingService.updateStatus(params.id, params.status)
    })

    useEffect(() => {
        if (id) {
            loadBooking(id)
        }
    }, [id])

    const loadBooking = async (bookingId: string) => {
        try {
            setLoading(true)
            const data = await fetchBooking(bookingId)
            setBooking(data)
            setError(null)
        } catch (err) {
            console.error("Error loading booking:", err)
            setError("Failed to load booking details")
            setBooking(null)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (status: Booking["status"]) => {
        if (!id || !booking) return

        try {
            const updatedBooking = await updateBookingStatus({ id, status })
            setBooking(updatedBooking)
        } catch (err) {
            console.error("Error updating booking status:", err)
        }
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

    // Calculate duration in days
    const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of both dates
        return diffDays;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">{error || "Booking not found"}</p>
                <Button onClick={() => id && loadBooking(id)} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    const customerName =
        typeof booking.customer === "string" ? booking.customer : booking.customer?.fullName || booking.customer?.fullName || ""


    const customerEmail = typeof booking.customer === "string" ? "" : booking.customer?.email || ""

    const customerPhone = typeof booking.customer === "string" ? "" : booking.customer?.phone || ""

    const vehicleName = typeof booking.vehicle === "string"
        ? booking.vehicle
        : booking.vehicle?.name || (booking.commissions?.ownerPayout?.ownerName ? `Vehicle owned by ${booking.commissions.ownerPayout.ownerName}` : "Unknown vehicle");


    const vehicleType = typeof booking.vehicle === "string" ? "" : booking.vehicle?.type || ""

    const vehicleLicensePlate = typeof booking.vehicle === "string" ? "" : booking.vehicle?.licensePlate || ""

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
                                <h2 className="text-xl font-bold">Booking {booking.bookingId}</h2>
                                <p className="text-sm text-muted-foreground">
                                    Created on {new Date(booking.timeline[0]?.date || new Date()).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
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
                                            <span className="font-medium">{customerName}</span>
                                            {typeof booking.customer !== "string" && booking.customer._id && (
                                                <span className="text-xs text-muted-foreground ml-2">({booking.customer.customerId})</span>
                                            )}
                                        </div>
                                        {customerEmail && <div className="text-muted-foreground">{customerEmail}</div>}
                                        {customerPhone && <div className="text-muted-foreground">{customerPhone}</div>}
                                    </div>
                                </CardContent>
                                {typeof booking.customer !== "string" && booking.customer._id && (
                                    <CardFooter className="pt-0">
                                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                                            <Link to={`/customers/${booking.customer._id}`}>View Customer Profile</Link>
                                        </Button>
                                    </CardFooter>
                                )}
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
                                            <span className="font-medium">{vehicleName}</span>
                                            {typeof booking.vehicle !== "string" && booking.vehicle?._id && (
                                                <span className="text-xs text-muted-foreground ml-2">({booking.vehicle?.vehicleId})</span>
                                            )}
                                        </div>
                                        {vehicleType && <div className="text-muted-foreground">{vehicleType}</div>}
                                        {vehicleLicensePlate && (
                                            <div className="text-muted-foreground">License Plate: {vehicleLicensePlate}</div>
                                        )}

                                        {/* Display commission data if available */}
                                        {booking.commissions?.ownerPayout?.amount && (
                                            <div className="mt-2 pt-2 border-t border-dashed">
                                                <div className="text-muted-foreground">Owner Payout: KES {booking.commissions.ownerPayout.amount.toLocaleString()}</div>
                                                {booking.commissions.ownerPayout.ownerName && (
                                                    <div className="text-muted-foreground">Owner: {booking.commissions.ownerPayout.ownerName}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                {typeof booking.vehicle !== "string" && booking.vehicle?._id && (
                                    <CardFooter className="pt-0">
                                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                                            <Link to={`/vehicles/${booking.vehicle._id}`}>View Vehicle Details</Link>
                                        </Button>
                                    </CardFooter>
                                )}
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
                                        <div className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">End Date</div>
                                        <div className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                        <div className="font-medium">{calculateDuration(booking.startDate, booking.endDate)} Days</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Total Amount</div>
                                        <div className="font-medium">KES {booking.totalAmount.toLocaleString()}</div>
                                    </div>
                                </div>

                                {booking.additionalServices && booking.additionalServices.length > 0 && (
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
                                                            <TableCell className="text-right">KES {service.cost.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {booking.notes && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Notes</h3>
                                        <div className="p-3 bg-muted rounded-md text-sm">{booking.notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="timeline">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="timeline">Booking Timeline</TabsTrigger>
                                <TabsTrigger value="payments">Payment History</TabsTrigger>
                            </TabsList>
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
                                                            <p className="font-medium">{event.status}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                                                        </p>
                                                        {event.note && <p className="text-sm">{event.note}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="payments">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment History</CardTitle>
                                        <CardDescription>Track all payments for this booking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* This would be populated from actual payment data */}
                                        <div className="text-center py-6">
                                            <p className="text-muted-foreground">No payment records found.</p>
                                            <Button variant="outline" className="mt-4">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Record New Payment
                                            </Button>
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
                                        <span className="font-medium">KES {booking.totalAmount.toLocaleString()}</span>
                                    </div>
                                    {/*<div className="flex justify-between text-sm">*/}
                                    {/*    <span className="text-muted-foreground">Paid Amount:</span>*/}
                                    {/*    <span className="font-medium">KES {booking.deposit.toLocaleString()}</span>*/}
                                    {/*</div>*/}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Balance Due:</span>
                                        <span className="font-medium">
                                          KES {booking.balance?.toLocaleString() ?? '0'}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Payment Status:</span>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    booking.paymentStatus === "Paid"
                                                        ? "border-green-500 text-green-500"
                                                        : booking.paymentStatus === "Partially Paid"
                                                            ? "border-yellow-500 text-yellow-500"
                                                            : "border-red-500 text-red-500"
                                                }
                                            >
                                                {booking.paymentStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => navigate('/payments/new')}>
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
                                {booking.status !== "Cancelled" && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-destructive"
                                        onClick={() => handleStatusChange("Cancelled")}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
