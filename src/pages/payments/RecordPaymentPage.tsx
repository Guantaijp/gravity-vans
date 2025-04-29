import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, CreditCard } from 'lucide-react'
import { cn } from "../../lib/utils"

export default function RecordPaymentPage() {
    const navigate = useNavigate()
    const [paymentDate, setPaymentDate] = useState<Date>(new Date())
    const [amount, setAmount] = useState("5000")
    const [selectedBooking, setSelectedBooking] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("mpesa")
    const [reference, setReference] = useState("")
    const [notes, setNotes] = useState("")

    // Mock data for bookings with outstanding balances
    const bookings = [
        {
            id: "B-2023-001",
            customer: "John Kamau",
            vehicle: "Toyota Hiace",
            balance: 20000,
            dueDate: "2023-04-30",
        },
        {
            id: "B-2023-002",
            customer: "Mary Wanjiku",
            vehicle: "Nissan Urvan",
            balance: 15000,
            dueDate: "2023-04-29",
        },
        {
            id: "B-2023-003",
            customer: "David Ochieng",
            vehicle: "Toyota Coaster",
            balance: 30000,
            dueDate: "2023-05-01",
        },
        {
            id: "B-2023-004",
            customer: "Sarah Njeri",
            vehicle: "Mitsubishi Rosa",
            balance: 25000,
            dueDate: "2023-05-02",
        },
    ]

    const handleBookingChange = (bookingId: string) => {
        setSelectedBooking(bookingId)
        const booking = bookings.find((b) => b.id === bookingId)
        if (booking) {
            setAmount(booking.balance.toString())
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would normally submit the payment to your backend
        // For now, we'll just navigate back to the payments page
        navigate("/payments")
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
                                                <SelectItem key={booking.id} value={booking.id}>
                                                    {booking.id} - {booking.customer} - KES {booking.balance.toLocaleString()} due
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedBooking && (
                                    <div className="border rounded-md p-4 bg-muted/50">
                                        <h3 className="font-medium mb-2">Booking Summary</h3>
                                        {(() => {
                                            const booking = bookings.find((b) => b.id === selectedBooking)
                                            if (!booking) return null
                                            return (
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Customer:</span>
                                                        <span>{booking.customer}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Vehicle:</span>
                                                        <span>{booking.vehicle}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Due Date:</span>
                                                        <span>{booking.dueDate}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-2 border-t mt-2">
                                                        <span>Outstanding Balance:</span>
                                                        <span>KES {booking.balance.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )
                                        })()}
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
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="method">Payment Method</Label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger id="method">
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mpesa">M-Pesa</SelectItem>
                                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="card">Credit Card</SelectItem>
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
                                <Button type="submit">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </main>
        </div>
    )
}
