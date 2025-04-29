import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

interface RecentBookingsTableProps {
    isReturns?: boolean
}

export default function RecentBookingsTable({ isReturns = false }: RecentBookingsTableProps) {
    const bookings = isReturns
        ? [
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
                status: "Active",
                amount: "KES 35,000",
            },
            {
                id: "B-2023-004",
                customer: "Sarah Njeri",
                vehicle: "Mitsubishi Rosa",
                startDate: "2023-04-26",
                endDate: "2023-05-02",
                status: "Active",
                amount: "KES 32,000",
            },
        ]
        : [
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
                status: "Active",
                amount: "KES 28,000",
            },
            {
                id: "B-2023-007",
                customer: "Peter Njoroge",
                vehicle: "Toyota Coaster",
                startDate: "2023-04-18",
                endDate: "2023-04-28",
                status: "Pending",
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
        ]

    return (
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
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.customer}</TableCell>
                        <TableCell>{booking.vehicle}</TableCell>
                        <TableCell>{booking.startDate}</TableCell>
                        <TableCell>{booking.endDate}</TableCell>
                        <TableCell>
                            <Badge
                                variant="outline"
                                className={
                                    booking.status === "Active"
                                        ? "border-green-500 text-green-500"
                                        : booking.status === "Pending"
                                            ? "border-yellow-500 text-yellow-500"
                                            : booking.status === "Completed"
                                                ? "border-blue-500 text-blue-500"
                                                : "border-red-500 text-red-500"
                                }
                            >
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
                                        <Link to={`/bookings/${booking.id}`} className="flex items-center">
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>View details</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/bookings/${booking.id}/edit`} className="flex items-center">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit booking</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Cancel booking</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
