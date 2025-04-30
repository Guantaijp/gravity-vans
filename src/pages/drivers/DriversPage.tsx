"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Search, Plus, Filter, MoreHorizontal, Phone } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import DriverService, { type Driver } from "../../services/driver-service"
import { useApi } from "../../hooks/use-api"

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")

    const { execute: fetchDrivers, isLoading, error } = useApi(DriverService.getAll)
    const { execute: updateDriverStatus } = useApi(
        (params?: { id: string; status: Driver["status"] }) => {
            if (!params) return Promise.reject(new Error("Missing params"))
            return DriverService.updateStatus(params.id, params.status)
        }
    )
    const { execute: deleteDriver } = useApi((id?: string) => {
        if (!id) return Promise.reject(new Error("Driver ID is required"))
        return DriverService.delete(id)
    })

    useEffect(() => {
        loadDrivers()
    }, [])

    const loadDrivers = async () => {
        try {
            const data = await fetchDrivers()
            setDrivers(data || [])
            setFilteredDrivers(data || [])
        } catch (err) {
            console.error("Error loading drivers:", err)
        }
    }

    useEffect(() => {
        filterDrivers(activeFilter, searchQuery)
    }, [drivers, activeFilter, searchQuery])

    const filterDrivers = (filter: string, query: string) => {
        let filtered = [...drivers]

        // Apply status filter
        if (filter !== "all") {
            filtered = filtered.filter((driver) => driver.status === filter)
        }

        // Apply search query
        if (query) {
            const lowercaseQuery = query.toLowerCase()
            filtered = filtered.filter(
                (driver) =>
                    driver.name.toLowerCase().includes(lowercaseQuery) ||
                    driver.phoneNumber.includes(query) ||
                    driver.idNumber.includes(query) ||
                    driver.licenseNumber.toLowerCase().includes(lowercaseQuery)
            )
        }

        setFilteredDrivers(filtered)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleFilterChange = (value: string) => {
        setActiveFilter(value)
    }

    const handleStatusChange = async (id: string, status: Driver["status"]) => {
        try {
            const response = await updateDriverStatus({ id, status });
            const updatedDriver = response.driver; // Extract the driver object from the response

            // Update the state with the updated driver
            setDrivers(drivers.map((driver) => (driver._id === id ? updatedDriver : driver)));
        } catch (err) {
            console.error("Error updating driver status:", err);
        }
    };

    const handleDeleteDriver = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this driver?")) {
            try {
                await deleteDriver(id)
                setDrivers(drivers.filter((driver) => driver._id !== id))
            } catch (err) {
                console.error("Error deleting driver:", err)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-500"
            case "inactive":
                return "bg-gray-500"
            case "on-leave":
                return "bg-yellow-500"
            case "suspended":
                return "bg-[#e31c39]"
            default:
                return "bg-gray-500"
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
                <p className="text-red-500">Failed to load drivers. Please try again.</p>
                <Button onClick={loadDrivers} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">Driver Management</h1>
                    <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                        <Link to="/drivers/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Driver
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
                            placeholder="Search drivers..."
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
                                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                                <TabsTrigger value="on-leave">On Leave</TabsTrigger>
                                <TabsTrigger value="suspended">Suspended</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Drivers</CardTitle>
                        <CardDescription>Manage your driver database and view assignment history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {drivers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground mb-4">No drivers found. Try adding one.</p>
                                <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                                    <Link to="/drivers/new">
                                        <Plus className="mr-2 h-4 w-4" /> Add Driver
                                    </Link>
                                </Button>
                            </div>
                        ) : filteredDrivers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No drivers found. Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>ID Number</TableHead>
                                        <TableHead>License Number</TableHead>
                                        <TableHead>PSV Number</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Hire Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDrivers.map((driver) => (
                                        <TableRow key={driver._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-[#0a192f] text-white">
                                                            {driver.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{driver.name}</p>
                                                        <p className="text-xs text-muted-foreground">{driver._id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                                                    {driver.phoneNumber}
                                                </div>
                                            </TableCell>
                                            <TableCell>{driver.idNumber}</TableCell>
                                            <TableCell>{driver.licenseNumber}</TableCell>
                                            <TableCell>{driver.psvNumber}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(driver.status)}>
                                                    {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(driver.hireDate).toLocaleDateString()}</TableCell>
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
                                                            <Link to={`/drivers/${driver._id}`}>View profile</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/drivers/${driver._id}/edit`}>Edit driver</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/bookings?driverId=${driver._id}`}>Assignment history</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(driver._id, "active")}>
                                                            Set as Active
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(driver._id, "inactive")}>
                                                            Set as Inactive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(driver._id, "on-leave")}>
                                                            Set as On Leave
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(driver._id, "suspended")}>
                                                            Suspend Driver
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-[#e31c39]" onClick={() => handleDeleteDriver(driver._id)}>
                                                            Delete driver
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