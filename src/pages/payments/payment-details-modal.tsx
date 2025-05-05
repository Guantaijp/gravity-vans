// import { useState } from "react";
import type { Payment } from "../../services/payment-service.ts"
import { Button } from "../../components/ui/button.tsx"
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from "../../components/ui/badge";

interface PaymentDetailsModalProps {
    payment: Payment;
    onClose: () => void;
}

export default function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
    // Function to get badge based on status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Get booking ID from payment object
    const getBookingId = (payment: Payment) => {
        if (typeof payment.booking === 'object' && payment.booking?._id) {
            return payment.booking?._id;
        }
        return typeof payment.booking === 'string' ? payment.booking : 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                <h2 className="text-xl font-bold mb-4">Payment Details</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Payment ID</div>
                            <div className="font-medium">{payment._id}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Amount</div>
                            <div className="font-bold text-lg">KES {payment.amount.toLocaleString()}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Status</div>
                            <div>{getStatusBadge(payment.status)}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Payment Date</div>
                            <div>{new Date(payment.paymentDate || '').toLocaleDateString()}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Payment Method</div>
                            <div>{payment.method}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Reference</div>
                            <div>{payment.reference || 'N/A'}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium text-gray-500">Booking ID</div>
                            <div>{getBookingId(payment)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
