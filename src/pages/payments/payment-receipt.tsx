"use client"

import { Button } from "../../components/ui/button"
// import Logo from "../../../public/Gravity-logo-400x400.png"

import type { Payment } from "../../services/payment-service.ts"

interface PaymentReceiptProps {
    payment: Payment
    onClose: () => void
}

export default function PaymentReceipt({ payment, onClose }: PaymentReceiptProps) {
    const printReceipt = () => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const receiptContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Payment Receipt</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .receipt {
        border: 1px solid #ddd;
        padding: 20px;
        margin-bottom: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .logo {
        max-width: 150px;
        margin: 0 auto;
        display: block;
      }
      .company-info {
        margin-top: 10px;
        font-size: 14px;
        line-height: 1.4;
      }
      .receipt-id {
        margin-top: 15px;
        color: #666;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .label {
        font-weight: bold;
        width: 150px;
      }
      .value {
        flex: 1;
      }
      .amount {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-top: 20px;
        border-top: 1px solid #ddd;
        padding-top: 10px;
        color: #FF0000;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 12px;
        color: #666;
      }
      @media print {
        .no-print {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <img src="../../../public/Gravity-logo-400x400.png" alt="Company Logo" class="logo">
        <div class="company-info">
          Total Energies Ruaraka, Thika Rd.<br>
          Opposite Safari Park Hotel, Office Room F-7<br>
          Nairobi, Kenya<br>
          info@gravityvansforhire.co.ke<br>
          www.gravityvansforhire.co.ke<br>
          +254725626434 / +25472395123
        </div>
        <div class="receipt-id">Receipt #${payment._id}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Payment Date:</div>
        <div class="value">${new Date(payment.paymentDate || "").toLocaleDateString()}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Booking ID:</div>
        <div class="value">${typeof payment.booking === "object" ? payment.booking?._id : payment.booking}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Payment Method:</div>
        <div class="value">${payment.method}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Reference:</div>
        <div class="value">${payment.reference || "N/A"}</div>
      </div>
      
      <div class="info-row">
        <div class="label">Status:</div>
        <div class="value">${payment.status}</div>
      </div>
      
      <div class="amount">
        Amount Paid: KES ${payment.amount.toLocaleString()}
      </div>
      
      <div class="footer">
        Thank you for choosing our services!<br>
        For any inquiries, please contact our support team.
      </div>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 20px;">
      <button onclick="window.print()" style="background-color: #FF0000; color: white; border: none; padding: 8px 16px; margin-right: 8px; cursor: pointer; border-radius: 4px;">Print Receipt</button>
      <button onclick="window.close()" style="background-color: #000000; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px;">Close</button>
    </div>
  </body>
  </html>
`

        printWindow.document.open()
        printWindow.document.write(receiptContent)
        printWindow.document.close()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Gravity Vans - Payment Receipt</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Payment ID:</div>
                        <div className="text-sm">{payment._id}</div>

                        <div className="text-sm font-medium">Date:</div>
                        <div className="text-sm">{new Date(payment.paymentDate || "").toLocaleDateString()}</div>

                        <div className="text-sm font-medium">Amount:</div>
                        <div className="text-sm font-bold">KES {payment.amount.toLocaleString()}</div>

                        <div className="text-sm font-medium">Method:</div>
                        <div className="text-sm">{payment.method}</div>

                        <div className="text-sm font-medium">Reference:</div>
                        <div className="text-sm">{payment.reference || "N/A"}</div>

                        <div className="text-sm font-medium">Status:</div>
                        <div className="text-sm">{payment.status}</div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={printReceipt}>Print Receipt</Button>
                </div>
            </div>
        </div>
    )
}