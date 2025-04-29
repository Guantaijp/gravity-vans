import { useState } from "react"
import { Link } from "react-router-dom"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog"
import { Calendar } from "../../components/ui/calendar"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { cn } from "../../lib/utils"

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [paymentDate, setPaymentDate] = useState<Date>()
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)

    // Mock data for payments
    const payments = [
        {
            id: "P-2023-001",
            bookingId: "B-2023-001",
            customer: "John Kamau",
            date: "2023-04-15",
            amount: 5000,
            method: "M-Pesa",
            reference: "MPESA123456",
            status: "Completed",
        },
        {
            id: "P-2023-002",
            bookingId: "B-2023-002",
            customer: "Mary Wanjiku",
            date: "2023-04-16",
            amount: 10000,
            method: "Bank Transfer",
            reference: "BT789012",
            status: "Completed",
        },
        {
            id: "P-2023-003",
            bookingId: "B-2023-003",
            customer: "David Ochieng",
            date: "2023-04-18",
            amount: 15000,
            method: "Cash",
            reference: "CASH345678",
            status: "Completed",
        },
        {
            id: "P-2023-004",
            bookingId: "B-2023-004",
            customer: "Sarah Njeri",
            date: "2023-04-19",
            amount: 8000,
            method: "M-Pesa",
            reference: "MPESA234567",
            status: "Pending",
        },
        {
            id: "P-2023-005",
            bookingId: "B-2023-005",
            customer: "James Mwangi",
            date: "2023-04-20",
            amount: 12000,
            method: "Credit Card",
            reference: "CC567890",
            status: "Completed",
        },
        {
            id: "P-2023-006",
            bookingId: "B-2023-006",
            customer: "Lucy Akinyi",
            date: "2023-04-21",
            amount: 7000,
            method: "M-Pesa",
            reference: "MPESA345678",
            status: "Failed",
        },
        {
            id: "P-2023-007",
            bookingId: "B-2023-007",
            customer: "Peter Njoroge",
            date: "2023-04-22",
            amount: 20000,
            method: "Bank Transfer",
            reference: "BT456789",
            status: "Pending",
        },
        {
            id: "P-2023-008",
            bookingId: "B-2023-008",
            customer: "Grace Wambui",
            date: "2023-04-23",
            amount: 15000,
            method: "Cash",
            reference: "CASH678901",
            status: "Completed",
        },
    ]

    // Filter payments based on search term and status filter
    const filteredPayments = payments.filter((payment) => {
        const matchesSearch =
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.reference.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === "all" || payment.status.toLowerCase() === filterStatus.toLowerCase()

        return matchesSearch && matchesStatus
    })

    // Calculate summary statistics
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const completedPayments = payments
        .filter((payment) => payment.status === "Completed")
        .reduce((sum, payment) => sum + payment.amount, 0)
    const pendingPayments = payments
        .filter((payment) => payment.status === "Pending")
        .reduce((sum, payment) => sum + payment.amount, 0)
    const failedPayments = payments
        .filter((payment) => payment.status === "Failed")
        .reduce((sum, payment) => sum + payment.amount, 0)

    // Get counts for each status
    const completedCount = payments.filter((payment) => payment.status === "Completed").length
    const pendingCount = payments.filter((payment) => payment.status === "Pending").length
    const failedCount = payments.filter((payment) => payment.status === "Failed").length

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

    // @ts-ignore
    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Payment Management</h1>
                    <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Record Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Record New Payment</DialogTitle>
                                <DialogDescription>Enter the details of the payment received from a customer.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="booking" className="text-right">
                                        Booking
                                    </Label>
                                    <div className="col-span-3">
                                        <Select>
                                            <SelectTrigger id="booking">
                                                <SelectValue placeholder="Select booking" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="B-2023-001">B-2023-001 - John Kamau</SelectItem>
                                                <SelectItem value="B-2023-002">B-2023-002 - Mary Wanjiku</SelectItem>
                                                <SelectItem value="B-2023-003">B-2023-003 - David Ochieng</SelectItem>
                                                <SelectItem value="B-2023-004">B-2023-004 - Sarah Njeri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">
                                        Amount (KES)
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        className="col-span-3"
                                        defaultValue="5000"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="method" className="text-right">
                                        Payment Method
                                    </Label>
                                    <div className="col-span-3">
                                        <Select defaultValue="mpesa">
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
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="reference" className="text-right">
                                        Reference
                                    </Label>
                                    <Input
                                        id="reference"
                                        placeholder="Transaction reference"
                                        className="col-span-3"
                                        defaultValue="MPESA123456"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">
                                        Payment Date
                                    </Label>
                                    <div className="col-span-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !paymentDate && "text-muted-foreground",
                                                    )}
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={paymentDate}
                                                    onSelect={setPaymentDate}
                                                    initialFocus
                                                    disabled={(date: any) => date > new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">
                                        Status
                                    </Label>
                                    <div className="col-span-3">
                                        <Select defaultValue="completed">
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => setIsRecordPaymentOpen(false)}>Save Payment</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                        <TableHead>Customer</TableHead>
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
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{payment.id}</TableCell>
                                                <TableCell>
                                                    <Link to={`/bookings/${payment.bookingId}`} className="text-primary hover:underline">
                                                        {payment.bookingId}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{payment.customer}</TableCell>
                                                <TableCell>{payment.date}</TableCell>
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
                                                            {payment.status === "Pending" && <DropdownMenuItem>Confirm payment</DropdownMenuItem>}
                                                            {payment.status === "Failed" && <DropdownMenuItem>Retry payment</DropdownMenuItem>}
                                                            <DropdownMenuItem className="text-destructive">Void payment</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
