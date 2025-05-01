"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Search, Plus, Filter, Users, Car,  MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import VehicleService, { type Vehicle } from "../../services/vehicle-service"
import { useApi } from "../../hooks/use-api"

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")

    const { execute: fetchVehicles, isLoading, error } = useApi(VehicleService.getAll)
    const { execute: deleteVehicle } = useApi((id?: string) => {
        if (!id) return Promise.reject(new Error('ID is required'));
        return VehicleService.delete(id);
    });

    useEffect(() => {
        loadVehicles()
    }, [])

    const loadVehicles = async () => {
        try {
            const data = await fetchVehicles()
            if (Array.isArray(data)) {
                setVehicles(data)
                setFilteredVehicles(data)
            } else {
                setVehicles([])
            }
        } catch (err) {
            console.error("Error loading vehicles:", err)
            setVehicles([]) // fallback to prevent future crashes
        }
    }
    useEffect(() => {
        if (!Array.isArray(vehicles)) return
        filterVehicles(activeFilter, searchQuery)
    }, [vehicles, activeFilter, searchQuery])

    const filterVehicles = (filter: string, query: string) => {
        let filtered = [...vehicles]

        // Apply status filter
        if (filter !== "all") {
            filtered = filtered.filter((vehicle) => vehicle.status.toLowerCase() === filter.toLowerCase())
        }

        // Apply search query
        if (query) {
            const lowercaseQuery = query.toLowerCase()
            filtered = filtered.filter(
                (vehicle) =>
                    vehicle.name.toLowerCase().includes(lowercaseQuery) ||
                    vehicle.licensePlate.toLowerCase().includes(lowercaseQuery) ||
                    vehicle.make.toLowerCase().includes(lowercaseQuery) ||
                    vehicle.model.toLowerCase().includes(lowercaseQuery),
            )
        }

        setFilteredVehicles(filtered)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleFilterChange = (value: string) => {
        setActiveFilter(value)
    }

    const handleDeleteVehicle = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await deleteVehicle(id)
                // Remove the deleted vehicle from the state
                setVehicles(vehicles.filter((vehicle) => vehicle._id !== id))
            } catch (err) {
                console.error("Error deleting vehicle:", err)
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
                <p className="text-red-500">Failed to load vehicles. Please try again.</p>
                <Button onClick={loadVehicles} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

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
                        <Input
                            type="search"
                            placeholder="Search vehicles..."
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
                                <TabsTrigger value="available">Available</TabsTrigger>
                                <TabsTrigger value="booked">Booked</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {vehicles.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">No vehicles found. Try adding one.</p>
                        <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90" asChild>
                            <Link to="/vehicles/new">
                                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                            </Link>
                        </Button>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No vehicles found. Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredVehicles?.map((vehicle) => (
                            <Card key={vehicle._id} className="overflow-hidden">
                                <div className="relative">
                                    <img
                                        src={vehicle.imageUrl || "/placeholder.svg?height=200&width=300"}
                                        alt={vehicle.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <Badge
                                        className={`absolute top-2 right-2 ${
                                            vehicle.status === "available"
                                                ? "bg-green-500"
                                                : vehicle.status === "booked"
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
                                                    <Link to={`/vehicles/${vehicle._id}`}>View Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/vehicles/${vehicle._id}/edit`}>Edit Vehicle</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                                                <DropdownMenuItem className="text-[#e31c39]" onClick={() => handleDeleteVehicle(vehicle._id)}>
                                                    Delete
                                                </DropdownMenuItem>
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
                                            <span className="text-sm">{vehicle.capacity} Seater</span>
                                        </div>

                                    </div>

                                    <div className="mt-4 flex justify-between">
                                        <Button variant="outline" size="sm" className="w-[48%]" asChild>
                                            <Link to={`/vehicles/${vehicle._id}`}>View Details</Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="w-[48%] bg-[#e31c39] hover:bg-[#e31c39]/90"
                                            disabled={vehicle.status !== "available"}
                                            asChild
                                        >
                                            <Link to={`/bookings/new?vehicleId=${vehicle._id}`}>Book Now</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
