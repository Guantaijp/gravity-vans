"use client"

import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Download, Printer, Send } from "lucide-react"

export default function InvoicePage() {
    const { id } = useParams<{ id: string }>()

    // Mock data for a specific booking
    const booking = {
        id,
        invoiceNumber: "INV-2023-" + id?.split("-")[1],
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
        totalAmount: 25000,
        deposit: 5000,
        balance: 20000,
        paymentStatus: "Partially Paid",
        items: [
            { description: "Toyota Hiace (14 Seater) Rental", days: 11, rate: 8000, amount: 88000 },
            { description: "Driver Service", days: 11, rate: 2500, amount: 27500 },
            { description: "Full Tank Fuel", days: 1, rate: 5000, amount: 5000 },
        ],
        subtotal: 120500,
        discount: 5000,
        tax: 0,
        total: 115500,
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
                    <h1 className="text-2xl font-bold">Invoice</h1>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline">
                            <Send className="mr-2 h-4 w-4" />
                            Email Invoice
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <Card className="border-0 shadow-lg print:shadow-none">
                        <CardContent className="p-8">
                            <div className="flex flex-col gap-8">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <h1 className="text-2xl font-bold">
                                                <span className="text-primary">Gravity</span> Vans
                                            </h1>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Gravity Vans for Hire Ltd</p>
                                            <p>Mombasa Road, Nairobi</p>
                                            <p>Kenya</p>
                                            <p>info@gravityvans.co.ke</p>
                                            <p>+254 700 123 456</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold text-primary mb-2">INVOICE</h2>
                                        <div className="text-sm">
                                            <p className="font-medium">Invoice Number: {booking.invoiceNumber}</p>
                                            <p>Booking ID: {booking.id}</p>
                                            <p>Date: April 15, 2023</p>
                                            <p>Due Date: April 20, 2023</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Booking Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">BILL TO:</h3>
                                        <div className="text-sm">
                                            <p className="font-medium">{booking.customer.name}</p>
                                            <p>{booking.customer.address}</p>
                                            <p>{booking.customer.phone}</p>
                                            <p>{booking.customer.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">BOOKING DETAILS:</h3>
                                        <div className="text-sm">
                                            <p>
                                                <span className="font-medium">Vehicle:</span> {booking.vehicle.name} ({booking.vehicle.capacity}
                                                )
                                            </p>
                                            <p>
                                                <span className="font-medium">License Plate:</span> {booking.vehicle.licensePlate}
                                            </p>
                                            <p>
                                                <span className="font-medium">Rental Period:</span> {booking.startDate} to {booking.endDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Items */}
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted">
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Days</TableHead>
                                                <TableHead className="text-right">Rate (KES)</TableHead>
                                                <TableHead className="text-right">Amount (KES)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {booking.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className="text-right">{item.days}</TableCell>
                                                    <TableCell className="text-right">{item.rate.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">{item.amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full md:w-1/2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>KES {booking.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Discount:</span>
                                                <span>KES {booking.discount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tax (0%):</span>
                                                <span>KES {booking.tax.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total:</span>
                                                <span>KES {booking.total.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-2">
                                                <span className="text-muted-foreground">Amount Paid:</span>
                                                <span>KES {booking.deposit.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-primary">
                                                <span>Balance Due:</span>
                                                <span>KES {(booking.total - booking.deposit).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info & Terms */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">PAYMENT INFORMATION</h3>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Bank: Kenya Commercial Bank</p>
                                            <p>Account Name: Gravity Vans for Hire Ltd</p>
                                            <p>Account Number: 1234567890</p>
                                            <p>M-Pesa Paybill: 123456</p>
                                            <p>Account Number: BOOKING-{booking.id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">TERMS & CONDITIONS</h3>
                                        <div className="text-sm text-muted-foreground">
                                            <p>1. Full payment is due before vehicle pickup.</p>
                                            <p>2. Cancellation within 48 hours of booking incurs a 50% fee.</p>
                                            <p>3. The vehicle must be returned in the same condition.</p>
                                            <p>4. Additional charges may apply for late returns.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thank You Note */}
                                <div className="text-center pt-4 border-t">
                                    <p className="font-medium">Thank you for choosing Gravity Vans for Hire!</p>
                                    <p className="text-sm text-muted-foreground">
                                        For any inquiries, please contact us at info@gravityvans.co.ke
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
