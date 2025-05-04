"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Car, Calendar, Users, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import RecentBookingsTable from "../../components/recent-bookings-table"
import VehicleStatusChart from "../../components/vehicle-status-chart"
import dashboardService, { type DashboardData } from "../../services/dashboard-service"

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate();
    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true)
                const data = await dashboardService.getDashboardData()
                setDashboardData(data)
                setError(null)
            } catch (err) {
                setError("Failed to load dashboard data")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()

        // Refresh data every 5 minutes
        const intervalId = setInterval(loadDashboardData, 5 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [])

    // Calculate vehicle status percentages
    const getStatusPercentage = (status: string) => {
        if (!dashboardData) return 0
        const count = dashboardData.vehicleStatus[status] || 0
        const total = Object.values(dashboardData.vehicleStatus).reduce((sum, val) => sum + val, 0)
        return total > 0 ? (count / total) * 100 : 0
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#e31c39]" />
                <p className="mt-4 text-lg">Loading dashboard data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertTriangle className="h-8 w-8 text-[#e31c39]" />
                <p className="mt-4 text-lg">{error}</p>
                <Button className="mt-4 bg-[#e31c39] hover:bg-[#e31c39]/90" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Car className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData?.counts.totalBookings || 0}</div>
                            <p className="text-xs text-muted-foreground">Fleet management</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData?.counts.activeBookings || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardService.calculateFleetUtilization(
                                    dashboardData?.counts.activeBookings || 0,
                                    dashboardData?.counts.totalVehicles || 1,
                                )}{" "}
                                fleet utilization
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData?.counts.totalCustomers || 0}</div>
                            <p className="text-xs text-muted-foreground">Customer database</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashboardService.formatCurrency(dashboardData?.revenue.totalRevenue || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardService.formatCurrency(dashboardData?.revenue.outstanding || 0)} outstanding
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Booking Overview</CardTitle>
                            <CardDescription>View booking trends for the last 4 weeks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VehicleStatusChart bookingOverview={dashboardData?.bookingOverview} />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Vehicle Status</CardTitle>
                            <CardDescription>Current status of your fleet</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">Available</span>
                                    </div>
                                    <span className="text-sm font-medium">{dashboardData?.vehicleStatus.available || 0}</span>
                                </div>
                                <Progress value={getStatusPercentage("available")} className="h-2 bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[#0a192f]" />
                                        <span className="text-sm font-medium">Rented</span>
                                    </div>
                                    <span className="text-sm font-medium">{dashboardData?.vehicleStatus.rented || 0}</span>
                                </div>
                                <Progress value={getStatusPercentage("rented")} className="h-2 bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-[#e31c39]" />
                                        <span className="text-sm font-medium">Maintenance</span>
                                    </div>
                                    <span className="text-sm font-medium">{dashboardData?.vehicleStatus.maintenance || 0}</span>
                                </div>
                                <Progress value={getStatusPercentage("maintenance")} className="h-2 bg-gray-200" />
                            </div>

                            <div className="mt-6 pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2">Commission Summary</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Total Revenue :</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.totalRevenue || 0)}
                                    </div>
                                    <div>Company Revenue:</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.companyRevenue || 0)}
                                    </div>
                                    <div>Outstanding Revenue:</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.outstanding || 0)}
                                    </div>
                                    <div>Paid Amount:</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.totalPaid || 0)}
                                    </div>
                                    <div>Owner Commissions:</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.ownerCommissions || 0)}
                                    </div>
                                    <div>Referral Commission:</div>
                                    <div className="text-right font-medium">
                                        {dashboardService.formatCurrency(dashboardData?.revenue.referrerCommissions || 0)}
                                    </div>


                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-4">
                    <Tabs defaultValue="recent">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
                                {/*<TabsTrigger value="upcoming">Upcoming Returns</TabsTrigger>*/}
                            </TabsList>
                            <Button
                                size="sm"
                                className="bg-[#e31c39] hover:bg-[#e31c39]/90"
                                onClick={() => navigate("/bookings/new")}
                            >
                                New Booking
                            </Button>
                        </div>
                        <TabsContent value="recent" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Bookings</CardTitle>
                                    <CardDescription>View and manage your recent bookings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentBookingsTable bookings={dashboardData?.recentBookings} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        {/*<TabsContent value="upcoming" className="mt-4">*/}
                        {/*    <Card>*/}
                        {/*        <CardHeader>*/}
                        {/*            <CardTitle>Upcoming Returns</CardTitle>*/}
                        {/*            <CardDescription>Vehicles scheduled to be returned soon</CardDescription>*/}
                        {/*        </CardHeader>*/}
                        {/*        <CardContent>*/}
                        {/*            <RecentBookingsTable isReturns={true} returns={dashboardData?.upcomingReturns} />*/}
                        {/*        </CardContent>*/}
                        {/*    </Card>*/}
                        {/*</TabsContent>*/}
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
