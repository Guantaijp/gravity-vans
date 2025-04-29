import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Car, Calendar, Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import RecentBookingsTable from "../components/recent-bookings-table"
import VehicleStatusChart from "../components/vehicle-status-chart"

export default function Dashboard() {
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
                            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                            <Car className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">+2 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">18</div>
                            <p className="text-xs text-muted-foreground">+4 from last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">132</div>
                            <p className="text-xs text-muted-foreground">+12 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Revenue (KES)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-[#e31c39]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES 245,000</div>
                            <p className="text-xs text-muted-foreground">+18% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Booking Overview</CardTitle>
                            <CardDescription>View booking trends for the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VehicleStatusChart />
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
                                    <span className="text-sm font-medium">14</span>
                                </div>
                                <Progress value={58} className="h-2 bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[#0a192f]" />
                                        <span className="text-sm font-medium">Booked</span>
                                    </div>
                                    <span className="text-sm font-medium">8</span>
                                </div>
                                <Progress value={33} className="h-2 bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-[#e31c39]" />
                                        <span className="text-sm font-medium">Maintenance</span>
                                    </div>
                                    <span className="text-sm font-medium">2</span>
                                </div>
                                <Progress value={9} className="h-2 bg-gray-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-4">
                    <Tabs defaultValue="recent">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
                                <TabsTrigger value="upcoming">Upcoming Returns</TabsTrigger>
                            </TabsList>
                            <Button size="sm" className="bg-[#e31c39] hover:bg-[#e31c39]/90">
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
                                    <RecentBookingsTable />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="upcoming" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Returns</CardTitle>
                                    <CardDescription>Vehicles scheduled to be returned soon</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentBookingsTable isReturns={true} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
