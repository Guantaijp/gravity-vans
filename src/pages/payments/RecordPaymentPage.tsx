"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, CreditCard } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { cn } from "../../lib/utils"

import bookingService, { type Booking } from "../../services/booking-service"
import api from "../../services/api"

export default function RecordPaymentPage() {
    const navigate = useNavigate()
    const [paymentDate, setPaymentDate] = useState<Date>(new Date())
    const [amount, setAmount] = useState("")
    const [selectedBooking, setSelectedBooking] = useState("")
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank" | "mobile" | "mpesa">("mpesa")
    const [reference, setReference] = useState("")
    const [notes, setNotes] = useState("")
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed" | "refunded">("completed")

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const fetchedBookings = await bookingService.getAll()
                // Filter bookings with unpaid or partially paid status
                const bookingsWithBalance = fetchedBookings.filter(
                    (booking) => booking.paymentStatus === "Unpaid" || booking.paymentStatus === "Partially Paid",
                )
                setBookings(bookingsWithBalance)
            } catch (error) {
                console.error("Failed to fetch bookings:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [])

    const handleBookingChange = async (bookingId: string) => {
        setSelectedBooking(bookingId)
        try {
            const booking = await bookingService.getOne(bookingId)
            if (booking?.balance != null) {
                setAmount(booking.balance.toString());
            }
        } catch (error) {
            console.error("Failed to fetch booking details:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedBooking) {
            alert("Please select a booking")
            return
        }

        try {
            // Create payment record using the correct endpoint format /:id/payments
            const response = await api.post(`/bookings/${selectedBooking}/payments`, {
                amount: Number(amount),
                method: formatPaymentMethod(paymentMethod),
                reference: reference || "",
                notes: notes || "",
                status: paymentStatus,
                paymentDate: format(paymentDate, "yyyy-MM-dd"),
            })
            console.log(response)

            // Navigate back to payments page after successful submission
            navigate("/payments")
        } catch (error) {
            console.error("Failed to record payment:", error)
            alert("Failed to record payment. Please try again.")
        }
    }

    const getSelectedBooking = () => {
        return bookings.find((b) => b._id === selectedBooking)
    }

    const getCustomerName = (booking: Booking) => {
        if (typeof booking.customer === "string") {
            return booking.customer
        }
        return `${booking.customer.fullName}` || booking.customer.email
    }

    const getVehicleName = (booking: Booking) => {
        if (typeof booking.vehicle === "string") {
            return booking.vehicle
        }
        return booking.vehicle?.name || booking.vehicle?.licensePlate
    }

    // Calculate amount already paid (total - balance)
    const getAmountPaid = (booking: Booking) => {
        return booking.totalAmount - (booking.balance ?? 0);
    }

    // Format payment method to match backend expectations (capitalization)
    const formatPaymentMethod = (method: string): string => {
        if (method === "mpesa") return "M-Pesa"
        if (method === "cash") return "Cash"
        if (method === "card") return "Card"
        return method // bank and mobile can stay as is
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/payments" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Record New Payment</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <p>Loading bookings...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Information</CardTitle>
                                    <CardDescription>Enter the details of the payment received from a customer.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="booking">Booking</Label>
                                        <Select value={selectedBooking} onValueChange={handleBookingChange}>
                                            <SelectTrigger id="booking">
                                                <SelectValue placeholder="Select booking with outstanding balance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bookings.map((booking) => (
                                                    <SelectItem key={booking._id} value={booking._id}>
                                                        {booking._id} - {getCustomerName(booking)} - KES {typeof booking.balance === 'number' ? booking.balance.toLocaleString() : 'N/A'} due
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedBooking && getSelectedBooking() && (
                                        <div className="border rounded-md p-4 bg-muted/50">
                                            <h3 className="font-medium mb-2">Booking Summary</h3>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Customer:</span>
                                                    <span>{getCustomerName(getSelectedBooking()!)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Vehicle:</span>
                                                    <span>{getVehicleName(getSelectedBooking()!)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Status:</span>
                                                    <span>{getSelectedBooking()?.status}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Total Amount:</span>
                                                    <span>KES {getSelectedBooking()?.totalAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Amount Paid:</span>
                                                    <span>KES {getAmountPaid(getSelectedBooking()!).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between font-medium pt-2 border-t mt-2">
                                                    <span>Outstanding Balance:</span>
                                                    <span>
          KES {(getSelectedBooking()?.balance ?? 0).toLocaleString()}
        </span>                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (KES)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="method">Payment Method</Label>
                                            <Select
                                                value={paymentMethod}
                                                onValueChange={(value) =>
                                                    setPaymentMethod(value as "cash" | "card" | "bank" | "mobile" | "mpesa")
                                                }
                                            >
                                                <SelectTrigger id="method">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="card">Card</SelectItem>
                                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                                    <SelectItem value="mobile">Mobile Money</SelectItem>
                                                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Payment Status</Label>
                                            <Select
                                                value={paymentStatus}
                                                onValueChange={(value) =>
                                                    setPaymentStatus(value as "pending" | "completed" | "failed" | "refunded")
                                                }
                                            >
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                    <SelectItem value="refunded">Refunded</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reference">Reference Number</Label>
                                            <Input
                                                id="reference"
                                                placeholder="Transaction reference"
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {paymentMethod === "mpesa"
                                                    ? "Enter the M-Pesa confirmation code"
                                                    : paymentMethod === "bank"
                                                        ? "Enter the bank reference number"
                                                        : paymentMethod === "card"
                                                            ? "Enter the card transaction ID"
                                                            : "Enter a reference for this payment"}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Payment Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !paymentDate && "text-muted-foreground",
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={paymentDate}
                                                        onSelect={(date) => setPaymentDate(date || new Date())}
                                                        initialFocus
                                                        disabled={(date) => date > new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Add any additional notes about this payment"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" type="button" asChild>
                                        <Link to="/payments">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={!selectedBooking || !amount}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Record Payment
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    )}
                </div>
            </main>
        </div>
    )
}
