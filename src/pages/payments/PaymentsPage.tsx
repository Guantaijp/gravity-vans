import { useState, useEffect } from "react"
import { Link,useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, CreditCard, CheckCircle2, XCircle, Clock, Download, ArrowUpDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import PaymentService, { Payment } from "../../services/payment-service" // Import the PaymentService

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate(); // Initialize the navigate function

    // Fetch payments on component mount
    useEffect(() => {
        async function fetchPayments() {
            try {
                setIsLoading(true)
                const data = await PaymentService.getAll()
                setPayments(data || []) // Ensure we always have an array even if API returns null/undefined
                setError(null)
            } catch (err) {
                setError("Failed to load payments. Please try again later.")
                console.error("Error fetching payments:", err)
                setPayments([]) // Initialize to empty array on error
            } finally {
                setIsLoading(false)
            }
        }

        fetchPayments()
    }, [])

    // Filter payments based on search term and status filter
    const filteredPayments = payments ? payments.filter((payment) => {
        const search = searchTerm.toLowerCase();

        const matchesId = payment._id.toLowerCase().includes(search);

        const bookingMatches = typeof payment.booking === 'object' && payment.booking !== null
            ? payment.booking._id?.toLowerCase().includes(search) ||
            (typeof payment.booking.customer === 'object' &&
                'fullName' in payment.booking.customer &&
                payment.booking.customer.fullName?.toLowerCase().includes(search))
            : typeof payment.booking === 'string' &&
            payment.booking.toLowerCase().includes(search);

        const referenceMatches = payment.reference?.toLowerCase().includes(search) ?? false;

        const matchesSearch = matchesId || bookingMatches || referenceMatches;

        const matchesStatus = filterStatus === "all" || payment.status?.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    }) : [];


    // Calculate summary statistics
    const totalPayments = payments ? payments.reduce((sum, payment) => sum + payment.amount, 0) : 0
    const completedPayments = payments
        ? payments.filter((payment) => payment.status === "completed")
            .reduce((sum, payment) => sum + payment.amount, 0)
        : 0;

    const pendingPayments = payments
        ? payments.filter((payment) => payment.status === "pending")
            .reduce((sum, payment) => sum + payment.amount, 0)
        : 0;

    const failedPayments = payments
        ? payments.filter((payment) => payment.status === "failed")
            .reduce((sum, payment) => sum + payment.amount, 0)
        : 0;


    // Get counts for each status
    const completedCount = payments ? payments.filter((payment) => payment.status === "completed").length : 0
    const pendingCount = payments ? payments.filter((payment) => payment.status === "pending").length : 0
    const failedCount = payments ? payments.filter((payment) => payment.status === "failed").length : 0

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

    // Function to get customer name from payment object
    // const getCustomerName = (payment: Payment) => {
    //     if (
    //         typeof payment.booking === 'object' &&
    //         payment.booking?.customer &&
    //         typeof payment.booking.customer === 'object' &&
    //         'fullName' in payment.booking.customer
    //     ) {
    //         return payment.booking.customer.fullName;
    //     }
    //     return 'N/A';
    // };

    // Function to get booking ID from payment object
    const getBookingId = (payment: Payment) => {
        if (typeof payment.booking === 'object' && payment.booking?._id) {
            return payment.booking?._id
        }
        return typeof payment.booking === 'string' ? payment.booking : 'N/A'
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Payment Management</h1>
                    <Button onClick={() => navigate('/payments/new')}>  {/* Navigate to new payment form */}
                        <Plus className="mr-2 h-4 w-4" /> Record Payment
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <CreditCard className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalPayments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {pendingPayments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">{pendingCount} pending transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {completedPayments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">{completedCount} successful transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                            <XCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {failedPayments.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">{failedCount} failed transaction</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search payments..."
                                className="w-full sm:w-[300px] pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            <Tabs defaultValue={filterStatus} onValueChange={setFilterStatus}>
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="failed">Failed</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payment Transactions</CardTitle>
                                <CardDescription>View and manage all payment transactions</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">Loading payments...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-10">
                                    <p className="text-destructive mb-4">{error}</p>
                                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground mb-4">No payments found. Try adding one.</p>
                                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                                        <Link to="/payments/new">
                                            <Plus className="mr-2 h-4 w-4" /> New Payment
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">
                                                <div className="flex items-center">
                                                    Payment ID
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead>Booking ID</TableHead>
                                            {/*<TableHead>Customer</TableHead>*/}
                                            <TableHead>
                                                <div className="flex items-center">
                                                    Date
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <div className="flex items-center justify-end">
                                                    Amount
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                    No payments found matching your search criteria
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPayments.map((payment) => (
                                                <TableRow key={payment._id}>
                                                    <TableCell className="font-medium">{payment._id}</TableCell>
                                                    <TableCell>
                                                        <Link to={`/bookings/${getBookingId(payment)}`} className="text-primary hover:underline">
                                                            {getBookingId(payment)}
                                                        </Link>
                                                    </TableCell>
                                                    {/*<TableCell>{getCustomerName(payment)}</TableCell>*/}
                                                    <TableCell>{new Date(payment.paymentDate ?? '').toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">KES {payment.amount.toLocaleString()}</TableCell>
                                                    <TableCell>{payment.method}</TableCell>
                                                    <TableCell>{payment.reference}</TableCell>
                                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                                <DropdownMenuItem>Print receipt</DropdownMenuItem>
                                                                {payment.status === "pending" && <DropdownMenuItem>Confirm payment</DropdownMenuItem>}
                                                                {payment.status === "failed" && <DropdownMenuItem>Retry payment</DropdownMenuItem>}
                                                                <DropdownMenuItem className="text-destructive">Void payment</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}