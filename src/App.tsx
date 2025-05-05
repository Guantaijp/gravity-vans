"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import { AuthProvider } from "./contexts/auth-context"
import { ProtectedRoute } from "./components/protected-route"
import LoginPage from "./pages/auth/LoginPage"
import Dashboard from "./pages/dashboard/Dashboard.tsx"
import VehiclesPage from "./pages/vehicles/VehiclesPage"
import NewVehiclePage from "./pages/vehicles/NewVehiclesPage"
import VehicleDetailsPage from "./pages/vehicles/VehiclesDetailsPage"
import BookingsPage from "./pages/bookings/BookingsPage"
import NewBookingPage from "./pages/bookings/NewBookingPage"
import BookingDetailsPage from "./pages/bookings/BookingDetailsPage"
import EditBookingPage from "./pages/bookings/EditBookingPage"
import InvoicePage from "./pages/bookings/InvoicePage"
import CustomersPage from "./pages/customers/CustomersPage"
import AddCustomerPage from "./pages/customers/AddCustomerPage"
import CustomerProfilePage from "./pages/customers/CustomerProfilePage"
import PaymentsPage from "./pages/payments/PaymentsPage"
import PaymentDetailsPage from "./pages/payments/PaymentsDetailsPage"
import RecordPaymentPage from "./pages/payments/RecordPaymentPage"
import DriversPage from "./pages/drivers/DriversPage"
import { Toaster } from "sonner"
import NewDriverPage from "./pages/drivers/NewDriverPage.tsx"
import DriverDetailsPage from "./pages/drivers/DriverDetailsPage.tsx"
import DriverEditPage from "./pages/drivers/DriverEditPage.tsx"
import VehicleEditPage from "./pages/vehicles/VehicleEditPage.tsx"
import { useAuth } from "./contexts/auth-context"
import {ReactElement} from "react";

interface RoleBasedRouteProps {
    element: ReactElement;
    allowedRoles?: string[];
    redirectPath?: string;
}


// Role-based route component
function RoleBasedRoute({
                            element,
                            allowedRoles = ["admin", "staff"],
                            redirectPath = "/bookings"
                        }: RoleBasedRouteProps) {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={redirectPath} replace />
    }

    return element
}

// Home redirect component based on user role
function HomeRedirect() {
    const { user } = useAuth()

    if (user?.role === "staff") {
        return <Navigate to="/bookings" replace />
    }

    return <Navigate to="/dashboard" replace />
}

function App() {
    return (
        <AuthProvider>
            <Toaster richColors position="top-right" />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <RootLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Home route - redirects based on role */}
                    <Route index element={<HomeRedirect />} />

                    {/* Admin-only routes */}
                    <Route path="dashboard" element={<RoleBasedRoute element={<Dashboard />} allowedRoles={["admin"]} />} />

                    {/* Payments routes - admin only */}
                    <Route path="payments" element={<RoleBasedRoute element={<PaymentsPage />} allowedRoles={["admin"]} />} />
                    <Route
                        path="payments/new"
                        element={<RoleBasedRoute element={<RecordPaymentPage />} allowedRoles={["admin"]} />}
                    />
                    <Route
                        path="payments/:id"
                        element={<RoleBasedRoute element={<PaymentDetailsPage />} allowedRoles={["admin"]} />}
                    />

                    {/* Vehicles routes - accessible by both admin and staff */}
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="vehicles/new" element={<NewVehiclePage />} />
                    <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
                    <Route path="vehicles/:id/edit" element={<VehicleEditPage />} />

                    {/* Bookings routes - accessible by both admin and staff */}
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="bookings/new" element={<NewBookingPage />} />
                    <Route path="bookings/:id" element={<BookingDetailsPage />} />
                    <Route path="bookings/:id/edit" element={<EditBookingPage />} />
                    <Route path="bookings/:id/invoice" element={<InvoicePage />} />

                    {/* Customers routes - accessible by both admin and staff */}
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="customers/new" element={<AddCustomerPage />} />
                    <Route path="customers/:id" element={<CustomerProfilePage />} />

                    {/* Drivers routes - accessible by both admin and staff */}
                    <Route path="drivers">
                        <Route index element={<DriversPage />} />
                        <Route path="new" element={<NewDriverPage />} />
                        <Route path=":id" element={<DriverDetailsPage />} />
                        <Route path=":id/edit" element={<DriverEditPage />} />
                    </Route>
                </Route>

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
