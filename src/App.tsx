import { Routes, Route } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import Dashboard from "./pages/Dashboard"
import VehiclesPage from "./pages/vehicles/VehiclesPage"
import NewVehiclePage from "./pages/vehicles/NewVehiclesPage"
import VehicleDetailsPage from "./pages/vehicles/VehiclesDetailsPage"
import BookingsPage from "./pages/bookings/BookingsPage"
import NewBookingPage from "./pages/bookings/NewBookingPage"
import BookingDetailsPage from "./pages/bookings/BookingDetailsPage"
import EditBookingPage from "./pages/bookings/EditBookingPage"
import InvoicePage from "./pages/bookings/InvoicePage"
import CustomersPage from "./pages/customers/CustomersPage"
import PaymentsPage from "./pages/payments/PaymentsPage"
import PaymentDetailsPage from "./pages/payments/PaymentsDetailsPage"
import RecordPaymentPage from "./pages/payments/RecordPaymentPage"
function App() {
    return (
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="vehicles">
                    <Route index element={<VehiclesPage />} />
                    <Route path="new" element={<NewVehiclePage />} />
                    <Route path=":id" element={<VehicleDetailsPage />} />
                </Route>
                <Route path="bookings">
                    <Route index element={<BookingsPage />} />
                    <Route path="new" element={<NewBookingPage />} />
                    <Route path=":id">
                        <Route index element={<BookingDetailsPage />} />
                        <Route path="edit" element={<EditBookingPage />} />
                        <Route path="invoice" element={<InvoicePage />} />
                    </Route>
                </Route>
                <Route path="customers" element={<CustomersPage />} />
                <Route path="payments">
                    <Route index element={<PaymentsPage />} />
                    <Route path=":id" element={<PaymentDetailsPage />} />
                    <Route path="new" element={<RecordPaymentPage />} />
                </Route>
        </Route>
        </Routes>
    )
}

export default App
