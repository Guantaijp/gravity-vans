import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ChevronLeft, Printer, CreditCard, User, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Separator } from "../../components/ui/separator"

export default function PaymentDetailsPage() {
    const { id } = useParams<{ id: string }>()

    // Mock data for a specific payment
    const payment = {
        id,
        bookingId: "B-2023-001",
        invoiceNumber: "INV-2023-001",
        customer: {
            id: "C-001",
            name: "John Kamau",
            email: "john.kamau@example.com",
            phone: "+254 712 345 678",
        },
        date: "2023-04-15",
        time: "10:30 AM",
        amount: 5000,
        method: "M-Pesa",
        reference: "MPESA123456",
        status: "Completed",
        notes: "Deposit payment for Toyota Hiace booking",
        processedBy: "Admin User",
        timeline: [
            { date: "2023-04-15", time: "10:28 AM", event: "Payment Initiated", user: "System" },
            { date: "2023-04-15", time: "10:30 AM", event: "Payment Received", user: "System" },
            { date: "2023-04-15", time: "10:32 AM", event: "Payment Confirmed", user: "Admin" },
        ],
    }

    // Function to get badge color based on status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Pending":
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Failed":
                return (
                    <Badge className="bg-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
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
                    <h1 className="text-2xl font-bold">Payment Details</h1>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Payment #{payment.id}</h2>
                                <p className="text-sm text-muted-foreground">
                                    Processed on {payment.date} at {payment.time}
                                </p>
                            </div>
                            {getStatusBadge(payment.status)}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Amount</div>
                                        <div className="text-xl font-bold">KES {payment.amount.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Payment Method</div>
                                        <div className="font-medium">{payment.method}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Reference</div>
                                        <div className="font-medium">{payment.reference}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Date & Time</div>
                                        <div className="font-medium">
                                            {payment.date} at {payment.time}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Status</div>
                                        <div className="font-medium">{getStatusBadge(payment.status)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Processed By</div>
                                        <div className="font-medium">{payment.processedBy}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="font-medium">{payment.customer.name}</div>
                                            <div className="text-muted-foreground">{payment.customer.email}</div>
                                            <div className="text-muted-foreground">{payment.customer.phone}</div>
                                            <div className="mt-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/customers/${payment.customer.id}`}>View Customer</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Booking Information</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="font-medium">Booking ID: {payment.bookingId}</div>
                                            <div className="text-muted-foreground">Invoice: {payment.invoiceNumber}</div>
                                            <div className="text-muted-foreground">{payment.notes}</div>
                                            <div className="mt-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/bookings/${payment.bookingId}`}>View Booking</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="timeline">
                            <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="timeline">Payment Timeline</TabsTrigger>
                            </TabsList>
                            <TabsContent value="timeline">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Timeline</CardTitle>
                                        <CardDescription>History of actions taken on this payment</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {payment.timeline.map((event, index) => (
                                                <div key={index} className="flex">
                                                    <div className="mr-4 flex flex-col items-center">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                                            <Clock className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                        {index < payment.timeline.length - 1 && <div className="h-full w-px bg-border"></div>}
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
                                <CardTitle>Payment Receipt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center p-4 border rounded-md">
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <div className="text-xl font-bold">
                                                <span className="text-primary">Gravity</span> Vans
                                            </div>
                                            <div className="text-sm text-muted-foreground">Payment Receipt</div>
                                        </div>
                                        <div className="mb-4 text-sm">
                                            <div>Receipt No: R-{payment.id}</div>
                                            <div>Date: {payment.date}</div>
                                            <div>Time: {payment.time}</div>
                                        </div>
                                        <div className="mb-4 text-sm">
                                            <div className="font-medium">Customer: {payment.customer.name}</div>
                                            <div>Booking ID: {payment.bookingId}</div>
                                        </div>
                                        <div className="mb-4 text-sm">
                                            <div className="font-medium">Amount Paid:</div>
                                            <div className="text-xl font-bold">KES {payment.amount.toLocaleString()}</div>
                                            <div>Payment Method: {payment.method}</div>
                                            <div>Reference: {payment.reference}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            <div>Thank you for your payment!</div>
                                            <div>For inquiries, contact us at info@gravityvans.co.ke</div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Receipt
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/bookings/${payment.bookingId}`}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        View Booking
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/bookings/${payment.bookingId}/invoice`}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Invoice
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/customers/${payment.customer.id}`}>
                                        <User className="mr-2 h-4 w-4" />
                                        View Customer
                                    </Link>
                                </Button>
                                {payment.status === "Pending" && (
                                    <Button className="w-full">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Confirm Payment
                                    </Button>
                                )}
                                {payment.status === "Completed" && (
                                    <Button variant="outline" className="w-full text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Void Payment
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
