import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import dashboardService from "..//services/dashboard-service"
import type { DashboardData } from "../services/dashboard-service.ts"

interface RecentBookingsTableProps {
    isReturns?: boolean
    bookings?: DashboardData["recentBookings"]
    returns?: DashboardData["upcomingReturns"]
}

export default function RecentBookingsTable({
                                                isReturns = false,
                                                bookings = [],
                                                returns = [],
                                            }: RecentBookingsTableProps) {
    // Helper function to display vehicle or "Out Sourced" if unknown
    const displayVehicle = (vehicle: string | null | undefined) => {
        const normalized = vehicle?.trim().toLowerCase();
        return !normalized || normalized === "unknown" ? "Out Sourced" : vehicle;
    };


    if (isReturns) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Days Left</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {returns.length > 0 ? (
                        returns.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.customer}</TableCell>
                                <TableCell>{displayVehicle(booking.vehicle)}</TableCell>
                                <TableCell>{dashboardService.formatDate(booking.returnDate)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={dashboardService.getDaysLeftColor(booking.daysLeft)}>
                                        {booking.daysLeft} {booking.daysLeft === 1 ? "day" : "days"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No upcoming returns found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.customer}</TableCell>
                            <TableCell>{displayVehicle(booking.vehicle)}</TableCell>
                            <TableCell>
                                {dashboardService.formatDate(booking.startDate)} - {dashboardService.formatDate(booking.endDate)}
                            </TableCell>
                            <TableCell>{dashboardService.formatCurrency(booking.amount)}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={dashboardService.getStatusColor(booking.status)}>
                                    {booking.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No recent bookings found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}