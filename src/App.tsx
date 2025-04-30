import {  Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import VehiclesPage from "./pages/vehicles/VehiclesPage";
import NewVehiclePage from "./pages/vehicles/NewVehiclesPage";
import VehicleDetailsPage from "./pages/vehicles/VehiclesDetailsPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import NewBookingPage from "./pages/bookings/NewBookingPage";
import BookingDetailsPage from "./pages/bookings/BookingDetailsPage";
import EditBookingPage from "./pages/bookings/EditBookingPage";
import InvoicePage from "./pages/bookings/InvoicePage";
import CustomersPage from "./pages/customers/CustomersPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import PaymentDetailsPage from "./pages/payments/PaymentsDetailsPage";
import RecordPaymentPage from "./pages/payments/RecordPaymentPage";

function App() {
    return (
        <AuthProvider>
            {/*<Router>*/}
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute><RootLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />

                        {/* Vehicles routes */}
                        <Route path="vehicles" element={<VehiclesPage />} />
                        <Route path="vehicles/new" element={<NewVehiclePage />} />
                        <Route path="vehicles/:id" element={<VehicleDetailsPage />} />

                        {/* Bookings routes */}
                        <Route path="bookings" element={<BookingsPage />} />
                        <Route path="bookings/new" element={<NewBookingPage />} />
                        <Route path="bookings/:id" element={<BookingDetailsPage />} />
                        <Route path="bookings/:id/edit" element={<EditBookingPage />} />
                        <Route path="bookings/:id/invoice" element={<InvoicePage />} />

                        {/* Customers routes */}
                        <Route path="customers" element={<CustomersPage />} />

                        {/* Payments routes */}
                        <Route path="payments" element={<PaymentsPage />} />
                        <Route path="payments/new" element={<RecordPaymentPage />} />
                        <Route path="payments/:id" element={<PaymentDetailsPage />} />
                    </Route>

                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            {/*</Router>*/}
        </AuthProvider>
    );
}

export default App;