"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
    ArrowLeft,
    Save,
    Trash,
    Edit,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    AlertCircle,
    Calendar,
    DollarSign,
    ClipboardList
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../../components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import { Separator } from "../../components/ui/separator"
import { toast } from "sonner"
import CustomerService, { type Customer, type CustomerInput } from "../../services/customer-service"
import { useApi } from "../../hooks/use-api"

export default function CustomerProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [customer, setCustomer] = useState<Customer | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [bookingStats, setBookingStats] = useState({
        bookings: 0,
        totalSpent: 0,
        lastBooking: ''
    })

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        idNumber: "",
    })

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        idNumber: ""
    })

    const { execute: fetchCustomer, isLoading: isLoadingCustomer } = useApi(() => CustomerService.getById(id || ''))
    const { execute: fetchBookingStats, isLoading: isLoadingStats } = useApi(() => CustomerService.getBookingStats(id || ''))
    const { execute: updateCustomer, isLoading: isUpdating } = useApi((data?: CustomerInput) => {
        if (!data) return Promise.reject(new Error("Customer data is required"))
        return CustomerService.update(id || '', data)
    })
    const { execute: deleteCustomer, isLoading: isDeleting } = useApi(() => CustomerService.delete(id || ''))

    useEffect(() => {
        if (id) {
            loadCustomerDetails(id)  // Fetch customer when `id` changes
        }
    }, [id])

    const loadCustomerData = async () => {
        try {
            const customerData = await fetchCustomer()
            setCustomer(customerData)

            // Initialize form data with customer data
            setFormData({
                fullName: customerData.fullName || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                location: customerData.location || '',
                idNumber: customerData.idNumber || '',
            })

            // Fetch booking stats
            try {
                const stats = await fetchBookingStats()
                setBookingStats(stats)
            } catch (err) {
                console.error("Error loading booking stats:", err)
            }
        } catch (err) {
            console.error("Error loading customer:", err)
            toast.error("Error loading customer details")
        }
    }

    const validateForm = () => {
        const newErrors = {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            idNumber: ""
        }

        let isValid = true

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Customer name is required"
            isValid = false
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
            isValid = false
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required"
            isValid = false
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required"
            isValid = false
        }

        if (!formData.idNumber.trim()) {
            newErrors.idNumber = "ID Number is required"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleInputChange = (e:any) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        // Clear error when user starts typing
        if (name in errors) {
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (!id) {
            toast.error("Missing customer ID", {
                description: "Cannot update customer without a valid ID."
            })
            return
        }

        try {
            // Step 1: Perform the update
            const updatedCustomer = await updateCustomer(formData)
            console.log(updatedCustomer)

            if (!updatedCustomer) {
                throw new Error("Update returned no customer data.")
            }

            // Step 2: Update local state with the updated customer
            setCustomer(updatedCustomer)

            // Step 3: Fetch the updated customer details again
            await loadCustomerDetails(id)  // You can call the function that fetches the customer by ID

            // Step 4: Reset edit mode and show success
            setIsEditing(false)
            toast.success("Customer updated", {
                description: `${updatedCustomer.fullName}'s information has been updated successfully.`
            })
        } catch (err: any) {
            console.error("Customer update failed", err)

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "There was a problem updating the customer."

            toast.error("Failed to update customer", {
                description: message,
            })
        }
    }

    const loadCustomerDetails = async (id: string) => {
        try {
            const customer = await CustomerService.getById(id)
            setCustomer(customer)  // Update the state with the new customer details
        } catch (err) {
            console.error("Failed to fetch customer details:", err)
        }
    }


    const handleDelete = async () => {
        try {
            await deleteCustomer()
            toast.success("Customer deleted", {
                description: `${customer?.fullName} has been removed from your customer database.`
            })
            navigate("/customers")
        } catch (err:any) {
            toast.error("Failed to delete customer", {
                description: err.message || "There was a problem deleting the customer. Please try again."
            })
        }
    }

    const toggleEditMode = () => {
        if (isEditing) {
            // Reset form data to current customer data when canceling edit
            if (customer) {
                setFormData({
                    fullName: customer.fullName || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    location: customer.location || '',
                    idNumber: customer.idNumber || '',
                })
            }
            setErrors({
                fullName: "",
                email: "",
                phone: "",
                location: "",
                idNumber: ""
            })
        }
        setIsEditing(!isEditing)
    }

    if (isLoadingCustomer) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">Failed to load customer information.</p>
                <Button onClick={loadCustomerData} className="mt-4">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/customers">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{isEditing ? "Edit Customer" : "Customer Profile"}</h1>
                    </div>
                    {!isEditing && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={toggleEditMode}
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                    >
                                        <Trash className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete {customer.fullName}'s
                                            account and all associated booking records from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete Customer"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Profile Summary Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarFallback className="bg-[#0a192f] text-white text-xl">
                                        {customer.fullName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-center">{customer.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground text-center">{customer.idNumber}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Email</span>
                                    </div>
                                    <span className="text-sm font-medium">{customer.email}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                    </div>
                                    <span className="text-sm font-medium">{customer.phone}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Location</span>
                                    </div>
                                    <span className="text-sm font-medium">{customer.location}</span>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Member Since</span>
                                    </div>
                                    <span className="text-sm font-medium">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Total Bookings</span>
                                    </div>
                                    <span className="text-sm font-medium">{bookingStats.bookings || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Total Spent</span>
                                    </div>
                                    <span className="text-sm font-medium">
                    KES {(bookingStats.totalSpent || 0).toLocaleString()}
                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Last Booking</span>
                                    </div>
                                    <span className="text-sm font-medium">
                    {bookingStats.lastBooking || 'N/A'}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant="outline">
                                <Link to={`/bookings/new?customerId=${customer._id}`}>
                                    Create New Booking
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Main content area */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Customer Details</TabsTrigger>
                                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {isEditing ? "Edit Customer Information" : "Customer Information"}
                                        </CardTitle>
                                    </CardHeader>
                                    <form onSubmit={handleSubmit}>
                                        <CardContent className="space-y-6">
                                            {isEditing ? (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="fullName" className="flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            Full Name <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="fullName"
                                                            name="fullName"
                                                            placeholder="Enter customer's full name"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            className={errors.fullName ? "border-red-500" : ""}
                                                        />
                                                        {errors.fullName && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {errors.fullName}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4" />
                                                            Email Address <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            placeholder="customer@example.com"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className={errors.email ? "border-red-500" : ""}
                                                        />
                                                        {errors.email && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {errors.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            Phone Number <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            placeholder="+254 XXX XXX XXX"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            className={errors.phone ? "border-red-500" : ""}
                                                        />
                                                        {errors.phone && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {errors.phone}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="location" className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            Location <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="location"
                                                            name="location"
                                                            placeholder="City, Country"
                                                            value={formData.location}
                                                            onChange={handleInputChange}
                                                            className={errors.location ? "border-red-500" : ""}
                                                        />
                                                        {errors.location && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {errors.location}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="idNumber" className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            ID Number <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="idNumber"
                                                            name="idNumber"
                                                            placeholder="National ID or Passport Number"
                                                            value={formData.idNumber}
                                                            onChange={handleInputChange}
                                                            className={errors.idNumber ? "border-red-500" : ""}
                                                        />
                                                        {errors.idNumber && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {errors.idNumber}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">Full Name</Label>
                                                            <p className="mt-1">{customer.fullName}</p>
                                                        </div>

                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">Email Address</Label>
                                                            <p className="mt-1">{customer.email}</p>
                                                        </div>

                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">Phone Number</Label>
                                                            <p className="mt-1">{customer.phone}</p>
                                                        </div>

                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">Location</Label>
                                                            <p className="mt-1">{customer.location}</p>
                                                        </div>

                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">ID Number</Label>
                                                            <p className="mt-1">{customer.idNumber}</p>
                                                        </div>

                                                        <div>
                                                            <Label className="text-muted-foreground text-sm">Customer ID</Label>
                                                            <p className="mt-1 text-sm text-muted-foreground">{customer._id}</p>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </CardContent>

                                        {isEditing && (
                                            <CardFooter className="flex justify-between pt-5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={toggleEditMode}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="bg-[#e31c39] hover:bg-[#e31c39]/90"
                                                    disabled={isUpdating}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {isUpdating ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </form>
                                </Card>
                            </TabsContent>

                            <TabsContent value="bookings" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booking History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingStats ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sidebar-accent-foreground"></div>
                                            </div>
                                        ) : bookingStats.bookings > 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground mb-2">
                                                    This would show a list of {customer.fullName}'s bookings.
                                                </p>
                                                <p className="text-muted-foreground mb-4">
                                                    Total bookings: {bookingStats.bookings} | Total spent: KES {bookingStats.totalSpent.toLocaleString()}
                                                </p>
                                                <Button asChild className="bg-[#e31c39] hover:bg-[#e31c39]/90">
                                                    <Link to={`/bookings?customerId=${customer._id}`}>
                                                        View All Bookings
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-muted-foreground mb-4">No bookings found for this customer.</p>
                                                <Button asChild className="bg-[#e31c39] hover:bg-[#e31c39]/90">
                                                    <Link to={`/bookings/new?customerId=${customer._id}`}>
                                                        Create First Booking
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}