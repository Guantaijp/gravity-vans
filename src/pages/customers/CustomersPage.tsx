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
import { Link } from "react-router-dom"

export default function CustomersPage() {
    const customers = [
        {
            id: "C-001",
            name: "John Kamau",
            email: "john.kamau@example.com",
            phone: "+254 712 345 678",
            location: "Nairobi, Kenya",
            bookings: 3,
            totalSpent: "KES 75,000",
            lastBooking: "2023-04-20",
        },
        {
            id: "C-002",
            name: "Mary Wanjiku",
            email: "mary.wanjiku@example.com",
            phone: "+254 723 456 789",
            location: "Mombasa, Kenya",
            bookings: 2,
            totalSpent: "KES 42,000",
            lastBooking: "2023-04-22",
        },
        {
            id: "C-003",
            name: "David Ochieng",
            email: "david.ochieng@example.com",
            phone: "+254 734 567 890",
            location: "Kisumu, Kenya",
            bookings: 1,
            totalSpent: "KES 35,000",
            lastBooking: "2023-04-25",
        },
        {
            id: "C-004",
            name: "Sarah Njeri",
            email: "sarah.njeri@example.com",
            phone: "+254 745 678 901",
            location: "Nakuru, Kenya",
            bookings: 1,
            totalSpent: "KES 32,000",
            lastBooking: "2023-04-26",
        },
        {
            id: "C-005",
            name: "James Mwangi",
            email: "james.mwangi@example.com",
            phone: "+254 756 789 012",
            location: "Eldoret, Kenya",
            bookings: 2,
            totalSpent: "KES 58,000",
            lastBooking: "2023-04-15",
        },
        {
            id: "C-006",
            name: "Lucy Akinyi",
            email: "lucy.akinyi@example.com",
            phone: "+254 767 890 123",
            location: "Nairobi, Kenya",
            bookings: 1,
            totalSpent: "KES 28,000",
            lastBooking: "2023-04-16",
        },
        {
            id: "C-007",
            name: "Peter Njoroge",
            email: "peter.njoroge@example.com",
            phone: "+254 778 901 234",
            location: "Thika, Kenya",
            bookings: 1,
            totalSpent: "KES 40,000",
            lastBooking: "2023-04-18",
        },
        {
            id: "C-008",
            name: "Grace Wambui",
            email: "grace.wambui@example.com",
            phone: "+254 789 012 345",
            location: "Mombasa, Kenya",
            bookings: 1,
            totalSpent: "KES 35,000",
            lastBooking: "2023-04-19",
        },
    ]

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Customer Management</h1>
                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search customers..." className="w-full sm:w-[300px] pl-8" />
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
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-[#0a192f] text-white">
                                                        {customer.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.id}</p>
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
                                        <TableCell>{customer.bookings}</TableCell>
                                        <TableCell>{customer.totalSpent}</TableCell>
                                        <TableCell>{customer.lastBooking}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit customer</DropdownMenuItem>
                                                    <DropdownMenuItem>Booking history</DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/bookings/new">Create booking</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[#e31c39]">Delete customer</DropdownMenuItem>
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
