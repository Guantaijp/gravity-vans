import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { ChevronLeft, Upload } from "lucide-react"

export default function NewVehiclePage() {
    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/vehicles" className="mr-4">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Vehicle</h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Information</CardTitle>
                            <CardDescription>Enter the details for the new vehicle</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="make">Make</Label>
                                    <Input id="make" placeholder="e.g. Toyota" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input id="model" placeholder="e.g. Hiace" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" placeholder="e.g. 2022" type="number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license">License Plate</Label>
                                    <Input id="license" placeholder="e.g. KCB 123A" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Vehicle Type</Label>
                                    <Select>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="van">Van</SelectItem>
                                            <SelectItem value="minibus">Minibus</SelectItem>
                                            <SelectItem value="suv">SUV</SelectItem>
                                            <SelectItem value="bus">Bus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Seating Capacity</Label>
                                    <Input id="capacity" placeholder="e.g. 14" type="number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fuel">Fuel Type</Label>
                                    <Select>
                                        <SelectTrigger id="fuel">
                                            <SelectValue placeholder="Select fuel type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="petrol">Petrol</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transmission">Transmission</Label>
                                    <Select>
                                        <SelectTrigger id="transmission">
                                            <SelectValue placeholder="Select transmission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rate">Daily Rate (KES)</Label>
                                <Input id="rate" placeholder="e.g. 8000" type="number" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images">Vehicle Images</Label>
                                <div className="border border-dashed rounded-md p-8 text-center">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-2">Drag and drop images here or click to browse</p>
                                    <Button variant="outline" size="sm">
                                        Upload Images
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Vehicle Description</Label>
                                <Textarea id="description" placeholder="Enter vehicle description and features" rows={4} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="insurance">Insurance Number</Label>
                                    <Input id="insurance" placeholder="Insurance policy number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Insurance Expiry</Label>
                                    <Input id="expiry" type="date" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" asChild>
                                <Link to="/vehicles">Cancel</Link>
                            </Button>
                            <Button className="bg-[#e31c39] hover:bg-[#e31c39]/90">Add Vehicle</Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
