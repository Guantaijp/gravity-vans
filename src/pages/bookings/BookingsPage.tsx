import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

export default function BookingsPage() {
    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Booking Management</h1>
                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                        <Link to="/bookings/new">
                            <Plus className="mr-2 h-4 w-4" /> New Booking
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search bookings..." className="w-full sm:w-[300px] pl-8" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Tabs defaultValue="all">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                        <CardDescription>Manage all your vehicle bookings in one place</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    {
                                        id: "B-2023-001",
                                        customer: "John Kamau",
                                        vehicle: "Toyota Hiace",
                                        startDate: "2023-04-20",
                                        endDate: "2023-04-30",
                                        status: "Active",
                                        amount: "KES 25,000",
                                    },
                                    {
                                        id: "B-2023-002",
                                        customer: "Mary Wanjiku",
                                        vehicle: "Nissan Urvan",
                                        startDate: "2023-04-22",
                                        endDate: "2023-04-29",
                                        status: "Active",
                                        amount: "KES 21,000",
                                    },
                                    {
                                        id: "B-2023-003",
                                        customer: "David Ochieng",
                                        vehicle: "Toyota Coaster",
                                        startDate: "2023-04-25",
                                        endDate: "2023-05-01",
                                        status: "Pending",
                                        amount: "KES 35,000",
                                    },
                                    {
                                        id: "B-2023-004",
                                        customer: "Sarah Njeri",
                                        vehicle: "Mitsubishi Rosa",
                                        startDate: "2023-04-26",
                                        endDate: "2023-05-02",
                                        status: "Pending",
                                        amount: "KES 32,000",
                                    },
                                    {
                                        id: "B-2023-005",
                                        customer: "James Mwangi",
                                        vehicle: "Toyota Hiace",
                                        startDate: "2023-04-15",
                                        endDate: "2023-04-25",
                                        status: "Completed",
                                        amount: "KES 30,000",
                                    },
                                    {
                                        id: "B-2023-006",
                                        customer: "Lucy Akinyi",
                                        vehicle: "Nissan Urvan",
                                        startDate: "2023-04-16",
                                        endDate: "2023-04-26",
                                        status: "Completed",
                                        amount: "KES 28,000",
                                    },
                                    {
                                        id: "B-2023-007",
                                        customer: "Peter Njoroge",
                                        vehicle: "Toyota Coaster",
                                        startDate: "2023-04-18",
                                        endDate: "2023-04-28",
                                        status: "Cancelled",
                                        amount: "KES 40,000",
                                    },
                                    {
                                        id: "B-2023-008",
                                        customer: "Grace Wambui",
                                        vehicle: "Mitsubishi Rosa",
                                        startDate: "2023-04-19",
                                        endDate: "2023-04-29",
                                        status: "Cancelled",
                                        amount: "KES 35,000",
                                    },
                                ].map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.id}</TableCell>
                                        <TableCell>{booking.customer}</TableCell>
                                        <TableCell>{booking.vehicle}</TableCell>
                                        <TableCell>{booking.startDate}</TableCell>
                                        <TableCell>{booking.endDate}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    booking.status === "Active"
                                                        ? "bg-green-500"
                                                        : booking.status === "Pending"
                                                            ? "bg-yellow-500"
                                                            : booking.status === "Completed"
                                                                ? "bg-[#0a192f]"
                                                                : "bg-[#e31c39]"
                                                }
                                            >
                                                {booking.status === "Active" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                {booking.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                                                {booking.status === "Completed" && <Calendar className="mr-1 h-3 w-3" />}
                                                {booking.status === "Cancelled" && <XCircle className="mr-1 h-3 w-3" />}
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{booking.amount}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/bookings/${booking.id}`}>View details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/bookings/${booking.id}/edit`}>Edit booking</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/bookings/${booking.id}/invoice`}>Print invoice</Link>
                                                    </DropdownMenuItem>
                                                    {booking.status === "Pending" && <DropdownMenuItem>Confirm booking</DropdownMenuItem>}
                                                    {(booking.status === "Pending" || booking.status === "Active") && (
                                                        <DropdownMenuItem className="text-[#e31c39]">Cancel booking</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
