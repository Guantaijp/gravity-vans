"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
import BookingService, { type Booking } from "../../services/booking-service"
import { useApi } from "../../hooks/use-api"

export default function BookingsPage() {
    const [searchParams] = useSearchParams()
    const customerId = searchParams.get("customerId")
    const vehicleId = searchParams.get("vehicleId")

    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")

    const { execute: fetchBookings, isLoading, error } = useApi(BookingService.getAll)
    const { execute: fetchBookingsByCustomer } = useApi((customerId?: string) => {
        if (!customerId) return Promise.reject(new Error("Customer ID is required"))
        return BookingService.getBookingsByCustomer(customerId)
    })
    const { execute: fetchBookingsByVehicle } = useApi((vehicleId?: string) => {
        if (!vehicleId) return Promise.reject(new Error("Vehicle ID is required"))
        return BookingService.getBookingsByVehicle(vehicleId)
    })

    const { execute: updateBookingStatus } = useApi((params?: { id: string; status: Booking["status"] }) => {
        if (!params) return Promise.reject(new Error("Missing params"))
        return BookingService.updateStatus(params.id, params.status)
    })
    const { execute: deleteBooking } = useApi((id?: string) => {
        if (!id) return Promise.reject(new Error("Booking ID is required"))
        return BookingService.delete(id)
    })

    useEffect(() => {
        loadBookings()
    }, [customerId, vehicleId])

    const loadBookings = async () => {
        try {
            let data: Booking[]

            if (customerId) {
                data = await fetchBookingsByCustomer(customerId)
            } else if (vehicleId) {
                data = await fetchBookingsByVehicle(vehicleId)
            } else {
                data = await fetchBookings()
            }

            setBookings(data || [])
            setFilteredBookings(data || [])
        } catch (err) {
            console.error("Error loading bookings:", err)
            setBookings([])
            setFilteredBookings([])
        }
    }

    useEffect(() => {
        filterBookings(activeFilter, searchQuery)
    }, [bookings, activeFilter, searchQuery])

    const filterBookings = (filter: string, query: string) => {
        let filtered = Array.isArray(bookings) ? [...bookings] : []

        // Apply status filter
        if (filter !== "all") {
            filtered = filtered.filter((booking) => booking.status.toLowerCase() === filter.toLowerCase())
        }

        // Apply search query
        if (query) {
            const lowercaseQuery = query.toLowerCase()
            filtered = filtered.filter((booking) => {
                const customerName =
                    typeof booking.customer === "string"
                        ? ""
                        : (booking.customer?.fullName || booking.customer?.fullName || "").toLowerCase()
                const vehicleName = typeof booking.vehicle === "string" ? "" : (booking.vehicle?.name || "").toLowerCase()

                return (
                    booking._id.toLowerCase().includes(lowercaseQuery) ||
                    customerName.includes(lowercaseQuery) ||
                    vehicleName.includes(lowercaseQuery)
                )
            })
        }

        setFilteredBookings(filtered)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleFilterChange = (value: string) => {
        setActiveFilter(value)
    }

    const handleStatusChange = async (id: string, status: Booking["status"]) => {
        try {
            const updatedBooking = await updateBookingStatus({ id, status })
            setBookings(bookings.map((booking) => (booking._id === id ? updatedBooking : booking)))
        } catch (err) {
            console.error("Error updating booking status:", err)
        }
    }

    const handleDeleteBooking = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                await deleteBooking(id)
                setBookings(bookings.filter((booking) => booking._id !== id))
            } catch (err) {
                console.error("Error deleting booking:", err)
            }
        }
    }

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
                        </div>
                    </TableCell>
                </TableRow>
            )
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                        <p className="text-red-500">Failed to load bookings. Please try again.</p>
                        <Button onClick={loadBookings} className="mt-4">
                            Try Again
                        </Button>
                    </TableCell>
                </TableRow>
            )
        }

        if (bookings && bookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                        <p className="text-muted-foreground mb-4">No bookings found. Try adding one.</p>
                        <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                            <Link to="/bookings/new">
                                <Plus className="mr-2 h-4 w-4" /> New Booking
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
            )
        }

        if (filteredBookings && filteredBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                        <p className="text-muted-foreground">No bookings found. Try adjusting your search or filters.</p>
                    </TableCell>
                </TableRow>
            )
        }

        return (Array.isArray(filteredBookings) ? filteredBookings : []).map((booking) => (
            <TableRow key={booking._id}>
                <TableCell className="font-medium">{booking.bookingId}</TableCell>
                <TableCell>
                    {typeof booking.customer === "string"
                        ? booking.customer
                        : booking.customer?.fullName || booking.customer?.fullName || ""}
                </TableCell>
                <TableCell>
                    {!booking.vehicle ? "Out Sourced" :
                        typeof booking.vehicle === "string" ? booking.vehicle : booking.vehicle?.name}
                </TableCell>
                <TableCell>{new Date(booking.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(booking.endDate).toLocaleDateString()}</TableCell>
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
                <TableCell>KES {booking.totalAmount.toLocaleString()}</TableCell>
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
                                <Link to={`/bookings/${booking._id}`}>View details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/bookings/${booking._id}/edit`}>Edit booking</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/bookings/${booking._id}/invoice`}>Print invoice</Link>
                            </DropdownMenuItem>
                            {booking.status === "Pending" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(booking._id, "Active")}>
                                    Confirm booking
                                </DropdownMenuItem>
                            )}
                            {(booking.status === "Pending" || booking.status === "Active") && (
                                <DropdownMenuItem
                                    className="text-[#e31c39]"
                                    onClick={() => handleStatusChange(booking._id, "Cancelled")}
                                >
                                    Cancel booking
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="text-[#e31c39]"
                                onClick={() => handleDeleteBooking(booking._id)}
                            >
                                Delete booking
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ))
    }

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
                        <Input
                            type="search"
                            placeholder="Search bookings..."
                            className="w-full sm:w-[300px] pl-8"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Tabs defaultValue={activeFilter} onValueChange={handleFilterChange}>
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
                                {renderTableContent()}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}