"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ChevronLeft, Printer, Loader2, MessageSquare } from "lucide-react"
import BookingService, { type Booking } from "../../services/booking-service"
import VehicleService from "../../services/vehicle-service"
import { toast } from "sonner"

export default function InvoicePage() {
    const { id } = useParams<{ id: string }>()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [invoiceItems, setInvoiceItems] = useState<any[]>([])
    const [invoiceTotals, setInvoiceTotals] = useState({
        subtotal: 0,
        tax: 0,
        total: 0,
        balance: 0,
    })
    const [vehicleDetails, setVehicleDetails] = useState<any>(null)
    const [processingAction, setProcessingAction] = useState<string | null>(null)

    // Load booking data
    useEffect(() => {
        const loadBooking = async () => {
            if (!id) return

            try {
                setLoading(true)
                const data = await BookingService.getOne(id)
                setBooking(data)

                // Fetch vehicle details if we have a vehicle ID
                if (data.vehicle) {
                    try {
                        const vehicleId = typeof data.vehicle === "string" ? data.vehicle : data.vehicle._id
                        if (vehicleId) {
                            const vehicleData = await VehicleService.getById(vehicleId)
                            setVehicleDetails(vehicleData)
                        }
                    } catch (vehicleErr) {
                        console.error("Error fetching vehicle details:", vehicleErr)
                        // Continue with the invoice even if vehicle details fail to load
                    }
                }

                // Process invoice items
                await processInvoiceItems(data)

                setError(null)
            } catch (err) {
                console.error("Error loading booking:", err)
                setError("Failed to load booking details")
                setBooking(null)
            } finally {
                setLoading(false)
            }
        }

        loadBooking()
    }, [id])

    // Process booking data into invoice items and totals
    const processInvoiceItems = async (booking: Booking) => {
        if (!booking) return

        const items = []

        // Calculate duration in days
        const startDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        // Get vehicle name
        let vehicleName = "Vehicle"

        if (vehicleDetails) {
            // Use fetched vehicle details
            vehicleName = vehicleDetails.name
        } else if (typeof booking.vehicle === "object" && booking.vehicle) {
            // Use vehicle info from booking
            vehicleName = booking.vehicle.name || "Vehicle"
        }

        // Base vehicle rental
        items.push({
            description: `${vehicleName} Rental`,
            days,
        })

        // Additional services
        if (booking.additionalServices && booking.additionalServices.length > 0) {
            booking.additionalServices.forEach((service) => {
                // For driver service, multiply by days
                const isDaily = service.name.toLowerCase().includes("driver")
                const serviceDays = isDaily ? days : 1

                items.push({
                    description: service.name,
                    days: serviceDays,
                })
            })
        }

        // Use the booking's totalAmount directly
        const subtotal = booking.totalAmount || 0

        // No tax
        const tax = 0

        // Calculate total
        const total = subtotal + tax

        // Calculate balance
        const balance = booking.calculatedBalance
            || booking.balance
            || total - (booking.deposit ?? 0);

        setInvoiceItems(items)
        setInvoiceTotals({
            subtotal: Number(subtotal),
            tax: Number(tax),
            total: Number(total),
            balance: Number(balance),
        });
    }

    const handleSendToWhatsApp = async () => {
        setProcessingAction("whatsapp")
        try {
            // Format the invoice details for WhatsApp
            const invoiceDetails = `
*INVOICE: ${invoiceNumber}*
*Gravity Vans*

*BILL TO:*
${customerName}
${customerPhone}

*BOOKING DETAILS:*
Vehicle: ${vehicleName}
Period: ${new Date(booking!.startDate).toLocaleDateString()} to ${new Date(booking!.endDate).toLocaleDateString()}

*TOTAL:* KES ${booking!.totalAmount.toLocaleString()}
*PAID:* KES ${booking?.deposit?.toLocaleString() ?? '0'}
{booking ? (
  <div>
    <strong>BALANCE DUE:</strong> KES {(
      booking.calculatedBalance || 
      booking.balance || 
      (booking.totalAmount - booking.deposit)
    ).toLocaleString()}
  </div>
) : (
  <div>No booking information available.</div>
)}
Thank you for choosing Gravity Vans!
      `.trim()

            // Encode the message for WhatsApp
            const encodedMessage = encodeURIComponent(invoiceDetails)

            // Open WhatsApp with the pre-filled message
            window.open(`https://wa.me/254795070535?text=${encodedMessage}`, "_blank")

            toast.success("WhatsApp opened with invoice details")
        } catch (err) {
            console.error("Error sending to WhatsApp:", err)
            toast.error("Failed to send invoice to WhatsApp")
        } finally {
            setProcessingAction(null)
        }
    }

    const handlePrint = () => {
        window.print()
    }

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
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    const customerName =
        typeof booking.customer === "string" ? booking.customer : booking.customer?.fullName || booking.customer?.fullName || ""

    const customerEmail = typeof booking.customer === "string" ? "" : booking.customer?.email || ""

    const customerPhone = typeof booking.customer === "string" ? "" : booking.customer?.phone || ""

    const customerAddress = typeof booking.customer === "string" ? "" : "No address provided"

    // Use vehicle details from the API if available, otherwise fall back to booking data
    const vehicleName =
        vehicleDetails?.name || (typeof booking.vehicle === "string" ? booking.vehicle : booking.vehicle?.name || "")

    const vehicleCapacity =
        vehicleDetails?.capacity ||
        (typeof booking.vehicle === "string" ? "" : booking.vehicle?.capacity || booking.vehicle?.type || "")

    const vehicleLicensePlate =
        vehicleDetails?.licensePlate || (typeof booking.vehicle === "string" ? "" : booking.vehicle?.licensePlate || "")

    const invoiceNumber = `INV-${new Date().getFullYear()}-${id?.substring(0, 8)}`
    const currentDate = new Date().toLocaleDateString()
    const dueDate = new Date(booking.startDate).toLocaleDateString()

    return (
        <div className="flex flex-col">
            <header className="border-b print:hidden">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to={`/bookings/${id}`} className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Invoice</h1>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" onClick={handleSendToWhatsApp} disabled={processingAction !== null}>
                            {processingAction === "whatsapp" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send to WhatsApp
                                </>
                            )}
                        </Button>
                        <Button onClick={handlePrint} disabled={processingAction !== null}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
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
                                            <p className="font-medium">Invoice Number: {invoiceNumber}</p>
                                            <p>Booking ID: {booking._id}</p>
                                            <p>Date: {currentDate}</p>
                                            <p>Due Date: {dueDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Booking Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">BILL TO:</h3>
                                        <div className="text-sm">
                                            <p className="font-medium">{customerName}</p>
                                            <p>{customerAddress}</p>
                                            {customerPhone && <p>{customerPhone}</p>}
                                            {customerEmail && <p>{customerEmail}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2 text-muted-foreground">BOOKING DETAILS:</h3>
                                        <div className="text-sm">
                                            <p>
                                                <span className="font-medium">Vehicle:</span> {vehicleName}
                                                {vehicleCapacity && ` (${vehicleCapacity})`}
                                            </p>
                                            {vehicleLicensePlate && (
                                                <p>
                                                    <span className="font-medium">License Plate:</span> {vehicleLicensePlate}
                                                </p>
                                            )}
                                            <p>
                                                <span className="font-medium">Rental Period:</span>{" "}
                                                {new Date(booking.startDate).toLocaleDateString()} to{" "}
                                                {new Date(booking.endDate).toLocaleDateString()}
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
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className="text-right">{item.days}</TableCell>
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
                                                <span>KES {booking.totalAmount.toLocaleString()}</span>
                                            </div>
                                            {invoiceTotals.tax > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Tax:</span>
                                                    <span>KES {invoiceTotals.tax.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total:</span>
                                                <span>KES {booking.totalAmount.toLocaleString()}</span>
                                            </div>
                                            {/*<div className="flex justify-between text-sm pt-2">*/}
                                            {/*    <span className="text-muted-foreground">Amount Paid:</span>*/}
                                            {/*    <span>KES {booking.deposit.toLocaleString()}</span>*/}
                                            {/*</div>*/}
                                            <div className="flex justify-between font-bold text-primary">
                                                <span>Balance Due:</span>
                                                <span>
  KES{" "}
                                                    {(
                                                        booking.calculatedBalance ??
                                                        booking.balance ??
                                                        (booking.totalAmount - (booking.deposit ?? 0))
                                                    ).toLocaleString()}
</span>

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
                                            <p>Account Number: BOOKING-{booking._id}</p>
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
