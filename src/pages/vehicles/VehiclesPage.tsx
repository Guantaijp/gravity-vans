import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Search, Plus, Filter, Calendar, Users, Car, Settings, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

export default function VehiclesPage() {
    const vehicles = [
        {
            id: "V-001",
            name: "Toyota Hiace",
            type: "Van",
            capacity: "14 Seater",
            licensePlate: "KCB 123A",
            status: "Available",
            dailyRate: "KES 8,000",
            image: "/placeholder.svg?height=200&width=300",
        },
        {
            id: "V-002",
            name: "Nissan Urvan",
            type: "Van",
            capacity: "16 Seater",
            licensePlate: "KDD 456B",
            status: "Booked",
            dailyRate: "KES 7,000",
            image: "/placeholder.svg?height=200&width=300",
        },
        {
            id: "V-003",
            name: "Toyota Coaster",
            type: "Minibus",
            capacity: "29 Seater",
            licensePlate: "KCA 789C",
            status: "Maintenance",
            dailyRate: "KES 12,000",
            image: "/placeholder.svg?height=200&width=300",
        },
        {
            id: "V-004",
            name: "Mitsubishi Rosa",
            type: "Minibus",
            capacity: "25 Seater",
            licensePlate: "KDB 321D",
            status: "Available",
            dailyRate: "KES 10,000",
            image: "/placeholder.svg?height=200&width=300",
        },
        {
            id: "V-005",
            name: "Toyota Land Cruiser",
            type: "SUV",
            capacity: "7 Seater",
            licensePlate: "KCE 654E",
            status: "Available",
            dailyRate: "KES 15,000",
            image: "/placeholder.svg?height=200&width=300",
        },
        {
            id: "V-006",
            name: "Nissan Patrol",
            type: "SUV",
            capacity: "7 Seater",
            licensePlate: "KDF 987F",
            status: "Booked",
            dailyRate: "KES 14,000",
            image: "/placeholder.svg?height=200&width=300",
        },
    ]

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Vehicle Inventory</h1>
                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                        <Link to="/vehicles/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search vehicles..." className="w-full sm:w-[300px] pl-8" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Tabs defaultValue="all">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="available">Available</TabsTrigger>
                                <TabsTrigger value="booked">Booked</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="overflow-hidden">
                            <div className="relative">
                                <img
                                    src={vehicle.image || "/placeholder.svg"}
                                    alt={vehicle.name}
                                    className="w-full h-48 object-cover"
                                />
                                <Badge
                                    className={`absolute top-2 right-2 ${
                                        vehicle.status === "Available"
                                            ? "bg-green-500"
                                            : vehicle.status === "Booked"
                                                ? "bg-[#0a192f]"
                                                : "bg-[#e31c39]"
                                    }`}
                                >
                                    {vehicle.status}
                                </Badge>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{vehicle.name}</h3>
                                        <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link to={`/vehicles/${vehicle.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                                            <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[#e31c39]">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <div className="flex items-center">
                                        <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm">{vehicle.licensePlate}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm">{vehicle.capacity}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm">{vehicle.dailyRate}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm">Diesel</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <Button variant="outline" size="sm" className="w-[48%]" asChild>
                                        <Link to={`/vehicles/${vehicle.id}`}>View Details</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="w-[48%] bg-[#e31c39] hover:bg-[#e31c39]/90"
                                        disabled={vehicle.status !== "Available"}
                                        asChild
                                    >
                                        <Link to="/bookings/new">Book Now</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
