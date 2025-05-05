import type { Payment } from "../services/payment-service"

export function exportPaymentsToCSV(payments: Payment[]): void {
    // Define the CSV headers
    const headers = ["Payment ID", "Booking ID", "Date", "Amount", "Method", "Reference", "Status"]

    // Function to get booking ID from payment object
    const getBookingId = (payment: Payment) => {
        if (typeof payment.booking === "object" && payment.booking?._id) {
            return payment.booking?._id
        }
        return typeof payment.booking === "string" ? payment.booking : "N/A"
    }

    // Map payments to CSV rows
    const csvRows = payments.map((payment) => {
        return [
            payment._id,
            getBookingId(payment),
            new Date(payment.paymentDate || "").toLocaleDateString(),
            payment.amount.toString(),
            payment.method,
            payment.reference || "",
            payment.status,
        ]
    })

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payments-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
