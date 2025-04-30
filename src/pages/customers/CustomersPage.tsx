"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Search, Plus, Filter, MoreHorizontal, Phone, Mail, MapPin } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import CustomerService, { type Customer } from "../../services/customer-service"
import { useApi } from "../../hooks/use-api"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const { execute: fetchCustomers, isLoading, error } = useApi(CustomerService.getAll)
    const { execute: deleteCustomer } = useApi((id?: string) => {
        if (!id) return Promise.reject(new Error("Customer ID is required"))
        return CustomerService.delete(id)
    })

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        try {
            const data = await fetchCustomers()
            setCustomers(data || [])
            setFilteredCustomers(data || [])
        } catch (err) {
            console.error("Error loading customers:", err)
        }
    }

    useEffect(() => {
        filterCustomers(searchQuery)
    }, [customers, searchQuery])

    const filterCustomers = (query: string) => {
        if (!query) {
            setFilteredCustomers(customers)
            return
        }

        const lowercaseQuery = query.toLowerCase()
        const filtered = customers.filter(
            (customer) =>
                customer.fullName.toLowerCase().includes(lowercaseQuery) ||
                customer.email.toLowerCase().includes(lowercaseQuery) ||
                customer.phone.includes(query) ||
                customer.location.toLowerCase().includes(lowercaseQuery)
        )

        setFilteredCustomers(filtered)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleDeleteCustomer = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await deleteCustomer(id)
                setCustomers(customers.filter((customer) => customer._id !== id))
            } catch (err) {
                console.error("Error deleting customer:", err)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">Failed to load customers. Please try again.</p>
                <Button onClick={loadCustomers} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Customer Management</h1>
                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                        <Link to="/customers/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
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
                            placeholder="Search customers..."
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
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Customers</CardTitle>
                        <CardDescription>Manage your customer database and view booking history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground mb-4">No customers found. Try adding one.</p>
                                <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                                    <Link to="/customers/new">
                                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                                    </Link>
                                </Button>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No customers found. Try adjusting your search.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Bookings</TableHead>
                                        <TableHead>Total Spent</TableHead>
                                        <TableHead>Last Booking</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.map((customer) => (
                                        <TableRow key={customer._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-[#0a192f] text-white">
                                                            {customer.fullName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{customer.fullName}</p>
                                                        <p className="text-xs text-muted-foreground">{customer._id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                                                        {customer.email}
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                                                    {customer.location}
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.bookings || 0}</TableCell>
                                            <TableCell>
                                                {customer.totalSpent ? `KES ${customer.totalSpent.toLocaleString()}` : "KES 0"}
                                            </TableCell>
                                            <TableCell>{customer.lastBooking || "N/A"}</TableCell>
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
                                                            <Link to={`/customers/${customer._id}`}>View profile</Link>
                                                        </DropdownMenuItem>
                                                        {/*<DropdownMenuItem asChild>*/}
                                                        {/*    <Link to={`/customers/${customer._id}/edit`}>Edit customer</Link>*/}
                                                        {/*</DropdownMenuItem>*/}
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/bookings?customerId=${customer._id}`}>Booking history</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/bookings/new?customerId=${customer._id}`}>Create booking</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-[#e31c39]"
                                                            onClick={() => handleDeleteCustomer(customer._id)}
                                                        >
                                                            Delete customer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}